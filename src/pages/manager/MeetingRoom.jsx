import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Users, Video } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMeetingRoom, getMeetingSignals, sendMeetingSignal, updateMeetingStatus } from "../../services/managerService";
import { LoadingState } from "../../components/manager/ManagerUI";
import { supabase } from "../../lib/supabase";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export default function MeetingRoom(){
 const {roomId}=useParams();const navigate=useNavigate();const {user,role}=useAuth();
 const localVideo=useRef(null),remoteVideo=useRef(null),streamRef=useRef(null),pcRef=useRef(null),channelRef=useRef(null),candidateQueue=useRef([]);
 const [room,setRoom]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[connected,setConnected]=useState(false),[mic,setMic]=useState(true),[camera,setCamera]=useState(true);
 const isHost=room?.manager_id===user?.id;
 useEffect(()=>{
   let disposed=false;
   const start=async()=>{
    try{
     const r=await getMeetingRoom(roomId);if(disposed)return;setRoom(r);const host=r.manager_id===user.id;
     const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});if(disposed){stream.getTracks().forEach(t=>t.stop());return}
     streamRef.current=stream;if(localVideo.current)localVideo.current.srcObject=stream;
     const pc=new RTCPeerConnection({iceServers:ICE_SERVERS});pcRef.current=pc;
     stream.getTracks().forEach(track=>pc.addTrack(track,stream));
     pc.ontrack=e=>{if(remoteVideo.current)remoteVideo.current.srcObject=e.streams[0]};
     pc.onconnectionstatechange=()=>{const state=pc.connectionState;setConnected(state==="connected");if(["failed","disconnected"].includes(state))setError("The video connection was interrupted. Check both cameras/microphones and network access.")};
     pc.onicecandidate=e=>{if(e.candidate)sendMeetingSignal({room_id:roomId,recipient_id:host?r.teacher_id:r.manager_id,signal_type:"ice-candidate",payload:e.candidate.toJSON()}).catch(console.error)};
     const channel=supabase.channel(`meeting-signals-${roomId}`);
     channelRef.current=channel;
     channel.on("postgres_changes",{event:"INSERT",schema:"public",table:"meeting_signals",filter:`room_id=eq.${roomId}`},async payload=>{
       const s=payload.new;if(s.recipient_id!==user.id)return;
       try{
        if(s.signal_type==="offer"){
          await pc.setRemoteDescription(new RTCSessionDescription(s.payload));
          for(const c of candidateQueue.current){await pc.addIceCandidate(c).catch(()=>{});}candidateQueue.current=[];
          const answer=await pc.createAnswer();await pc.setLocalDescription(answer);
          await sendMeetingSignal({room_id:roomId,recipient_id:r.manager_id,signal_type:"answer",payload:answer});
        }else if(s.signal_type==="answer"){
          await pc.setRemoteDescription(new RTCSessionDescription(s.payload));
          for(const c of candidateQueue.current){await pc.addIceCandidate(c).catch(()=>{});}candidateQueue.current=[];
        }else if(s.signal_type==="ice-candidate"){
          const c=new RTCIceCandidate(s.payload);
          if(pc.remoteDescription)await pc.addIceCandidate(c).catch(()=>{});else candidateQueue.current.push(c);
        }else if(s.signal_type==="leave"){setConnected(false);setError("The other participant left the meeting.")}
       }catch(e){console.error(e);setError("Could not establish the video connection.")}
     });
     await channel.subscribe();
     const existing=await getMeetingSignals(roomId);
     for(const s of existing.filter(x=>x.recipient_id===user.id)){
       if(s.signal_type==="offer"&&!pc.remoteDescription){
         await pc.setRemoteDescription(new RTCSessionDescription(s.payload));
         const answer=await pc.createAnswer();await pc.setLocalDescription(answer);
         await sendMeetingSignal({room_id:roomId,recipient_id:r.manager_id,signal_type:"answer",payload:answer});
       }else if(s.signal_type==="answer"&&!pc.remoteDescription&&host){
         await pc.setRemoteDescription(new RTCSessionDescription(s.payload));
       }else if(s.signal_type==="ice-candidate"){
         const c=new RTCIceCandidate(s.payload);if(pc.remoteDescription)await pc.addIceCandidate(c).catch(()=>{});else candidateQueue.current.push(c);
       }
     }
     if(host){
       const offer=await pc.createOffer();await pc.setLocalDescription(offer);
       await sendMeetingSignal({room_id:roomId,recipient_id:r.teacher_id,signal_type:"offer",payload:offer});
       if(r.status!=="live")await updateMeetingStatus(roomId,"live");
     }
     if(!disposed)setLoading(false);
    }catch(e){console.error(e);if(!disposed){setError(e.message||"Unable to open meeting.");setLoading(false)}}
   };
   if(user?.id)start();
   return()=>{disposed=true;channelRef.current&&supabase.removeChannel(channelRef.current);streamRef.current?.getTracks().forEach(t=>t.stop());pcRef.current?.close()};
 },[roomId,user?.id]);

 const toggle=(kind)=>{const tracks=streamRef.current?.getTracks().filter(t=>t.kind===kind)||[];const next=!tracks.every(t=>t.enabled);tracks.forEach(t=>t.enabled=next);kind==="audio"?setMic(next):setCamera(next)};
 const leave=async()=>{try{if(room)await sendMeetingSignal({room_id:room.id,recipient_id:isHost?room.teacher_id:room.manager_id,signal_type:"leave",payload:{}});if(isHost)await updateMeetingStatus(room.id,"ended")}catch(e){console.error(e)}finally{navigate(isHost?"/manager/meetings":"/teacher/live-classes")}};
 if(loading)return <LoadingState text="Opening secure in-site meeting…"/>;
 if(error&&!room)return <div className="mx-auto max-w-xl p-8 text-center"><Video className="mx-auto text-red-500" size={40}/><h2 className="mt-4 text-xl font-bold">Meeting unavailable</h2><p className="mt-2 text-sm text-slate-500">{error}</p><button onClick={()=>navigate(-1)} className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Go back</button></div>;
 return <div className="min-h-[calc(100vh-64px)] bg-slate-950 p-4 text-white sm:p-6">
  <div className="mx-auto max-w-7xl">
   <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-slate-400">EduVerse • In-site meeting</p><h1 className="mt-1 text-xl font-bold">{room?.title}</h1><p className="text-sm text-slate-400">{connected?"Connected":"Waiting for the other participant…"} · {role}</p></div><div className="rounded-full bg-slate-800 px-3 py-1.5 text-xs"><Users size={14} className="mr-1 inline"/>2-person private room</div></div>
   {error&&<div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">{error}</div>}
   <div className="grid gap-4 lg:grid-cols-2"><div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/10"><video ref={localVideo} autoPlay muted playsInline className="h-full w-full object-cover"/><span className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-2.5 py-1 text-xs">You</span></div><div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/10"><video ref={remoteVideo} autoPlay playsInline className="h-full w-full object-cover"/>{!connected&&<div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">Waiting for teacher / manager…</div>}<span className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-2.5 py-1 text-xs">Other participant</span></div></div>
   <div className="mt-5 flex justify-center gap-3"><button onClick={()=>toggle("audio")} className={`rounded-full p-4 ${mic?"bg-slate-800":"bg-red-600"}`}>{mic?<Mic size={20}/>:<MicOff size={20}/>}</button><button onClick={()=>toggle("video")} className={`rounded-full p-4 ${camera?"bg-slate-800":"bg-red-600"}`}>{camera?<Camera size={20}/>:<CameraOff size={20}/>}</button><button onClick={leave} className="rounded-full bg-red-600 px-5 py-4"><PhoneOff size={20}/></button></div>
   <p className="mt-5 text-center text-xs text-slate-500">Video and audio stay in the browser using WebRTC. No Zoom, Google Meet or Teams account is required.</p>
  </div>
 </div>;
}
