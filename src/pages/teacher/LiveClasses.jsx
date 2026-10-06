import { useCallback, useEffect, useState } from "react";
import { Video, CalendarDays, Play, Radio, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTeacherClasses, getTeacherCourses } from "../../services/teacherService";
import {
  getLiveSessionByClass,
  getActiveLiveSessionByCourse,
  startLiveSession,
  startInstantLiveSession,
} from "../../services/liveClassService";
import { TeacherPage, Card, State, Button, fmtDate, fmtTime } from "../../components/teacher/TeacherUI";

export default function LiveClasses() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState({ classes: [], courses: [] });
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const [classes, courses] = await Promise.all([
        getTeacherClasses(user.id),
        getTeacherCourses(user.id),
      ]);

      const pairs = await Promise.all(
        (classes || []).map(async (c) => [c.id, await getLiveSessionByClass(c.id).catch(() => null)])
      );

      const instantPairs = await Promise.all(
        (courses || []).map(async (c) => [c.id, await getActiveLiveSessionByCourse(c.id).catch(() => null)])
      );

      setData({ classes: classes || [], courses: courses || [] });
      setSessions({
        ...Object.fromEntries(pairs),
        ...Object.fromEntries(instantPairs.map(([courseId, session]) => [`course:${courseId}`, session])),
      });
    } catch (e) {
      console.error("Teacher live classes load error:", e);
      setError(e?.message || "Unable to load live classes.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user?.id) load();
    if (!authLoading && !user?.id) {
      setLoading(false);
      setError("You must be signed in as a teacher to view live classes.");
    }
  }, [authLoading, user?.id, load]);

  const startInstant = async (course) => {
    if (!user?.id || !course?.id) return;
    setStarting(course.id);
    setError("");
    try {
      const session = await startInstantLiveSession(course.id, user.id, course.title);
      nav(`/teacher/live-class/${session.id}`);
    } catch (e) {
      console.error("Start instant live class error:", e);
      setError(e?.message || "Could not start the live class.");
      await load();
    } finally {
      setStarting("");
    }
  };

  const startScheduled = async (courseClass) => {
    if (!user?.id || !courseClass?.id) return;
    setStarting(courseClass.id);
    setError("");
    try {
      const session = await startLiveSession(courseClass.id, user.id, courseClass.title);
      nav(`/teacher/live-class/${session.id}`);
    } catch (e) {
      console.error("Start scheduled live class error:", e);
      setError(e?.message || "Could not start the live class.");
    } finally {
      setStarting("");
    }
  };

  if (authLoading || loading) {
    return (
      <TeacherPage
        title="Live Classes"
        subtitle="Start a live class whenever you need it — directly inside EduVerse."
      >
        <Card><State type="loading" message="Loading your courses and live classes..." /></Card>
      </TeacherPage>
    );
  }

  return (
    <TeacherPage
      title="Live Classes"
      subtitle="Start an instant class for any course you teach. No schedule is required."
      actions={<Button variant="secondary" onClick={load}><RefreshCw size={15} />Refresh</Button>}
    >
      {error && <State type="error" message={error} />}

      <Card>
        <div className="border-b p-5">
          <h2 className="font-bold">Start an instant live class</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select a course and start now. Every active or completed enrollee in that course can join.
          </p>
        </div>

        <div className="divide-y">
          {data.courses.length ? data.courses.map((course) => {
            const active = sessions[`course:${course.id}`];
            return (
              <div key={course.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Video size={20} /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{course.title}</p>
                  <p className="text-sm text-slate-500">
                    {active ? "A live class is already running for this course." : "Ready to start for enrolled students."}
                  </p>
                </div>
                {active?.status === "live" ? (
                  <Link to={`/teacher/live-class/${active.id}`}>
                    <Button><Radio size={15} />Join live class</Button>
                  </Link>
                ) : (
                  <Button disabled={starting === course.id} onClick={() => startInstant(course)}>
                    <Play size={15} />
                    {starting === course.id ? "Starting..." : "Start live class"}
                  </Button>
                )}
              </div>
            );
          }) : (
            <State type="empty" message="No courses are assigned to you." />
          )}
        </div>
      </Card>

      <Card>
        <div className="border-b p-5">
          <h2 className="font-bold">Scheduled classes</h2>
          <p className="mt-1 text-sm text-slate-500">
            Existing scheduled classes continue to work separately from instant classes.
          </p>
        </div>
        <div className="divide-y">
          {data.classes.length ? data.classes.map((courseClass) => {
            const session = sessions[courseClass.id];
            return (
              <div key={courseClass.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <p className="font-semibold">{courseClass.title}</p>
                  <p className="text-sm text-slate-500">
                    {courseClass.courses?.title || "Course"} · {fmtDate(courseClass.starts_at)} · {fmtTime(courseClass.starts_at)}–{fmtTime(courseClass.ends_at)}
                  </p>
                </div>
                {session?.status === "live" ? (
                  <Link to={`/teacher/live-class/${session.id}`}>
                    <Button><Radio size={15} />Open classroom</Button>
                  </Link>
                ) : (
                  <Button disabled={starting === courseClass.id} onClick={() => startScheduled(courseClass)}>
                    <CalendarDays size={15} />
                    {starting === courseClass.id ? "Starting..." : "Start live class"}
                  </Button>
                )}
              </div>
            );
          }) : (
            <State type="empty" message="No scheduled classes." />
          )}
        </div>
      </Card>
    </TeacherPage>
  );
}
