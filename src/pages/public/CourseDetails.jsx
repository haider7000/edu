import { useEffect, useState } from "react";
import { BookOpen, Clock3, Loader2, CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { requestCourseAdmission } from "../../services/studentService";

export default function CourseDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const key = params.slug || params.id;
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      let q = supabase.from("courses").select("id,title,slug,description,thumbnail,price,duration_hours,status").eq("status", "published");
      const isUuid = /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(key || "");
      q = isUuid ? q.eq("id", key) : q.eq("slug", key);
      const { data } = await q.maybeSingle();
      setCourse(data || null);
      if (data) {
        const { data: m } = await supabase.from("course_modules").select("id,title,description,sort_order,lessons(id,title,sort_order)").eq("course_id", data.id).order("sort_order");
        setModules(m || []);
      }
      setLoading(false);
    })();
  }, [key]);

  const enroll = async () => {
    if (!course) return;
    if (!user) {
      localStorage.setItem("edu_pending_course_id", course.id);
      navigate(`/register?course=${course.id}`);
      return;
    }
    if (role !== "Student") {
      setError("Only Student accounts can enroll in courses.");
      return;
    }
    setEnrolling(true); setError(""); setMessage("");
    try {
      await requestCourseAdmission(course.id);
      localStorage.removeItem("edu_pending_course_id");
      setMessage("Admission request submitted. Waiting for Admin or Manager approval.");
      setTimeout(() => navigate("/student/dashboard"), 700);
    } catch (e) {
      const text = e?.message || "Unable to submit admission request.";
      if (text.toLowerCase().includes("already enrolled")) navigate("/student/dashboard");
      else setError(text);
    } finally { setEnrolling(false); }
  };

  if (loading) return <main className="min-h-screen bg-[var(--background)] pt-32 text-center text-slate-400">Loading course…</main>;
  if (!course) return <main className="min-h-screen bg-[var(--background)] px-5 pt-32 text-center text-[var(--foreground)]"><h1 className="text-3xl font-bold">Course not found</h1><Link to="/courses" className="mt-5 inline-block text-indigo-400">Back to courses</Link></main>;

  return <main className="min-h-screen bg-[var(--background)] px-5 pb-24 pt-28 text-[var(--foreground)]"><div className="mx-auto max-w-6xl"><div className="grid gap-8 lg:grid-cols-[1fr_340px]"><section><div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]"><div className="flex h-64 items-center justify-center bg-gradient-to-br from-indigo-600/30 to-cyan-500/10">{course.thumbnail?<img src={course.thumbnail} alt="" className="h-full w-full object-cover"/>:<BookOpen className="h-14 w-14 text-indigo-300"/>}</div><div className="p-7"><h1 className="text-3xl font-black sm:text-5xl">{course.title}</h1><p className="mt-5 leading-7 text-slate-400">{course.description||"Course information will be available soon."}</p></div></div><div className="mt-7 rounded-3xl border border-white/10 bg-white/[.035] p-7"><h2 className="text-2xl font-bold">Course content</h2>{modules.length===0?<p className="mt-4 text-slate-400">Course modules become available after admission approval.</p>:<div className="mt-5 space-y-4">{modules.map(m=><div key={m.id} className="rounded-2xl border border-white/10 p-4"><h3 className="font-semibold">{m.title}</h3>{m.description&&<p className="mt-1 text-sm text-slate-400">{m.description}</p>}</div>)}</div>}</div></section><aside className="h-fit rounded-3xl border border-white/10 bg-white/[.035] p-6 lg:sticky lg:top-24"><div className="text-3xl font-black">PKR {Number(course.price||0).toLocaleString()}</div><div className="mt-4 flex items-center gap-2 text-sm text-slate-400"><Clock3 className="h-4 w-4"/>{course.duration_hours?`${course.duration_hours} hours`:"Self-paced"}</div>{message&&<div className="mt-5 flex gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300"><CheckCircle2 size={18}/>{message}</div>}{error&&<div className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}<button onClick={enroll} disabled={enrolling} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-center font-semibold text-white disabled:opacity-60">{enrolling&&<Loader2 size={17} className="animate-spin"/>}{user?"Enroll in this course":"Sign up & enroll"}</button></aside></div></div></main>;
}
