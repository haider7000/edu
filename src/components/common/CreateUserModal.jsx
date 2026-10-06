import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function CreateUserModal({ open, onClose, onCreated, managerMode=false }) {
  const [form,setForm]=useState({full_name:"",email:"",password:"",role:"Student"});
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  if(!open)return null;
  const submit=async(e)=>{e.preventDefault();setBusy(true);setError("");
    const {data,error:fnError}=await supabase.functions.invoke("create-user",{body:form});
    setBusy(false); if(fnError||data?.error){setError(data?.error||fnError?.message||"Unable to create user.");return;}
    setForm({full_name:"",email:"",password:"",role:"Student"}); onCreated?.(data?.user); onClose();
  };
  const roles=managerMode?["Student","Teacher"]:["Student","Teacher","Manager","Admin"];
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-950">Create user</h2><p className="mt-1 text-sm text-slate-500">Creates a real Supabase Auth account and assigns its platform role.</p></div><button type="button" onClick={onClose}><X/></button></div>{error&&<div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}<div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Full name<input required value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal"/></label><label className="block text-sm font-semibold">Email<input required type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal"/></label><label className="block text-sm font-semibold">Temporary password<input required minLength={8} type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal"/><span className="mt-1 block text-xs font-normal text-slate-400">Minimum 8 characters. Share it securely with the user.</span></label><label className="block text-sm font-semibold">Role<select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal">{roles.map(r=><option key={r}>{r}</option>)}</select></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">Cancel</button><button disabled={busy} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy?"Creating…":"Create user"}</button></div></form></div>;
}
