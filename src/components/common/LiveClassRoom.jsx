import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera, CameraOff, Mic, MicOff, MonitorUp, PhoneOff, Users,
  Circle, Square, Loader2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  endLiveSession,
  getLiveParticipants,
  getLiveSession,
  getLiveSignals,
  joinLiveSession,
  leaveLiveSession,
  sendLiveSignal,
  createRecording,
} from "../../services/liveClassService";

const ICE = [{ urls: "stun:stun.l.google.com:19302" }];

export default function LiveClassRoom({ teacherMode = false }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const localVideo = useRef(null);
  const teacherVideo = useRef(null);
  const streamRef = useRef(null);
  const cameraTrackRef = useRef(null);
  const screenRef = useRef(null);
  const peers = useRef(new Map());
  const recorderRef = useRef(null);
  const recordingChunks = useRef([]);
  const disposed = useRef(false);
  const isTeacherRef = useRef(Boolean(teacherMode));

  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    isTeacherRef.current = Boolean(teacherMode || session?.teacher_id === user?.id);
  }, [teacherMode, session?.teacher_id, user?.id]);

  const sendOffer = useCallback(async (studentId) => {
    const pc = peers.current.get(studentId);
    if (!pc || pc.signalingState !== "stable") return;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await sendLiveSignal({
      session_id: sessionId,
      recipient_id: studentId,
      signal_type: "offer",
      payload: offer,
    });
  }, [sessionId]);

  const makeTeacherPeer = useCallback(async (studentId) => {
    if (!streamRef.current || !studentId || peers.current.has(studentId)) return;

    const pc = new RTCPeerConnection({ iceServers: ICE });
    peers.current.set(studentId, pc);

    const outgoingVideo = screenRef.current?.getVideoTracks?.()[0] || cameraTrackRef.current;
    if (outgoingVideo) pc.addTrack(outgoingVideo, streamRef.current);
    streamRef.current.getAudioTracks().forEach((track) => pc.addTrack(track, streamRef.current));

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      sendLiveSignal({
        session_id: sessionId,
        recipient_id: studentId,
        signal_type: "ice-candidate",
        payload: event.candidate.toJSON(),
      }).catch(console.error);
    };

    pc.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
        if (pc.connectionState !== "disconnected") {
          pc.close();
          peers.current.delete(studentId);
        }
      }
    };

    await sendOffer(studentId);
  }, [sessionId, sendOffer]);

  useEffect(() => {
    disposed.current = false;

    let channelRefForEffect = null;

    const boot = async () => {
      try {
        if (!user?.id) throw new Error("You must be signed in.");
        if (!sessionId) throw new Error("Live session ID is missing.");

        const loadedSession = await getLiveSession(sessionId);
        if (disposed.current) return;

        if (!["live", "scheduled"].includes(loadedSession.status)) {
          throw new Error("This live class is no longer available.");
        }

        setSession(loadedSession);

        const media = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (disposed.current) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = media;
        cameraTrackRef.current = media.getVideoTracks()[0] || null;

        if (localVideo.current) {
          localVideo.current.srcObject = media;
          await localVideo.current.play().catch(() => {});
        }

        await joinLiveSession(sessionId, user.id);

        const refreshParticipants = async () => {
          const rows = await getLiveParticipants(sessionId).catch(() => []);
          if (!disposed.current) setParticipants(rows);
          return rows;
        };

        // Create and fully configure the channel before subscribing.
        // Supabase does not allow postgres_changes handlers to be added after
        // subscribe(), and React 19 development/StrictMode can mount effects
        // more than once. Keep this channel local to this effect instance so
        // an older cleanup can never remove or mutate a newer channel.
        const channel = supabase.channel(`live-class-${sessionId}-${user.id}-${crypto.randomUUID()}`);
        channelRefForEffect = channel;

        channel.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "live_class_participants",
            filter: `session_id=eq.${sessionId}`,
          },
          async (payload) => {
            const rows = await refreshParticipants();

            if (
              isTeacherRef.current &&
              payload.eventType === "INSERT" &&
              payload.new?.user_id &&
              payload.new.user_id !== user.id
            ) {
              await makeTeacherPeer(payload.new.user_id).catch(console.error);
            }
          }
        );

        channel.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "live_class_signals",
            filter: `session_id=eq.${sessionId}`,
          },
          async (payload) => {
            const signal = payload.new;
            if (signal.recipient_id !== user.id) return;

            try {
              if (signal.signal_type === "offer" && !isTeacherRef.current) {
                let pc = peers.current.get(signal.sender_id);

                if (!pc) {
                  pc = new RTCPeerConnection({ iceServers: ICE });
                  peers.current.set(signal.sender_id, pc);

                  media.getTracks().forEach((track) => pc.addTrack(track, media));

                  pc.onicecandidate = (event) => {
                    if (!event.candidate) return;
                    sendLiveSignal({
                      session_id: sessionId,
                      recipient_id: signal.sender_id,
                      signal_type: "ice-candidate",
                      payload: event.candidate.toJSON(),
                    }).catch(console.error);
                  };

                  pc.ontrack = (event) => {
                    const remote = event.streams?.[0];
                    if (remote && teacherVideo.current) {
                      teacherVideo.current.srcObject = remote;
                      teacherVideo.current.play().catch(() => {});
                    }
                  };
                }

                await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                await sendLiveSignal({
                  session_id: sessionId,
                  recipient_id: signal.sender_id,
                  signal_type: "answer",
                  payload: answer,
                });
              } else if (signal.signal_type === "answer" && isTeacherRef.current) {
                const pc = peers.current.get(signal.sender_id);
                if (pc && pc.signalingState !== "stable") {
                  await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
                }
              } else if (signal.signal_type === "ice-candidate") {
                const pc = peers.current.get(signal.sender_id);
                if (pc && signal.payload) {
                  await pc.addIceCandidate(new RTCIceCandidate(signal.payload)).catch(console.warn);
                }
              }
            } catch (signalError) {
              console.error("WebRTC signal error:", signalError);
            }
          }
        );

        if (disposed.current) {
          supabase.removeChannel(channel);
          return;
        }

        const subscriptionStatus = await new Promise((resolve, reject) => {
          let settled = false;
          const timeout = window.setTimeout(() => {
            if (!settled) {
              settled = true;
              reject(new Error("Realtime connection timed out."));
            }
          }, 15000);

          channel.subscribe((status, subscribeError) => {
            if (settled) return;
            if (status === "SUBSCRIBED") {
              settled = true;
              window.clearTimeout(timeout);
              resolve(status);
              return;
            }
            if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) {
              settled = true;
              window.clearTimeout(timeout);
              reject(subscribeError || new Error(`Realtime channel ${status.toLowerCase().replaceAll("_", " ")}.`));
            }
          });
        });

        if (subscriptionStatus !== "SUBSCRIBED") {
          throw new Error("Unable to connect to live classroom realtime channel.");
        }

        if (disposed.current) {
          supabase.removeChannel(channel);
          return;
        }

        const existingParticipants = await refreshParticipants();
        const existingSignals = await getLiveSignals(sessionId).catch(() => []);

        if (isTeacherRef.current) {
          for (const participant of existingParticipants) {
            if (participant.user_id !== user.id) {
              await makeTeacherPeer(participant.user_id).catch(console.error);
            }
          }
        } else {
          const offer = existingSignals.find(
            (item) =>
              item.signal_type === "offer" &&
              item.recipient_id === user.id
          );

          if (offer) {
            let pc = peers.current.get(offer.sender_id);
            if (!pc) {
              pc = new RTCPeerConnection({ iceServers: ICE });
              peers.current.set(offer.sender_id, pc);
              media.getTracks().forEach((track) => pc.addTrack(track, media));

              pc.onicecandidate = (event) => {
                if (!event.candidate) return;
                sendLiveSignal({
                  session_id: sessionId,
                  recipient_id: offer.sender_id,
                  signal_type: "ice-candidate",
                  payload: event.candidate.toJSON(),
                }).catch(console.error);
              };

              pc.ontrack = (event) => {
                const remote = event.streams?.[0];
                if (remote && teacherVideo.current) {
                  teacherVideo.current.srcObject = remote;
                  teacherVideo.current.play().catch(() => {});
                }
              };
            }

            await pc.setRemoteDescription(new RTCSessionDescription(offer.payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            await sendLiveSignal({
              session_id: sessionId,
              recipient_id: offer.sender_id,
              signal_type: "answer",
              payload: answer,
            });
          }
        }

        if (!disposed.current) setLoading(false);
      } catch (bootError) {
        console.error("Live classroom boot error:", bootError);
        if (!disposed.current) {
          setError(bootError?.message || "Unable to open live class.");
          setLoading(false);
        }
      }
    };

    boot();

    return () => {
      disposed.current = true;

      if (channelRefForEffect) {
        supabase.removeChannel(channelRefForEffect);
      }

      peers.current.forEach((pc) => pc.close());
      peers.current.clear();

      streamRef.current?.getTracks().forEach((track) => track.stop());
      screenRef.current?.getTracks().forEach((track) => track.stop());

      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }

      leaveLiveSession(sessionId, user?.id).catch(() => {});
    };
  }, [sessionId, user?.id, teacherMode, makeTeacherPeer]);

  const toggle = (kind) => {
    const tracks = streamRef.current?.getTracks().filter((track) => track.kind === kind) || [];
    const next = !tracks.every((track) => track.enabled);
    tracks.forEach((track) => { track.enabled = next; });

    if (kind === "audio") setMic(next);
    if (kind === "video") setCamera(next);
  };

  const stopScreenSharing = useCallback(async () => {
    const cameraTrack = cameraTrackRef.current;
    screenRef.current?.getTracks().forEach((track) => track.stop());
    screenRef.current = null;

    for (const pc of peers.current.values()) {
      const sender = pc.getSenders().find((item) => item.track?.kind === "video");
      if (sender && cameraTrack) await sender.replaceTrack(cameraTrack);
    }

    if (localVideo.current && streamRef.current) {
      localVideo.current.srcObject = streamRef.current;
      await localVideo.current.play().catch(() => {});
    }

    setSharing(false);
  }, []);

  const shareScreen = useCallback(async () => {
    if (!isTeacherRef.current) return;

    if (sharing) {
      await stopScreenSharing();
      return;
    }

    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const screenTrack = screen.getVideoTracks()[0];
      if (!screenTrack) throw new Error("No screen track was returned.");

      screenRef.current = screen;

      for (const pc of peers.current.values()) {
        const sender = pc.getSenders().find((item) => item.track?.kind === "video");
        if (sender) await sender.replaceTrack(screenTrack);
      }

      if (localVideo.current) {
        localVideo.current.srcObject = screen;
        await localVideo.current.play().catch(() => {});
      }

      screenTrack.onended = () => {
        stopScreenSharing().catch(console.error);
      };

      setSharing(true);
    } catch (shareError) {
      if (shareError?.name !== "NotAllowedError") {
        setError(shareError?.message || "Screen sharing could not be started.");
      }
    }
  }, [sharing, stopScreenSharing]);

  const startRecording = async () => {
    if (!isTeacherRef.current || recording) return;

    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const combined = new MediaStream([
        ...screen.getVideoTracks(),
        ...micStream.getAudioTracks(),
        ...screen.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : "";

      const recorder = new MediaRecorder(
        combined,
        mimeType ? { mimeType } : undefined
      );

      recordingChunks.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) recordingChunks.current.push(event.data);
      };

      recorder.onstop = async () => {
        setUploading(true);
        try {
          const blob = new Blob(recordingChunks.current, { type: "video/webm" });
          await createRecording(sessionId, user.id, blob);
        } catch (recordError) {
          setError(recordError?.message || "Recording upload failed.");
        } finally {
          combined.getTracks().forEach((track) => track.stop());
          setUploading(false);
          setRecording(false);
        }
      };

      recorderRef.current = recorder;
      recorder.start(1000);
      setRecording(true);
    } catch (recordError) {
      setError(recordError?.message || "Screen recording permission was denied.");
    }
  };

  const stopRecording = () => recorderRef.current?.stop();

  const leave = async () => {
    try {
      if (recording && recorderRef.current) recorderRef.current.stop();
      if (isTeacherRef.current) await endLiveSession(sessionId);
    } catch (leaveError) {
      console.error("Leave live class error:", leaveError);
    } finally {
      navigate(isTeacherRef.current ? "/teacher/live-classes" : "/student/live-classes");
    }
  };

  const courseTitle =
    session?.courses?.title ||
    session?.class_schedules?.courses?.title ||
    session?.class_schedules?.title ||
    "Live Class";

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin" />
        <span className="ml-2">Opening live classroom…</span>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h2 className="text-xl font-bold">Live class unavailable</h2>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <button
          className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => navigate(isTeacherRef.current ? "/teacher/live-classes" : "/student/live-classes")}
        >
          Back to live classes
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-7xl p-4 sm:p-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">EduVerse • Live classroom</p>
            <h1 className="text-xl font-bold">{session?.title || "Live Class"}</h1>
            <p className="text-sm text-slate-400">{courseTitle}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span><Users className="mr-1 inline" size={15} />{participants.length} participants</span>
            {recording && <span className="rounded-full bg-red-600 px-3 py-1"><Circle className="mr-1 inline fill-current" size={9} />Recording</span>}
            {uploading && <span>Uploading recording…</span>}
          </div>
        </header>

        {error && <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">{error}</div>}

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
            {isTeacherRef.current ? (
              <video ref={localVideo} autoPlay muted playsInline className="h-full w-full object-contain" />
            ) : (
              <video ref={teacherVideo} autoPlay playsInline className="h-full w-full object-contain" />
            )}
            <span className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1 text-xs">
              {isTeacherRef.current ? `You • ${sharing ? "Screen shared" : "Live"}` : "Teacher"}
            </span>
          </div>

          <aside className="rounded-2xl bg-slate-900 p-4">
            <h2 className="font-semibold">Participants</h2>
            <div className="mt-3 space-y-2">
              {participants.map((participant) => (
                <div key={participant.user_id} className="rounded-xl bg-slate-800 px-3 py-2 text-sm">
                  {participant.profiles?.full_name || "Participant"}
                  {participant.user_id === session?.teacher_id && (
                    <span className="ml-2 text-xs text-blue-300">Teacher</span>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button onClick={() => toggle("audio")} className={`rounded-full p-4 ${mic ? "bg-slate-800" : "bg-red-600"}`} title={mic ? "Mute microphone" : "Unmute microphone"}>
            {mic ? <Mic /> : <MicOff />}
          </button>
          <button onClick={() => toggle("video")} className={`rounded-full p-4 ${camera ? "bg-slate-800" : "bg-red-600"}`} title={camera ? "Turn camera off" : "Turn camera on"}>
            {camera ? <Camera /> : <CameraOff />}
          </button>

          {isTeacherRef.current && (
            <>
              <button onClick={shareScreen} className={`rounded-full p-4 ${sharing ? "bg-blue-600" : "bg-slate-800"}`} title={sharing ? "Stop sharing" : "Share screen"}>
                <MonitorUp />
              </button>
              <button onClick={recording ? stopRecording : startRecording} disabled={uploading} className={`rounded-full p-4 ${recording ? "bg-red-600" : "bg-slate-800"}`} title={recording ? "Stop recording" : "Record screen"}>
                {recording ? <Square /> : <Circle />}
              </button>
            </>
          )}

          <button onClick={leave} className="rounded-full bg-red-600 px-6 py-4" title={isTeacherRef.current ? "End live class" : "Leave live class"}>
            <PhoneOff />
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          Live audio/video uses browser WebRTC. Screen sharing is sent to connected students through the live classroom connection.
        </p>
      </div>
    </div>
  );
}
