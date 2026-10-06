import { useMemo, useState } from "react";
import { ArrowRightLeft, Users } from "lucide-react";
import { changeStudentCourse, getCourses, getEnrollments, getStudents } from "../../services/managerService";
import { ErrorState, LoadingState, PageHeader, StatusBadge, Table, Toolbar, useManagerData, formatDate } from "../../components/manager/ManagerUI";

export default function Students(){
 const {data,error,loading,reload}=useManagerData(async()=>Promise.all([getStudents(),getEnrollments(),getCourses()]));
 const [search,setSearch]=useState(""); const [saving,setSaving]=useState(""); const [message,setMessage]=useState(""); const [editing,setEditing]=useState(null); const [newCourse,setNewCourse]=useState("");
 const [students,enrollments,courses]=data||[[],[],[]];
 const rows=useMemo(()=>students.filter(s=>`${s.full_name||""} ${s.email||""}`.toLowerCase().includes(search.toLowerCase())).map(s=>{
   const e=enrollments.find(x=>x.student_id===s.id); const c=courses.find(x=>x.id===e?.course_id);
   return {...s,enrollment:e,course:c?.title||"Not enrolled",progress:e?.progress??0,status:e?.status||"not enrolled"};
 }),[students,enrollments,courses,search]);
 if(loading)return <LoadingState/>; if(error)return <ErrorState onRetry={reload}/>;
 const change=async(row)=>{
   if(!newCourse || newCourse===row.enrollment?.course_id)return;
   setSaving(row.id);setMessage("");
   try{await changeStudentCourse(row.enrollment.id,newCourse);setMessage(`Course changed for ${row.full_name||row.email}.`);setEditing(null);setNewCourse("");await reload()}catch(e){setMessage(e.message||"Could not change the student's course.")}finally{setSaving("")}
 };
 return <><PageHeader title="Students" description="Move an enrolled student from one course to another without changing their account." icon={Users}/>
 {message&&<div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}
 <Toolbar search={search} setSearch={setSearch}/>
 <Table rows={rows} empty="No students found." columns={[
  {key:"full_name",label:"Student",render:r=><div><p className="font-semibold">{r.full_name||"Unnamed student"}</p><p className="text-xs text-slate-400">{r.email||"—"}</p></div>},
  {key:"course",label:"Current course"},
  {key:"enrolled_at",label:"Enrolled",render:r=>formatDate(r.enrollment?.enrolled_at)},
  {key:"progress",label:"Progress",render:r=><span>{r.progress}%</span>},
  {key:"status",label:"Status",render:r=><StatusBadge status={r.status}/>},
  {key:"action",label:"Change course",render:r=>r.enrollment ? (editing===r.id ? <div className="flex items-center gap-2"><select value={newCourse} onChange={e=>setNewCourse(e.target.value)} className="h-9 max-w-[190px] rounded-lg border px-2 text-xs"><option value="">Select course</option>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select><button disabled={!newCourse||saving===r.id} onClick={()=>change(r)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{saving===r.id?"…":"Save"}</button><button onClick={()=>{setEditing(null);setNewCourse("")}} className="rounded-lg border px-3 py-2 text-xs">Cancel</button></div> : <button onClick={()=>{setEditing(r.id);setNewCourse(r.enrollment.course_id)}} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"><ArrowRightLeft size={15}/>Change</button>) : <span className="text-xs text-slate-400">Not enrolled</span>}
 ]}/></>;
}
