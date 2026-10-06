import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getTeacherCourses,
  getTeacherStudents,
  getTeacherCourseAttendance,
  saveTeacherCourseAttendance,
} from "../../services/teacherService";
import { TeacherPage, Card, State, Button } from "../../components/teacher/TeacherUI";

const STATUSES = ["present", "late", "absent", "excused"];

export default function Attendance() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const teacherCourses = await getTeacherCourses(user.id);
      setCourses(teacherCourses || []);

      const selectedCourseId = courseId || teacherCourses?.[0]?.id || "";
      setCourseId((old) => old || selectedCourseId);

      if (!selectedCourseId) {
        setStudents([]);
        setAttendance([]);
        return;
      }

      const [enrolledStudents, courseAttendance] = await Promise.all([
        getTeacherStudents(user.id, selectedCourseId),
        getTeacherCourseAttendance(user.id, selectedCourseId, date),
      ]);

      setStudents((enrolledStudents || []).filter((row) => ["active", "completed"].includes(row.status)));
      setAttendance(courseAttendance || []);
    } catch (e) {
      console.error("Teacher attendance load error:", e);
      setError(e?.message || "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, courseId, date]);

  useEffect(() => {
    if (!authLoading && user?.id) load();
    if (!authLoading && !user?.id) {
      setLoading(false);
      setError("You must be signed in as a teacher to view attendance.");
    }
  }, [authLoading, user?.id, load]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === courseId),
    [courses, courseId]
  );

  const records = useMemo(
    () => attendance.filter((row) => row.course_id === courseId && row.attendance_date === date),
    [attendance, courseId, date]
  );

  const statusFor = useCallback(
    (studentId) => records.find((row) => row.student_id === studentId)?.status || "absent",
    [records]
  );

  const counts = useMemo(() => {
    const result = Object.fromEntries(STATUSES.map((status) => [status, 0]));
    records.forEach((row) => {
      if (result[row.status] !== undefined) result[row.status] += 1;
    });
    return result;
  }, [records]);

  const save = async (studentId, status) => {
    if (!courseId || !user?.id) return;
    setSaving(studentId);
    setError("");
    try {
      await saveTeacherCourseAttendance({
        courseId,
        studentId,
        status,
        attendanceDate: date,
        teacherId: user.id,
      });
      const refreshed = await getTeacherCourseAttendance(user.id, courseId, date);
      setAttendance(refreshed || []);
    } catch (e) {
      console.error("Save teacher attendance error:", e);
      setError(e?.message || "Attendance could not be saved.");
    } finally {
      setSaving("");
    }
  };

  if (authLoading || loading) {
    return (
      <TeacherPage title="Student Attendance" subtitle="Select a course to view every enrolled student.">
        <Card><State type="loading" message="Loading courses and enrolled students..." /></Card>
      </TeacherPage>
    );
  }

  return (
    <TeacherPage
      title="Student Attendance"
      subtitle="Select a course. All active and completed enrolled students are shown — no class filter is required."
      actions={<Button variant="secondary" onClick={load}><RefreshCw size={15} />Refresh</Button>}
    >
      {error && <State type="error" message={error} />}

      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_1fr] lg:items-end">
          <label className="text-sm font-semibold">
            Course
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
            >
              <option value="">Select a course</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </label>

          <label className="text-sm font-semibold">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
            />
          </label>

          <div className="grid grid-cols-4 gap-2">
            {STATUSES.map((status) => (
              <div key={status} className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] uppercase text-slate-500">{status}</p>
                <p className="text-xl font-bold">{counts[status]}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="border-b p-5">
          <h2 className="font-bold">{students.length} enrolled students</h2>
          <p className="mt-1 text-xs text-slate-500">{selectedCourse?.title || "Select a course"}</p>
        </div>

        <div className="divide-y">
          {!courseId ? (
            <State type="empty" message="Select a course to view enrolled students." />
          ) : students.length ? (
            students.map((student) => {
              const currentStatus = statusFor(student.student_id);
              return (
                <div key={student.student_id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <p className="font-semibold">{student.profiles?.full_name || "Student"}</p>
                    <p className="text-xs text-slate-500">{student.profiles?.email || ""}</p>
                    <p className="mt-1 text-[11px] capitalize text-slate-400">Enrollment: {student.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((status) => (
                      <Button
                        key={status}
                        disabled={saving === student.student_id}
                        variant={currentStatus === status ? "primary" : "secondary"}
                        onClick={() => save(student.student_id, status)}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <State type="empty" message="No active or completed students are enrolled in this course." />
          )}
        </div>
      </Card>
    </TeacherPage>
  );
}
