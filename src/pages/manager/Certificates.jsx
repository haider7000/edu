import { useState } from "react";
import { FileBadge } from "lucide-react";
import { getCertificates,getStudents,getCourses,getEnrollments,issueCertificate } from "../../services/managerService";
import { BackendState,ErrorState,LoadingState,PageHeader,StatusBadge,Table,Toolbar,useManagerData,formatDate } from "../../components/manager/ManagerUI";

export default function Certificates(){
 const {data,error,loading,reload}=useManagerData(async()=>Promise.all([getCertificates(),getStudents(),getCourses(),getEnrollments()]));
 const [search,setSearch]=useState(""); const [busy,setBusy]=useState(null); const [message,setMessage]=useState("");
 if(loading)return <LoadingState/>; if(error)return <ErrorState onRetry={reload}/>;
 const [certs,students,courses,enrollments]=data;
 const rows=students.filter(s=>`${s.full_name||""} ${s.email||""}`.toLowerCase().includes(search.toLowerCase())).flatMap(s=>{
   const eligible=enrollments.filter(x=>x.student_id===s.id&&x.status==="completed"&&Number(x.progress||0)>=100);
   const source=eligible.length?eligible:enrollments.filter(x=>x.student_id===s.id);
   return source.length?source.map(e=>{const c=courses.find(x=>x.id===e.course_id),issued=certs.find(x=>x.student_id===s.id&&x.course_id===e.course_id);return {id:e.id,studentId:s.id,courseId:e.course_id,student:s.full_name||"—",course:c?.title||"—",completion:e.progress||0,certificate:issued?.certificate_number||"Not issued",issued_at:issued?.issued_at,status:issued?"issued":e.status==="completed"&&Number(e.progress||0)>=100?"eligible":"in progress"}}):[{id:s.id,studentId:s.id,courseId:null,student:s.full_name||"—",course:"—",completion:0,certificate:"Not issued",status:"in progress"}]
 });
 const issue=async row=>{if(!row.courseId)return;setBusy(row.id);setMessage("");try{await issueCertificate(row.studentId,row.courseId);setMessage("Certificate issued successfully.");await reload()}catch(e){console.error(e);setMessage("Certificate was not issued. Apply the Phase 5 RLS migration and ensure the enrollment is completed at 100%.")}finally{setBusy(null)}};
 return <><PageHeader title="Certificates" description="Track eligibility and issue certificates only for completed enrollments." icon={FileBadge}/><BackendState title="Completion-aware certificate issuance" description="Issuance is protected by a Supabase RLS policy that requires a completed enrollment with progress of at least 100%. The browser never bypasses that check."/><div className="mt-6">{message&&<p className="mb-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{message}</p>}<Toolbar search={search} setSearch={setSearch}/><Table rows={rows} columns={[{key:"student",label:"Student"},{key:"course",label:"Course"},{key:"completion",label:"Completion",render:r=>`${r.completion}%`},{key:"certificate",label:"Certificate ID"},{key:"issued_at",label:"Issue date",render:r=>formatDate(r.issued_at)},{key:"status",label:"Status",render:r=><StatusBadge status={r.status}/>},{key:"id",label:"Action",render:r=>r.status==="eligible"?<button disabled={busy===r.id} onClick={()=>issue(r)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{busy===r.id?"Issuing…":"Issue"}</button>:"—"}]}/></div></>;
}
