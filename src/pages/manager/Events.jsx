import { useState } from "react";
import { CalendarPlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteEvent, getEvents, saveEvent } from "../../services/managerService";
import { ErrorState, LoadingState, PageHeader, StatusBadge, Table, Toolbar, useManagerData, formatDateTime } from "../../components/manager/ManagerUI";

const blank={title:"",description:"",event_type:"general",starts_at:"",ends_at:"",location:"",audience:"all",status:"published"};

function toInput(value){if(!value)return "";const d=new Date(value);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
function EventModal({initial,onClose,onSave,busy}){
 const [form,setForm]=useState({...blank,...initial,starts_at:toInput(initial?.starts_at),ends_at:toInput(initial?.ends_at)});
 const set=(k,v)=>setForm(f=>({...f,[k]:v}));
 return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
  <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">{initial?.id?"Edit event":"New event"}</h2><p className="mt-1 text-sm text-slate-500">Events are stored in Supabase and can be shown to the selected audience.</p></div><button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100"><X size={18}/></button></div>
  <div className="mt-6 grid gap-4 sm:grid-cols-2">
   <label className="sm:col-span-2 text-sm font-semibold">Title<input value={form.title} onChange={e=>set("title",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal"/></label>
   <label className="sm:col-span-2 text-sm font-semibold">Description<textarea rows="3" value={form.description||""} onChange={e=>set("description",e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal"/></label>
   <label className="text-sm font-semibold">Start<input type="datetime-local" value={form.starts_at} onChange={e=>set("starts_at",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal"/></label>
   <label className="text-sm font-semibold">End<input type="datetime-local" value={form.ends_at} onChange={e=>set("ends_at",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal"/></label>
   <label className="text-sm font-semibold">Type<select value={form.event_type} onChange={e=>set("event_type",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal">{["general","academic","meeting","holiday","workshop","exam","orientation"].map(x=><option key={x}>{x}</option>)}</select></label>
   <label className="text-sm font-semibold">Audience<select value={form.audience} onChange={e=>set("audience",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal">{["all","students","teachers","managers"].map(x=><option key={x}>{x}</option>)}</select></label>
   <label className="text-sm font-semibold">Location<input value={form.location||""} onChange={e=>set("location",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal" placeholder="Room, online, etc."/></label>
   <label className="text-sm font-semibold">Status<select value={form.status} onChange={e=>set("status",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal">{["draft","published","cancelled","completed"].map(x=><option key={x}>{x}</option>)}</select></label>
  </div>
  <div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-xl border px-4 py-2 text-sm font-semibold">Cancel</button><button disabled={busy} onClick={()=>onSave(form)} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy?"Saving…":"Save event"}</button></div>
 </div></div>
}

export default function Events(){
 const {data,error,loading,reload}=useManagerData(getEvents);
 const [search,setSearch]=useState("");const [modal,setModal]=useState(null);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 if(loading)return <LoadingState/>;if(error)return <ErrorState onRetry={reload}/>;
 const rows=(data||[]).filter(e=>`${e.title} ${e.event_type} ${e.audience}`.toLowerCase().includes(search.toLowerCase()));
 const save=async(form)=>{setBusy(true);setMessage("");try{await saveEvent({...form,starts_at:new Date(form.starts_at).toISOString(),ends_at:new Date(form.ends_at).toISOString()},form.id);setModal(null);setMessage("Event saved.");await reload()}catch(e){setMessage(e.message||"Event could not be saved.")}finally{setBusy(false)}};
 const remove=async(id)=>{if(!confirm("Delete this event?"))return;try{await deleteEvent(id);setMessage("Event deleted.");await reload()}catch(e){setMessage(e.message||"Event could not be deleted.")}};
 return <><PageHeader title="Events" description="Create and manage academy events for students, teachers or everyone." icon={CalendarPlus} action={<button onClick={()=>setModal(blank)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17}/>New event</button>}/>{message&&<div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}<Toolbar search={search} setSearch={setSearch}/><Table rows={rows} empty="No events created yet." columns={[
 {key:"title",label:"Event",render:r=><div><p className="font-semibold">{r.title}</p><p className="text-xs text-slate-400">{r.event_type} · {r.audience}</p></div>},
 {key:"starts_at",label:"Start",render:r=>formatDateTime(r.starts_at)},
 {key:"ends_at",label:"End",render:r=>formatDateTime(r.ends_at)},
 {key:"location",label:"Location"},
 {key:"status",label:"Status",render:r=><StatusBadge status={r.status}/>},
 {key:"actions",label:"Actions",render:r=><div className="flex gap-1"><button onClick={()=>setModal(r)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Pencil size={16}/></button><button onClick={()=>remove(r.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16}/></button></div>}
 ]}/>{modal&&<EventModal initial={modal} onClose={()=>setModal(null)} onSave={save} busy={busy}/>}</>;
}
