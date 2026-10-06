import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, UserRound, Clock3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getMyCourses } from "../../services/studentService";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../components/student/StudentDataState";

const FILTERS = ["All", "In Progress", "Completed"];

function CourseCard({ course }) {
  const progress = Math.min(100, Math.max(0, Number(course.progress) || 0));
  const data = course.courses || {};
  const completed = course.status === "completed" || progress >= 100;
  return (
    <motion.article whileHover={{ y: -3 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-44 bg-slate-100">
        {data.thumbnail ? <img src={data.thumbnail} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-blue-600"><BookOpen size={48} strokeWidth={1.5} /></div>}
      </div>
      <div className="p-5">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${completed ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{completed ? "Completed" : "In Progress"}</span>
        <h2 className="mt-3 line-clamp-2 text-lg font-bold text-slate-950">{data.title || "Untitled course"}</h2>
        {data.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{data.description}</p>}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><UserRound size={14} />Instructor assigned</span>
          {data.duration_hours ? <span className="inline-flex items-center gap-1.5"><Clock3 size={14} />{data.duration_hours} hrs</span> : null}
        </div>
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs"><span className="font-medium text-slate-500">Progress</span><span className="font-bold text-slate-900">{progress}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full bg-blue-600" /></div>
        </div>
        <Link to={`/student/courses/${course.course_id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">{completed ? "View course" : "Continue learning"}<ArrowRight size={16} /></Link>
      </div>
    </motion.article>
  );
}

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setCourses(await getMyCourses()); } catch (err) { console.error(err); setError("We couldn't load your courses right now."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => courses.filter((item) => {
    const progress = Number(item.progress || 0);
    const completed = item.status === "completed" || progress >= 100;
    const matchesFilter = filter === "All" || (filter === "Completed" ? completed : !completed);
    const title = item.courses?.title || "";
    const description = item.courses?.description || "";
    return matchesFilter && `${title} ${description}`.toLowerCase().includes(search.trim().toLowerCase());
  }), [courses, filter, search]);

  return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <PageHeader eyebrow="Learning" title="My Courses" description="Continue learning and keep progressing toward your goals." action={<Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Explore Courses</Link>} />
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">{FILTERS.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-xl px-3.5 py-2 text-xs font-semibold ${filter === item ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>{item}</button>)}</div>
        <label className="relative block w-full lg:max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your courses..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" /></label>
      </div>
    </section>
    {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : filtered.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((course) => <CourseCard key={course.id} course={course} />)}</div> : <EmptyState title="No courses yet" description="You haven't enrolled in any courses yet." icon={BookOpen} action={<Link to="/courses" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Explore Courses</Link>} />}
  </motion.div>;
}
