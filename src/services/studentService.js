import { supabase } from "../lib/supabase";

async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("You must be signed in.");
  return data.user;
}


export async function requestCourseAdmission(courseId) {
  if (!courseId) throw new Error("Course is required.");
  await requireUser();
  const { data, error } = await supabase.rpc("request_course_admission", { p_course_id: courseId });
  if (error) throw error;
  return data;
}

export async function getMyAdmissionState() {
  const user = await requireUser();

  const { data: enrollments, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id,course_id,status,enrolled_at,courses(id,title,instructor_id)")
    .eq("student_id", user.id)
    .in("status", ["active", "completed"])
    .order("enrolled_at", { ascending: false });
  if (enrollmentError) throw enrollmentError;
  if ((enrollments || []).length) return { kind: "approved", enrollment: enrollments[0] };

  const { data: admissions, error: admissionError } = await supabase
    .from("admissions")
    .select("id,course_id,course_name,status,created_at,reviewed_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });
  if (admissionError) throw admissionError;

  const admission = (admissions || [])[0] || null;
  if (!admission) return { kind: "no_course", admission: null };
  if (["pending", "interview", "approved"].includes(admission.status)) {
    // approved without an active enrollment means approval transaction has not completed yet; keep access locked.
    return { kind: admission.status === "approved" ? "pending" : admission.status, admission };
  }
  if (admission.status === "rejected") return { kind: "rejected", admission };
  return { kind: "no_course", admission };
}

async function getStudentCourseIds(userId) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("student_id", userId)
    .in("status", ["active", "completed"]);
  if (error) throw error;
  return (data || []).map((row) => row.course_id);
}

export async function getMyEnrollments() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("enrollments")
    .select("id,course_id,status,progress,enrolled_at,completed_at,courses(id,title,slug,description,thumbnail,price,duration_hours,instructor_id)")
    .eq("student_id", user.id)
    .order("enrolled_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMyCourses() {
  return getMyEnrollments();
}

export async function getCourseDetails(courseId) {
  const user = await requireUser();
  if (!courseId) return null;

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id,status,progress,enrolled_at,completed_at")
    .eq("course_id", courseId)
    .eq("student_id", user.id)
    .maybeSingle();
  if (enrollmentError) throw enrollmentError;
  if (!enrollment) return null;

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id,title,slug,description,thumbnail,price,duration_hours,instructor_id,status,course_modules(id,title,description,sort_order,lessons(id,title,description,duration_minutes,sort_order,is_published))")
    .eq("id", courseId)
    .maybeSingle();
  if (courseError) throw courseError;
  if (!course) return null;

  const lessonIds = (course.course_modules || []).flatMap((m) => (m.lessons || []).map((l) => l.id));
  let progressRows = [];
  if (lessonIds.length) {
    const { data, error } = await supabase
      .from("lesson_progress")
      .select("lesson_id,completed,completed_at")
      .eq("student_id", user.id)
      .in("lesson_id", lessonIds);
    if (error) throw error;
    progressRows = data || [];
  }

  const progressMap = new Map(progressRows.map((row) => [row.lesson_id, row]));
  const modules = (course.course_modules || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((module) => ({
      ...module,
      lessons: (module.lessons || [])
        .filter((lesson) => lesson.is_published)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((lesson) => ({ ...lesson, progress: progressMap.get(lesson.id) || null })),
    }));

  const lessons = modules.flatMap((m) => m.lessons);
  const completedLessons = lessons.filter((lesson) => lesson.progress?.completed).length;
  const calculatedProgress = lessons.length ? Math.round((completedLessons / lessons.length) * 100) : Number(enrollment.progress || 0);

  let instructor = null;
  if (course.instructor_id) {
    const { data } = await supabase.from("profiles").select("id,full_name,email,avatar_url").eq("id", course.instructor_id).maybeSingle();
    instructor = data || null;
  }

  return {
    ...course,
    instructor,
    course_modules: modules,
    enrollment,
    progress: calculatedProgress,
    completedLessons,
    totalLessons: lessons.length,
  };
}

export async function updateLessonProgress(lessonId, completed) {
  const user = await requireUser();
  const payload = {
    lesson_id: lessonId,
    student_id: user.id,
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("lesson_progress")
    .upsert(payload, { onConflict: "lesson_id,student_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyAssignments() {
  const user = await requireUser();
  const courseIds = await getStudentCourseIds(user.id);
  if (!courseIds.length) return [];

  const { data: assignments, error } = await supabase
    .from("assignments")
    .select("id,course_id,teacher_id,title,description,instructions,due_at,max_marks,status,created_at,courses(id,title)")
    .in("course_id", courseIds)
    .order("due_at", { ascending: true, nullsFirst: false });
  if (error) throw error;

  const ids = (assignments || []).map((a) => a.id);
  if (!ids.length) return [];
  const { data: submissions, error: submissionError } = await supabase
    .from("assignment_submissions")
    .select("id,assignment_id,status,marks,submitted_at,feedback,file_path")
    .eq("student_id", user.id)
    .in("assignment_id", ids);
  if (submissionError) throw submissionError;

  const submissionMap = new Map((submissions || []).map((s) => [s.assignment_id, s]));
  return (assignments || []).map((assignment) => ({ ...assignment, submission: submissionMap.get(assignment.id) || null }));
}

export async function getAssignmentDetails(assignmentId) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("assignments")
    .select("id,course_id,teacher_id,title,description,instructions,due_at,max_marks,status,created_at,courses(id,title)")
    .eq("id", assignmentId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { data: submission, error: submissionError } = await supabase
    .from("assignment_submissions")
    .select("id,assignment_id,student_id,submission_text,file_path,submitted_at,status,marks,feedback,graded_at")
    .eq("assignment_id", assignmentId)
    .eq("student_id", user.id)
    .maybeSingle();
  if (submissionError) throw submissionError;

  let teacher = null;
  if (data.teacher_id) {
    const { data: teacherData } = await supabase.from("profiles").select("id,full_name,email,avatar_url").eq("id", data.teacher_id).maybeSingle();
    teacher = teacherData || null;
  }
  return { ...data, teacher, submission: submission || null };
}

export async function submitAssignment({ assignmentId, submissionText, filePath = null }) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("assignment_submissions")
    .upsert({
      assignment_id: assignmentId,
      student_id: user.id,
      submission_text: submissionText?.trim() || null,
      file_path: filePath,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    }, { onConflict: "assignment_id,student_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getStudyMaterials(courseId = null) {
  const user = await requireUser();
  const ids = await getStudentCourseIds(user.id);
  if (!ids.length) return [];
  let query = supabase
    .from("study_materials")
    .select("id,course_id,title,type,description,file_path,file_size,created_at,courses(id,title)")
    .in("course_id", ids)
    .order("created_at", { ascending: false });
  if (courseId) query = query.eq("course_id", courseId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getMyClasses({ from, to } = {}) {
  const user = await requireUser();
  const ids = await getStudentCourseIds(user.id);
  if (!ids.length) return [];
  let query = supabase
    .from("class_schedules")
    .select("id,course_id,teacher_id,title,description,starts_at,ends_at,meeting_url,recording_url,status,courses(id,title)")
    .in("course_id", ids)
    .order("starts_at", { ascending: true });
  if (from) query = query.gte("starts_at", from);
  if (to) query = query.lte("starts_at", to);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getMyAttendance() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("attendance")
    .select("id,class_id,status,marked_at,class_schedules(id,title,course_id,starts_at,ends_at,courses(id,title))")
    .eq("student_id", user.id)
    .order("marked_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMyGrades() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("grades")
    .select("id,course_id,assignment_id,title,marks,max_marks,feedback,graded_at,created_at,courses(id,title)")
    .eq("student_id", user.id)
    .order("graded_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data || [];
}

export async function getMyNotifications() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("notifications")
    .select("id,title,message,type,action_url,read_at,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(notificationId) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyMessages() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("messages")
    .select("id,sender_id,recipient_id,subject,body,read_at,created_at")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function markMessageRead(messageId) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("recipient_id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function sendMessage({ recipientId, subject, body }) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: user.id, recipient_id: recipientId, subject: subject?.trim() || null, body: body?.trim() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyOrders() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("orders")
    .select("id,student_id,course_id,amount,currency,status,provider,provider_reference,created_at,paid_at,courses(id,title)")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMyPayments() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("payments")
    .select("id,order_id,student_id,amount,currency,status,provider,provider_reference,metadata,created_at,paid_at,orders(id,course_id,courses(id,title))")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMyCertificates() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("certificates")
    .select("id,course_id,certificate_number,issued_at,file_path,verification_code,courses(id,title)")
    .eq("student_id", user.id)
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMyReferrals() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("referrals")
    .select("id,referrer_id,referred_user_id,referral_code,status,reward_amount,created_at,qualified_at,rewarded_at")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createReferralCode() {
  const user = await requireUser();
  const code = `EDU-${user.id.replaceAll("-", "").slice(0, 8).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const { data, error } = await supabase
    .from("referrals")
    .insert({ referrer_id: user.id, referral_code: code })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyProgress() {
  const user = await requireUser();
  const enrollments = await getMyEnrollments();
  const courseIds = enrollments.map((e) => e.course_id);
  if (!courseIds.length) return [];

  const { data: modules, error: moduleError } = await supabase
    .from("course_modules")
    .select("id,course_id,lessons(id)")
    .in("course_id", courseIds);
  if (moduleError) throw moduleError;

  const lessonIds = (modules || []).flatMap((m) => (m.lessons || []).map((l) => l.id));
  let progress = [];
  if (lessonIds.length) {
    const { data, error } = await supabase
      .from("lesson_progress")
      .select("lesson_id,completed")
      .eq("student_id", user.id)
      .in("lesson_id", lessonIds);
    if (error) throw error;
    progress = data || [];
  }
  const completed = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));

  return enrollments.map((enrollment) => {
    const courseModules = (modules || []).filter((m) => m.course_id === enrollment.course_id);
    const lessons = courseModules.flatMap((m) => m.lessons || []);
    const completedLessons = lessons.filter((lesson) => completed.has(lesson.id)).length;
    const calculated = lessons.length ? Math.round((completedLessons / lessons.length) * 100) : Number(enrollment.progress || 0);
    return { ...enrollment, completedLessons, totalLessons: lessons.length, calculatedProgress: calculated };
  });
}

export { getStudentCourseIds };

export async function getMarketplaceProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,slug,description,sku,price,stock,image_url,is_active,created_at,updated_at")
    .eq("is_active", true)
    .gt("stock", 0)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
