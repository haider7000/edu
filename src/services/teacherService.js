import { supabase } from "../lib/supabase";

function throwIfError(error) {
  if (error) throw error;
}

function uniqueIds(values = []) {
  return [...new Set(values.filter(Boolean))];
}

async function getTeacherCourseIds(userId) {
  const { data, error } = await supabase
    .from("courses")
    .select("id")
    .eq("instructor_id", userId);

  throwIfError(error);
  return (data || []).map((row) => row.id);
}

export async function getTeacherProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function getTeacherCourses(userId) {
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id,title,slug,description,thumbnail,instructor_id,status,price,duration_hours,created_at,updated_at"
    )
    .eq("instructor_id", userId)
    .order("created_at", { ascending: false });

  throwIfError(error);
  return data || [];
}

export async function getTeacherStudents(userId, courseId = "") {
  const courseIds = await getTeacherCourseIds(userId);
  if (!courseIds.length) return [];

  let query = supabase
    .from("enrollments")
    .select(
      "id,course_id,student_id,status,progress,enrolled_at,completed_at,profiles:student_id(id,full_name,email,avatar_url),courses:course_id(id,title,instructor_id,status)"
    )
    .in("course_id", courseIds)
    .order("enrolled_at", { ascending: false });

  if (courseId) query = query.eq("course_id", courseId);

  const { data, error } = await query;

  throwIfError(error);
  return data || [];
}

export async function getTeacherAssignments(userId) {
  const { data, error } = await supabase
    .from("assignments")
    .select(
      "id,course_id,teacher_id,title,description,instructions,due_at,max_marks,status,created_at,updated_at,courses:course_id(id,title,instructor_id)"
    )
    .eq("teacher_id", userId)
    .order("created_at", { ascending: false });

  throwIfError(error);
  return data || [];
}

export async function getTeacherClasses(userId) {
  const { data, error } = await supabase
    .from("class_schedules")
    .select(
      "id,course_id,teacher_id,title,description,starts_at,ends_at,meeting_url,recording_url,status,created_at,courses:course_id(id,title,instructor_id)"
    )
    .eq("teacher_id", userId)
    .order("starts_at", { ascending: true });

  throwIfError(error);
  return data || [];
}

export async function getTeacherNotifications(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  throwIfError(error);
  return data || [];
}

export async function getTeacherMessages(userId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  throwIfError(error);
  return data || [];
}

export async function getCourseLessons(courseIds = []) {
  const ids = uniqueIds(courseIds);
  if (!ids.length) return [];

  const { data: modules, error: moduleError } = await supabase
    .from("course_modules")
    .select("id,course_id,title,description,sort_order,created_at")
    .in("course_id", ids)
    .order("sort_order", { ascending: true });

  throwIfError(moduleError);
  if (!modules?.length) return [];

  const moduleIds = modules.map((module) => module.id);
  const { data: lessons, error: lessonError } = await supabase
    .from("lessons")
    .select(
      "id,module_id,title,description,video_url,duration_minutes,sort_order,is_published,created_at"
    )
    .in("module_id", moduleIds)
    .order("sort_order", { ascending: true });

  throwIfError(lessonError);

  const lessonMap = new Map();
  for (const lesson of lessons || []) {
    const list = lessonMap.get(lesson.module_id) || [];
    list.push(lesson);
    lessonMap.set(lesson.module_id, list);
  }

  return modules.map((module) => ({
    ...module,
    lessons: lessonMap.get(module.id) || [],
  }));
}

export async function getPendingReviews(userId) {
  const assignments = await getTeacherAssignments(userId);
  const assignmentIds = assignments.map((assignment) => assignment.id);
  if (!assignmentIds.length) return [];

  const { data, error } = await supabase
    .from("assignment_submissions")
    .select(
      "id,assignment_id,student_id,submission_text,file_path,submitted_at,status,marks,feedback,graded_at,profiles:student_id(id,full_name,email,avatar_url),assignments:assignment_id(id,title,course_id,max_marks,due_at,courses:course_id(id,title))"
    )
    .in("assignment_id", assignmentIds)
    .in("status", ["submitted", "late"])
    .order("submitted_at", { ascending: false });

  throwIfError(error);
  return data || [];
}

export async function getTeacherGrades(userId) {
  const courseIds = await getTeacherCourseIds(userId);
  if (!courseIds.length) return [];

  const { data, error } = await supabase
    .from("grades")
    .select(
      "id,student_id,course_id,assignment_id,title,marks,max_marks,feedback,graded_at,created_at,profiles:student_id(id,full_name,email),courses:course_id(id,title),assignments:assignment_id(id,title,teacher_id)"
    )
    .in("course_id", courseIds)
    .order("created_at", { ascending: false });

  throwIfError(error);
  return data || [];
}

export async function getTeacherAttendance(userId) {
  const courseIds = await getTeacherCourseIds(userId);
  if (!courseIds.length) return [];

  const { data, error } = await supabase
    .from("attendance")
    .select(
      "id,course_id,class_id,student_id,status,attendance_date,marked_at,profiles:student_id(id,full_name,email)"
    )
    .in("course_id", courseIds)
    .order("attendance_date", { ascending: false })
    .order("marked_at", { ascending: false });

  throwIfError(error);
  return data || [];
}

export async function getTeacherCourseAttendance(userId, courseId, attendanceDate) {
  if (!courseId) return [];

  const courseIds = await getTeacherCourseIds(userId);
  if (!courseIds.includes(courseId)) {
    throw new Error("You are not assigned to this course.");
  }

  let query = supabase
    .from("attendance")
    .select(
      "id,course_id,class_id,student_id,status,attendance_date,marked_at,profiles:student_id(id,full_name,email)"
    )
    .eq("course_id", courseId)
    .order("marked_at", { ascending: false });

  if (attendanceDate) query = query.eq("attendance_date", attendanceDate);

  const { data, error } = await query;
  throwIfError(error);
  return data || [];
}

export async function saveTeacherCourseAttendance({
  courseId,
  studentId,
  status,
  attendanceDate,
  teacherId,
}) {
  if (!courseId || !studentId || !teacherId) {
    throw new Error("Course, student and teacher are required.");
  }

  const courseIds = await getTeacherCourseIds(teacherId);
  if (!courseIds.includes(courseId)) {
    throw new Error("You are not assigned to this course.");
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id,status")
    .eq("course_id", courseId)
    .eq("student_id", studentId)
    .in("status", ["active", "completed"])
    .maybeSingle();

  throwIfError(enrollmentError);
  if (!enrollment) {
    throw new Error("This student is not actively enrolled in the selected course.");
  }

  const { data, error } = await supabase
    .from("attendance")
    .upsert(
      {
        course_id: courseId,
        class_id: null,
        student_id: studentId,
        status,
        attendance_date: attendanceDate || new Date().toISOString().slice(0, 10),
        marked_at: new Date().toISOString(),
      },
      { onConflict: "course_id,student_id,attendance_date" }
    )
    .select("id,course_id,class_id,student_id,status,attendance_date,marked_at")
    .single();

  throwIfError(error);
  return data;
}

export async function getMaterials(userId) {
  const courseIds = await getTeacherCourseIds(userId);
  if (!courseIds.length) return [];

  const { data, error } = await supabase
    .from("study_materials")
    .select(
      "id,course_id,title,type,description,file_path,file_size,created_at,courses:course_id(id,title,instructor_id)"
    )
    .in("course_id", courseIds)
    .order("created_at", { ascending: false });

  throwIfError(error);
  return data || [];
}

export async function getStudentDetail(userId, studentId) {
  const enrollments = await getTeacherStudents(userId);
  const mine = enrollments.filter((row) => row.student_id === studentId);

  if (!mine.length) {
    return {
      authorized: false,
      student: null,
      enrollments: [],
      assignments: [],
      grades: [],
      attendance: [],
      classes: [],
    };
  }

  const courseIds = uniqueIds(mine.map((row) => row.course_id));

  const [assignmentsResult, gradesResult, classesResult] = await Promise.all([
    supabase
      .from("assignments")
      .select(
        "id,course_id,teacher_id,title,description,instructions,due_at,max_marks,status,created_at,courses:course_id(id,title)"
      )
      .eq("teacher_id", userId)
      .in("course_id", courseIds)
      .order("due_at", { ascending: false }),
    supabase
      .from("grades")
      .select(
        "id,student_id,course_id,assignment_id,title,marks,max_marks,feedback,graded_at,created_at,courses:course_id(id,title),assignments:assignment_id(id,title)"
      )
      .eq("student_id", studentId)
      .in("course_id", courseIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("class_schedules")
      .select(
        "id,course_id,teacher_id,title,description,starts_at,ends_at,meeting_url,recording_url,status,created_at,courses:course_id(id,title)"
      )
      .eq("teacher_id", userId)
      .in("course_id", courseIds)
      .order("starts_at", { ascending: false }),
  ]);

  throwIfError(assignmentsResult.error);
  throwIfError(gradesResult.error);
  throwIfError(classesResult.error);

  const classIds = (classesResult.data || []).map((item) => item.id);
  let attendance = [];

  if (classIds.length) {
    const { data, error } = await supabase
      .from("attendance")
      .select("id,class_id,student_id,status,marked_at")
      .eq("student_id", studentId)
      .in("class_id", classIds)
      .order("marked_at", { ascending: false });

    throwIfError(error);
    attendance = data || [];
  }

  return {
    authorized: true,
    student: mine[0].profiles || null,
    enrollments: mine,
    assignments: assignmentsResult.data || [],
    grades: gradesResult.data || [],
    attendance,
    classes: classesResult.data || [],
  };
}

export async function getTeacherDashboard(userId) {
  const [courses, students, reviews, classes] = await Promise.all([
    getTeacherCourses(userId),
    getTeacherStudents(userId),
    getPendingReviews(userId),
    getTeacherClasses(userId),
  ]);

  return { courses, students, reviews, classes };
}

export async function updateNotification(id, userId, read) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: read ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function sendMessage(senderId, recipientId, body, subject = "") {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      body,
      subject: subject || null,
    })
    .select()
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function saveProfile(userId, patch) {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select()
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function changePassword(password) {
  const { data, error } = await supabase.auth.updateUser({ password });
  throwIfError(error);
  return data;
}

export async function deleteAssignment(id, userId) {
  const { error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", id)
    .eq("teacher_id", userId);

  throwIfError(error);
}
