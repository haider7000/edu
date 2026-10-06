import { supabase } from "../lib/supabase";

const fail = (error) => { if (error) throw error; };

export async function getLiveSession(sessionId) {
  const { data, error } = await supabase
    .from("live_class_sessions")
    .select("id,class_id,course_id,teacher_id,title,status,started_at,ended_at,created_at,courses:course_id(id,title),class_schedules:class_id(id,course_id,title,description,starts_at,ends_at,courses:course_id(id,title))")
    .eq("id", sessionId)
    .single();
  fail(error); return data;
}

export async function getLiveSessionByClass(classId) {
  if (!classId) return null;
  const { data, error } = await supabase
    .from("live_class_sessions")
    .select("id,class_id,course_id,teacher_id,title,status,started_at,ended_at,created_at,courses:course_id(id,title),class_schedules:class_id(id,course_id,title,description,starts_at,ends_at,courses:course_id(id,title))")
    .eq("class_id", classId)
    .in("status", ["scheduled", "live"])
    .maybeSingle();
  fail(error); return data;
}

export async function getActiveLiveSessionByCourse(courseId) {
  if (!courseId) return null;
  const { data, error } = await supabase
    .from("live_class_sessions")
    .select("id,class_id,course_id,teacher_id,title,status,started_at,ended_at,created_at,courses:course_id(id,title)")
    .eq("course_id", courseId)
    .eq("status", "live")
    .maybeSingle();
  fail(error);
  return data;
}

export async function startLiveSession(classId, teacherId, title) {
  const existing = await getLiveSessionByClass(classId);
  if (existing?.status === "live") return existing;
  if (existing?.status === "scheduled") {
    const { data, error } = await supabase.from("live_class_sessions").update({ status: "live", started_at: new Date().toISOString(), ended_at: null }).eq("id", existing.id).select("*").single();
    fail(error); return data;
  }
  const { data, error } = await supabase.from("live_class_sessions").insert({ class_id: classId, teacher_id: teacherId, title: title || "Live Class", status: "live", started_at: new Date().toISOString() }).select("*").single();
  fail(error); return data;
}

export async function startInstantLiveSession(courseId, teacherId, title) {
  if (!courseId || !teacherId) throw new Error("Course and teacher are required.");
  const { data: existing, error: existingError } = await supabase
    .from("live_class_sessions")
    .select("*")
    .eq("course_id", courseId)
    .eq("teacher_id", teacherId)
    .eq("status", "live")
    .maybeSingle();
  fail(existingError);
  if (existing) return existing;
  const { data, error } = await supabase
    .from("live_class_sessions")
    .insert({ course_id: courseId, class_id: null, teacher_id: teacherId, title: title || "Live Class", status: "live", started_at: new Date().toISOString() })
    .select("*")
    .single();
  fail(error); return data;
}

export async function getStudentLiveSessions(studentId) {
  const { data: enrollments, error: ee } = await supabase.from("enrollments").select("course_id").eq("student_id", studentId).in("status", ["active", "completed"]);
  fail(ee);
  const courseIds = [...new Set((enrollments || []).map(x => x.course_id).filter(Boolean))];
  if (!courseIds.length) return [];
  const { data, error } = await supabase.from("live_class_sessions").select("id,class_id,course_id,teacher_id,title,status,started_at,ended_at,created_at,courses:course_id(id,title),class_schedules:class_id(id,course_id,title,description,starts_at,ends_at,courses:course_id(id,title))").in("course_id", courseIds).in("status", ["live","scheduled"]).order("started_at", { ascending: false });
  fail(error); return data || [];
}

export async function endLiveSession(sessionId) {
  const { data, error } = await supabase.from("live_class_sessions").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", sessionId).select("*").single();
  fail(error); return data;
}

export async function getLiveParticipants(sessionId) {
  const { data, error } = await supabase.from("live_class_participants").select("session_id,user_id,joined_at,profiles:user_id(id,full_name,email,avatar_url)").eq("session_id", sessionId);
  fail(error); return data || [];
}

export async function joinLiveSession(sessionId, userId) {
  const { data, error } = await supabase.from("live_class_participants").upsert({ session_id: sessionId, user_id: userId }, { onConflict: "session_id,user_id" }).select("*").single();
  fail(error); return data;
}

export async function leaveLiveSession(sessionId, userId) {
  const { error } = await supabase.from("live_class_participants").delete().eq("session_id", sessionId).eq("user_id", userId);
  fail(error);
}

export async function sendLiveSignal({ session_id, recipient_id, signal_type, payload }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("You must be signed in.");
  const { data, error } = await supabase.from("live_class_signals").insert({ session_id, sender_id: user.id, recipient_id, signal_type, payload: payload || {} }).select().single();
  fail(error); return data;
}

export async function getLiveSignals(sessionId) {
  const { data, error } = await supabase.from("live_class_signals").select("id,session_id,sender_id,recipient_id,signal_type,payload,created_at").eq("session_id", sessionId).order("created_at", { ascending: true });
  fail(error); return data || [];
}

export async function createRecording(sessionId, userId, file) {
  const safeName = `${sessionId}/${userId}-${Date.now()}.webm`;
  const { error: uploadError } = await supabase.storage.from("class-recordings").upload(safeName, file, { contentType: "video/webm", upsert: false });
  fail(uploadError);
  const { data, error } = await supabase.from("live_class_recordings").insert({ session_id: sessionId, teacher_id: userId, storage_path: safeName, mime_type: file.type || "video/webm", file_size: file.size }).select().single();
  fail(error); return data;
}

export async function getTeacherRecordings(teacherId) {
  const { data, error } = await supabase.from("live_class_recordings").select("id,session_id,teacher_id,storage_path,mime_type,file_size,created_at,live_class_sessions:session_id(id,title,class_id,class_schedules:class_id(id,course_id,title,courses:course_id(id,title)))").eq("teacher_id", teacherId).order("created_at", { ascending: false });
  fail(error);
  return Promise.all((data || []).map(async r => {
    const { data: signed, error: signedError } = await supabase.storage.from("class-recordings").createSignedUrl(r.storage_path, 60 * 60);
    if (signedError) throw signedError;
    return { ...r, recording_url: signed.signedUrl };
  }));
}

export async function getStudentRecordings(studentId) {
  const { data: enrollments, error: enrollmentError } = await supabase.from("enrollments").select("course_id").eq("student_id", studentId).in("status", ["active", "completed"]);
  fail(enrollmentError);
  const courseIds = [...new Set((enrollments || []).map(x => x.course_id).filter(Boolean))];
  if (!courseIds.length) return [];
  const { data: classes, error: classError } = await supabase.from("class_schedules").select("id,course_id").in("course_id", courseIds);
  fail(classError);
  const classIds = (classes || []).map(x => x.id);
  if (!classIds.length) return [];
  const { data: sessions, error: sessionError } = await supabase.from("live_class_sessions").select("id,title,class_id,class_schedules:class_id(id,course_id,title,courses:course_id(id,title))").in("class_id", classIds);
  fail(sessionError);
  const sessionIds = (sessions || []).map(x => x.id);
  if (!sessionIds.length) return [];
  const { data, error } = await supabase.from("live_class_recordings").select("id,session_id,teacher_id,storage_path,mime_type,file_size,created_at").in("session_id", sessionIds).order("created_at", { ascending: false });
  fail(error);
  const sessionMap = new Map((sessions || []).map(x => [x.id, x]));
  return Promise.all((data || []).map(async r => {
    const { data: signed, error: signedError } = await supabase.storage.from("class-recordings").createSignedUrl(r.storage_path, 60 * 60);
    if (signedError) throw signedError;
    return { ...r, recording_url: signed.signedUrl, live_class_sessions: sessionMap.get(r.session_id) };
  }));
}
