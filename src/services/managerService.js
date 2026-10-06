import { supabase } from "../lib/supabase";

const managerRead = async (table, select = "*") => {
  const { data, error } = await supabase.from(table).select(select);
  if (error) throw error;
  return data ?? [];
};

const managerQuery = async (table, query) => {
  const result = await query(supabase.from(table));
  if (result.error) throw result.error;
  return result.data ?? [];
};

export const getManagerProfile = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase.from("profiles").select("id,full_name,email,phone,avatar_url,created_at").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
};

export const getStudents = async () => {
  const { data: role, error: roleError } = await supabase.from("roles").select("id,name").ilike("name", "Student").maybeSingle();
  if (roleError) throw roleError;
  if (!role) return [];
  const { data: links, error } = await supabase.from("user_roles").select("user_id").eq("role_id", role.id);
  if (error) throw error;
  const ids = (links ?? []).map(x => x.user_id);
  if (!ids.length) return [];
  const { data, error: profileError } = await supabase.from("profiles").select("id,full_name,email,phone,avatar_url,created_at").in("id", ids);
  if (profileError) throw profileError;
  return data ?? [];
};
export const getTeachers = async () => {
  const { data: roles, error: roleError } = await supabase.from("roles").select("id,name").ilike("name", "Teacher").maybeSingle();
  if (roleError) throw roleError;
  if (!roles) return [];
  const { data: links, error } = await supabase.from("user_roles").select("user_id").eq("role_id", roles.id);
  if (error) throw error;
  const ids = (links ?? []).map(x => x.user_id);
  if (!ids.length) return [];
  const { data: profiles, error: profileError } = await supabase.from("profiles").select("id,full_name,email,phone,avatar_url,created_at").in("id", ids);
  if (profileError) throw profileError;
  return profiles ?? [];
};

export const getSelectableMeetingUsers = async () => {
  const { data, error } = await supabase.from("profiles").select("id,full_name,email").order("full_name", { ascending: true });
  if (error) throw error;
  const { data: links, error: linkError } = await supabase.from("user_roles").select("user_id,roles(name)");
  if (linkError) throw linkError;
  const roleMap = new Map((links || []).map(x => [x.user_id, Array.isArray(x.roles) ? x.roles[0]?.name : x.roles?.name]));
  return (data || []).map(x => ({ ...x, role: roleMap.get(x.id) || "Unassigned" }));
};

export const getCourses = () => managerRead("courses", "id,title,slug,description,thumbnail,instructor_id,status,price,duration_hours,created_at,updated_at");
export const getEnrollments = () => managerRead("enrollments", "id,course_id,student_id,status,progress,enrolled_at,completed_at");
export const getSchedules = () => managerRead("class_schedules", "id,course_id,teacher_id,title,description,starts_at,ends_at,meeting_url,recording_url,status,created_at");
export const getAttendance = () => managerRead("attendance", "id,class_id,student_id,status,marked_at");
export const getPayments = () => managerRead("payments", "id,order_id,student_id,amount,currency,status,provider,provider_reference,metadata,created_at,paid_at");
export const getOrders = () => managerRead("orders", "id,student_id,course_id,amount,currency,status,provider,provider_reference,created_at,paid_at");
export const getCertificates = () => managerRead("certificates", "id,student_id,course_id,certificate_number,issued_at,file_path,verification_code");
export const getInternships = () => managerRead("internships", "id,company,position,skills,duration,deadline,description,apply_url,status,created_at");
export const getReferralReports = () => managerRead("referrals", "id,referrer_id,referred_user_id,referral_code,status,reward_amount,created_at,qualified_at,rewarded_at");
export const getTeacherReports = () => managerRead("teacher_daily_reports", "id,teacher_id,report_date,classes_conducted,topics_covered,students_attended,assignments_checked,issues,additional_notes,created_at");
export const getNotifications = (userId) => managerQuery("notifications", q => q.select("id,user_id,title,message,type,action_url,read_at,created_at").eq("user_id", userId).order("created_at", { ascending: false }));
export const getMessages = (userId) => managerQuery("messages", q => q.select("id,sender_id,recipient_id,subject,body,read_at,created_at").or(`sender_id.eq.${userId},recipient_id.eq.${userId}`).order("created_at", { ascending: true }));

export const markNotification = async (id, read) => {
  const { error } = await supabase.from("notifications").update({ read_at: read ? new Date().toISOString() : null }).eq("id", id);
  if (error) throw error;
};
export const markAllNotifications = async (userId, read) => {
  const { error } = await supabase.from("notifications").update({ read_at: read ? new Date().toISOString() : null }).eq("user_id", userId);
  if (error) throw error;
};
export const sendMessage = async ({ sender_id, recipient_id, subject, body }) => {
  const { data, error } = await supabase.from("messages").insert({ sender_id, recipient_id, subject: subject || null, body }).select().single();
  if (error) throw error;
  return data;
};
export const updateProfile = async (userId, values) => {
  const safe = { full_name: values.full_name, phone: values.phone, avatar_url: values.avatar_url };
  const { data, error } = await supabase.from("profiles").update(safe).eq("id", userId).select().single();
  if (error) throw error;
  return data;
};
export const getAdmissions = () => managerRead(
  "admissions",
  "id,profile_id,first_name,last_name,email,phone,city,education,institution,experience,course_id,course_name,learning_goal,message,status,reviewed_by,reviewed_at,created_at,updated_at"
);

export const updateAdmission = async (id, status) => {
  const allowed = ["approved", "rejected", "interview"];
  if (!id) throw new Error("Admission id is required.");
  if (!allowed.includes(status)) throw new Error("Invalid admission status.");

  const { data, error } = await supabase.rpc("review_course_admission", {
    p_admission_id: id,
    p_status: status,
  });
  if (error) throw error;
  return data;
};
export const issueCertificate = async (studentId, courseId) => {
  const token = crypto.randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase();
  const certificateNumber = `EDU-${new Date().getFullYear()}-${token}`;
  const verificationCode = crypto.randomUUID().replaceAll("-", "").toUpperCase();
  const { data, error } = await supabase.from("certificates").insert({
    student_id: studentId,
    course_id: courseId,
    certificate_number: certificateNumber,
    verification_code: verificationCode,
  }).select().single();
  if (error) throw error;
  return data;
};

export const getDashboardData = async () => {
  const [students, teachers, courses, enrollments, schedules, payments, certificates, internships, attendance, referrals] = await Promise.all([
    getStudents(), getTeachers(), getCourses(), getEnrollments(), getSchedules(), getPayments(), getCertificates(), getInternships(), getAttendance(), getReferralReports()
  ]);
  return { students, teachers, courses, enrollments, schedules, payments, certificates, internships, attendance, referrals };
};

export const getAnalytics = getDashboardData;


// ============================================================
// MANAGER OPERATIONS
// ============================================================

export const saveCourse = async (values, courseId = null) => {
  const payload = {
    title: String(values.title || "").trim(),
    slug: String(values.slug || values.title || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    description: values.description || null,
    thumbnail: values.thumbnail || null,
    instructor_id: values.instructor_id || null,
    status: values.status || "draft",
    price: Number(values.price || 0),
    duration_hours: values.duration_hours === "" || values.duration_hours == null ? null : Number(values.duration_hours),
  };
  if (!payload.title) throw new Error("Course title is required.");
  const query = courseId
    ? supabase.from("courses").update(payload).eq("id", courseId)
    : supabase.from("courses").insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
};

export const deleteCourse = async (courseId) => {
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) throw error;
};

export const assignCourseTeacher = async (courseId, teacherId) => {
  const { data, error } = await supabase
    .from("courses")
    .update({ instructor_id: teacherId || null })
    .eq("id", courseId)
    .select().single();
  if (error) throw error;
  return data;
};

export const changeStudentCourse = async (enrollmentId, courseId) => {
  if (!enrollmentId || !courseId) throw new Error("Enrollment and course are required.");
  const { data, error } = await supabase
    .from("enrollments")
    .update({ course_id: courseId, status: "active" })
    .eq("id", enrollmentId)
    .select("id,course_id,student_id,status,progress,enrolled_at,completed_at")
    .single();
  if (error) throw error;
  return data;
};

export const getTeacherAttendance = () =>
  managerRead(
    "teacher_attendance",
    "id,teacher_id,attendance_date,status,check_in,check_out,notes,marked_by,created_at,updated_at"
  );

export const saveTeacherAttendance = async ({ teacher_id, attendance_date, status, check_in, check_out, notes }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("You must be signed in.");
  const { data, error } = await supabase
    .from("teacher_attendance")
    .upsert(
      {
        teacher_id,
        attendance_date,
        status,
        check_in: check_in || null,
        check_out: check_out || null,
        notes: notes || null,
        marked_by: user.id,
      },
      { onConflict: "teacher_id,attendance_date" }
    )
    .select().single();
  if (error) throw error;
  return data;
};

export const getEvents = () =>
  managerQuery(
    "events",
    q => q.select("id,title,description,event_type,starts_at,ends_at,location,meeting_room_id,audience,status,created_by,created_at,updated_at").order("starts_at", { ascending: true })
  );

export const saveEvent = async (values, eventId = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = {
    title: String(values.title || "").trim(),
    description: values.description || null,
    event_type: values.event_type || "general",
    starts_at: values.starts_at,
    ends_at: values.ends_at,
    location: values.location || null,
    audience: values.audience || "all",
    status: values.status || "published",
    created_by: user?.id,
  };
  if (!payload.title || !payload.starts_at || !payload.ends_at) throw new Error("Title, start and end time are required.");
  const query = eventId
    ? supabase.from("events").update(payload).eq("id", eventId)
    : supabase.from("events").insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
};

export const deleteEvent = async (eventId) => {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw error;
};

export const getProducts = () =>
  managerQuery(
    "products",
    q => q.select("id,name,slug,description,sku,price,stock,image_url,is_active,created_at,updated_at").order("created_at", { ascending: false })
  );

export const saveProduct = async (values, productId = null) => {
  const payload = {
    name: String(values.name || "").trim(),
    slug: String(values.slug || values.name || "")
      .trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    description: values.description || null,
    sku: values.sku || null,
    price: Number(values.price || 0),
    stock: Math.max(0, Number(values.stock || 0)),
    image_url: values.image_url || null,
    is_active: values.is_active !== false,
  };
  if (!payload.name) throw new Error("Product name is required.");
  const query = productId
    ? supabase.from("products").update(payload).eq("id", productId)
    : supabase.from("products").insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (productId) => {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw error;
};

export const getAllUsers = () =>
  managerQuery(
    "profiles",
    q => q.select("id,full_name,email,phone,avatar_url,created_at").order("full_name", { ascending: true })
  );

export const getAllMessages = () =>
  managerQuery(
    "messages",
    q => q.select("id,sender_id,recipient_id,subject,body,read_at,created_at").order("created_at", { ascending: true })
  );

export const markMessageRead = async (messageId) => {
  const { error } = await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", messageId);
  if (error) throw error;
};

export const createMeetingRoom = async ({ title, participant_id, starts_at, ends_at }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("You must be signed in.");
  const { data, error } = await supabase
    .from("meeting_rooms")
    .insert({
      title: String(title || "Manager–Teacher Meeting").trim(),
      manager_id: user.id,
      teacher_id: participant_id,
      starts_at: starts_at || new Date().toISOString(),
      ends_at: ends_at || null,
      status: "scheduled",
    })
    .select().single();
  if (error) throw error;
  return data;
};

export const getMeetingRooms = () =>
  managerQuery(
    "meeting_rooms",
    q => q.select("id,title,manager_id,teacher_id,starts_at,ends_at,status,created_at").order("starts_at", { ascending: false })
  );

export const updateMeetingStatus = async (roomId, status) => {
  const { data, error } = await supabase.from("meeting_rooms").update({ status }).eq("id", roomId).select().single();
  if (error) throw error;
  return data;
};

export const getMeetingRoom = async (roomId) => {
  const { data, error } = await supabase.from("meeting_rooms").select("id,title,manager_id,teacher_id,starts_at,ends_at,status,created_at").eq("id", roomId).single();
  if (error) throw error;
  return data;
};

export const sendMeetingSignal = async ({ room_id, recipient_id, signal_type, payload }) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("meeting_signals").insert({
    room_id, sender_id: user?.id, recipient_id, signal_type, payload: payload || {},
  }).select().single();
  if (error) throw error;
  return data;
};

export const getMeetingSignals = async (roomId) => {
  const { data, error } = await supabase
    .from("meeting_signals")
    .select("id,room_id,sender_id,recipient_id,signal_type,payload,created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
};
