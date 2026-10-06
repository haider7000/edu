import { useMemo, useState } from "react";
import { ClipboardCheck, Clock3 } from "lucide-react";
import { getTeacherAttendance, getTeachers, saveTeacherAttendance } from "../../services/managerService";
import { ErrorState, LoadingState, PageHeader, StatCard, StatusBadge, Table, Toolbar, useManagerData, formatDate } from "../../components/manager/ManagerUI";

const statuses=["present","absent","late","leave","half_day"];
const today=()=>new Date().toISOString().slice(0,10);

export default function TeacherAttendance(){
 const {data,error,loading,reload}=useManagerData(async()=>Promise.all([getTeachers(),getTeacherAttendance()]));
 const [search,setSearch]=useState(""); const [date,setDate]=useState(today()); const [saving,setSaving]=useState(""); const [message,setMessage]=useState("");
 const [teachers,records]=data||[[],[]];
 const rows=useMemo(()=>teachers.filter(t=>`${t.full_name||""} ${t.email||""}`.toLowerCase().includes(search.toLowerCase())).map(t=>({...t,record:records.find(r=>r.teacher_id===t.id&&r.attendance_date===date)})),[teachers,records,search,date]);
 if(loading)return <LoadingState/>; if(error)return <ErrorState onRetry={reload}/>;
 const mark=async(t,status)=>{
   setSaving(t.id);setMessage("");
   try{await saveTeacherAttendance({teacher_id:t.id,attendance_date:date,status,check_in:status==="present"||status==="late"?new Date().toISOString():null});setMessage(`Attendance marked for ${t.full_name||t.email}.`);await reload()}catch(e){setMessage(e.message||"Attendance could not be saved.")}finally{setSaving("")}
 };
 const count=s=>rows.filter(r=>r.record?.status===s).length;
 return <><PageHeader title="Teacher Attendance" description="View every teacher's daily attendance and mark staff attendance from the Manager Portal." icon={ClipboardCheck}/>
 {message&&<div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}
 <div className="mb-6 grid gap-4 sm:grid-cols-3"><StatCard label="Present" value={count("present")} icon={ClipboardCheck} tone="green"/><StatCard label="Absent" value={count("absent")} icon={Clock3} tone="red"/><StatCard label="Late / Leave" value={count("late")+count("leave")+count("half_day")} icon={Clock3} tone="amber"/></div>
 <Toolbar search={search} setSearch={setSearch}><label className="flex items-center gap-2 text-sm font-semibold">Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="h-10 rounded-xl border px-3 font-normal"/></label></Toolbar>
 <Table rows={rows} empty="No teachers found." columns={[
  {key:"full_name",label:"Teacher",render:r=><div><p className="font-semibold">{r.full_name||"Unnamed teacher"}</p><p className="text-xs text-slate-400">{r.email||"—"}</p></div>},
  {key:"attendance",label:"Attendance",render:r=><StatusBadge status={r.record?.status||"not marked"}/>},
  {key:"marked",label:"Marked",render:r=>r.record?.created_at?formatDate(r.record.created_at):"—"},
  {key:"actions",label:"Mark",render:r=><div className="flex flex-wrap gap-1">{statuses.map(s=><button key={s} disabled={saving===r.id} onClick={()=>mark(r,s)} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${r.record?.status===s?"bg-blue-600 text-white":"border border-slate-200 hover:bg-slate-50"} disabled:opacity-50`}>{s.replace("_"," ")}</button>)}</div>}
 ]}/></>;
}
