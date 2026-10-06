import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Video, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { getMyClasses } from "../../services/studentService";
import { supabase } from "../../lib/supabase";
import { getLiveSessionByClass, getStudentLiveSessions } from "../../services/liveClassService";
import { EmptyState, ErrorState, LoadingState, PageHeader, formatDateTime } from "../../components/student/StudentDataState";

export default function LiveClasses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const studentId = authData.user?.id;
      const [classes, instant] = await Promise.all([
        getMyClasses(),
        studentId ? getStudentLiveSessions(studentId) : Promise.resolve([]),
      ]);
      const rows = await Promise.all(classes.map(async c => [c, await getLiveSessionByClass(c.id).catch(() => null)]));
      const scheduled = rows.filter(([, s]) => s).map(([, s]) => s);
      const merged = [...instant, ...scheduled.filter(s => !instant.some(x => x.id === s.id))];
      setData(merged);
    } catch (e) {
      console.error(e);
      setError("We couldn't load your live classes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return <div className="space-y-6">
    <PageHeader eyebrow="Learning" title="Live Classes" description="Join live sessions for your enrolled courses directly inside EduVerse." />
    {loading ? <LoadingState/> : error ? <ErrorState message={error} onRetry={load}/> : data.length ? <div className="grid gap-4 lg:grid-cols-2">
      {data.map(s => <article key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between"><div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-700">{s.status}</span>
          <h2 className="mt-3 text-lg font-bold text-slate-950">{s.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{s.courses?.title || s.class_schedules?.courses?.title || "Course"}</p>
        </div><Video className="text-blue-600"/></div>
        <p className="mt-4 text-sm text-slate-600">{s.class_schedules?.description || "Live online class"}</p>
        <p className="mt-4 text-xs text-slate-500"><CalendarDays className="mr-1 inline" size={14}/>{formatDateTime(s.started_at || s.class_schedules?.starts_at)}</p>
        <Link to={`/student/live-class/${s.id}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">{s.status === "live" ? <><Radio size={15}/>Join now</> : "Open classroom"}</Link>
      </article>)}
    </div> : <EmptyState title="No live classes yet" description="Your teacher's live classes will appear here when a session is available." icon={Video}/>}
  </div>;
}
