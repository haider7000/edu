import { useMemo, useState } from "react";
import { BookOpen, Pencil, Plus, Trash2, UserCheck, X } from "lucide-react";
import { assignCourseTeacher, deleteCourse, getCourses, getEnrollments, getTeachers, saveCourse } from "../../services/managerService";
import { ErrorState, LoadingState, PageHeader, StatusBadge, Table, Toolbar, useManagerData, money } from "../../components/manager/ManagerUI";

const empty = { title:"", description:"", price:"0", duration_hours:"", status:"draft", instructor_id:"", thumbnail:"" };

function CourseModal({ value, teachers, onClose, onSave, busy }) {
  const [form, setForm] = useState(value || empty);
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">{value?.id ? "Edit course" : "Add new course"}</h2><p className="mt-1 text-sm text-slate-500">Manager controls the catalog and teacher assignment.</p></div><button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100"><X size={18}/></button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2 text-sm font-semibold">Course title<input value={form.title} onChange={e=>set("title",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal" /></label>
        <label className="sm:col-span-2 text-sm font-semibold">Description<textarea value={form.description||""} onChange={e=>set("description",e.target.value)} rows={4} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
        <label className="text-sm font-semibold">Price<input type="number" min="0" value={form.price} onChange={e=>set("price",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal" /></label>
        <label className="text-sm font-semibold">Duration (hours)<input type="number" min="0" value={form.duration_hours} onChange={e=>set("duration_hours",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal" /></label>
        <label className="text-sm font-semibold">Status<select value={form.status} onChange={e=>set("status",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <label className="text-sm font-semibold">Teacher<select value={form.instructor_id||""} onChange={e=>set("instructor_id",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal"><option value="">Unassigned</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.full_name||t.email}</option>)}</select></label>
        <label className="sm:col-span-2 text-sm font-semibold">Thumbnail URL<input value={form.thumbnail||""} onChange={e=>set("thumbnail",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal" placeholder="https://..." /></label>
      </div>
      <div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-xl border px-4 py-2 text-sm font-semibold">Cancel</button><button disabled={busy} onClick={()=>onSave(form)} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy?"Saving…":"Save course"}</button></div>
    </div>
  </div>;
}

export default function Courses() {
  const {data,error,loading,reload}=useManagerData(async()=>Promise.all([getCourses(),getTeachers(),getEnrollments()]));
  const [search,setSearch]=useState(""); const [modal,setModal]=useState(null); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  const [courses,teachers,enrollments]=data||[[],[],[]];
  const rows=useMemo(()=>courses.filter(c=>`${c.title||""} ${c.slug||""}`.toLowerCase().includes(search.toLowerCase())).map(c=>({...c,teacher:teachers.find(t=>t.id===c.instructor_id)?.full_name||"Unassigned",students:enrollments.filter(e=>e.course_id===c.id).length})),[courses,teachers,enrollments,search]);
  if(loading)return <LoadingState/>; if(error)return <ErrorState onRetry={reload}/>;

  const save=async(form)=>{setBusy(true);setMessage("");try{await saveCourse(form,form.id);setModal(null);setMessage("Course saved successfully.");await reload()}catch(e){setMessage(e.message||"Course could not be saved.")}finally{setBusy(false)}};
  const remove=async(id)=>{if(!confirm("Delete this course? Enrollments and course content may be affected."))return;try{await deleteCourse(id);setMessage("Course deleted.");await reload()}catch(e){setMessage(e.message||"Course could not be deleted.")}};
  const assign=async(c)=>{const teacher=prompt(`Enter teacher name for "${c.title}". Leave blank to unassign.`,c.teacher==="Unassigned"?"":c.teacher);if(teacher===null)return;const found=teachers.find(t=>(t.full_name||"").toLowerCase()===teacher.trim().toLowerCase()||(t.email||"").toLowerCase()===teacher.trim().toLowerCase());if(teacher.trim()&&!found){setMessage("Teacher not found. Use Edit course to select a teacher.");return}try{await assignCourseTeacher(c.id,found?.id||null);await reload();setMessage("Teacher assignment updated.")}catch(e){setMessage(e.message||"Assignment failed.")}};
  return <><PageHeader title="Courses" description="Create, edit and assign every course from the Manager Portal." icon={BookOpen} action={<button onClick={()=>setModal(empty)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17}/>Add course</button>}/>
  {message&&<div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}
  <Toolbar search={search} setSearch={setSearch}/>
  <Table rows={rows} columns={[
    {key:"title",label:"Course",render:r=><div><p className="font-semibold">{r.title}</p><p className="text-xs text-slate-400">{money(r.price,"PKR")} · {r.duration_hours||0} hrs</p></div>},
    {key:"teacher",label:"Teacher"},
    {key:"students",label:"Students"},
    {key:"status",label:"Status",render:r=><StatusBadge status={r.status}/>},
    {key:"actions",label:"Actions",render:r=><div className="flex gap-1"><button title="Edit course" onClick={()=>setModal(r)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Pencil size={16}/></button><button title="Assign teacher" onClick={()=>assign(r)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"><UserCheck size={16}/></button><button title="Delete course" onClick={()=>remove(r.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16}/></button></div>}
  ]}/>
  {modal&&<CourseModal value={modal} teachers={teachers} onClose={()=>setModal(null)} onSave={save} busy={busy}/>}
  </>;
}
