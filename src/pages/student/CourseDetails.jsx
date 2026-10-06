import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Play, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getCourseDetails, updateLessonProgress } from "../../services/studentService";
import { EmptyState, ErrorState, LoadingState, formatDate } from "../../components/student/StudentDataState";

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingLesson, setSavingLesson] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setCourse(await getCourseDetails(id)); } catch (err) { console.error(err); setError("We couldn't load this course right now."); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function toggleLesson(lesson) {
    try { setSavingLesson(lesson.id); await updateLessonProgress(lesson.id, !lesson.progress?.completed); await load(); }
    catch (err) { console.error(err); setError("We couldn't update lesson progress."); }
    finally { setSavingLesson(null); }
  }

  if (loading) return <LoadingState label="Loading course..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!course) return <div className="flex min-h-[60vh] items-center justify-center"><EmptyState title="Course not found" description="The course you're looking for is unavailable." icon={BookOpen} action={<Link to="/student/courses" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"><ArrowLeft size={16} />Back to My Courses</Link>} /></div>;

  const progress = Number(course.progress || 0);
  const remaining = Math.max(course.totalLessons - course.completedLessons, 0);
  return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <Link to="/student/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={16} />Back to My Courses</Link>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="grid lg:grid-cols-[1.1fr_1fr]">
        <div className="min-h-64 bg-slate-100">{course.thumbnail ? <img src={course.thumbnail} alt="" className="h-full min-h-64 w-full object-cover" /> : <div className="flex h-full min-h-64 items-center justify-center text-blue-600"><BookOpen size={58} /></div>}</div>
        <div className="p-6 sm:p-8"><span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase text-blue-700">{course.enrollment.status}</span><h1 className="mt-4 text-2xl font-bold text-slate-950 sm:text-3xl">{course.title}</h1><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><UserRound size={15} />{course.instructor?.full_name || "Instructor"}</p><p className="mt-5 text-sm leading-7 text-slate-600">{course.description || "Course description will appear here."}</p><div className="mt-6"><div className="mb-2 flex justify-between text-xs"><span>Progress</span><strong>{progress}%</strong></div><div className="h-2.5 rounded-full bg-slate-100"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full bg-blue-600" /></div></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Completed lessons</p><p className="mt-1 font-bold">{course.completedLessons}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Remaining lessons</p><p className="mt-1 font-bold">{remaining}</p></div></div></div>
      </div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Curriculum</p><h2 className="mt-1 text-lg font-bold text-slate-950">Course content</h2></div><span className="text-xs text-slate-400">Updated {formatDate(course.enrollment.completed_at || course.enrollment.enrolled_at)}</span></div>
      {course.course_modules.length ? <div className="mt-6 space-y-4">{course.course_modules.map((module, index) => <div key={module.id} className="rounded-2xl border border-slate-200"><div className="border-b border-slate-100 bg-slate-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Module {index + 1}</p><h3 className="mt-1 font-bold text-slate-900">{module.title}</h3>{module.description && <p className="mt-1 text-xs text-slate-500">{module.description}</p>}</div>{module.lessons.length ? <div className="divide-y divide-slate-100">{module.lessons.map((lesson) => <button key={lesson.id} type="button" onClick={() => toggleLesson(lesson)} disabled={savingLesson === lesson.id} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 disabled:opacity-60"><span className={lesson.progress?.completed ? "text-emerald-600" : "text-slate-300"}>{lesson.progress?.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">{lesson.title}</span>{lesson.duration_minutes ? <span className="text-xs text-slate-400">{lesson.duration_minutes} minutes</span> : null}</span>{lesson.progress?.completed ? <span className="text-xs font-semibold text-emerald-600">Completed</span> : <Play size={16} className="text-blue-600" />}</button>)}</div> : <p className="px-4 py-4 text-sm text-slate-500">No published lessons in this module yet.</p>}</div>)}</div> : <div className="mt-6"><EmptyState title="Curriculum will appear here" description="Course modules and lessons will appear here when course content is available." /></div>}
    </section>
  </motion.div>;
}
