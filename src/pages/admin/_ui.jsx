import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plus, RefreshCw, Search, Trash2, Archive, Pencil, Eye, X } from "lucide-react";
import { createRecord, deleteRecord, listTable, updateRecord } from "../../services/adminService";

export function AdminPage({ title, description, icon: Icon, actions, children }) {
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {Icon && <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Icon size={21}/></div>}
          <div><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1><p className="mt-1 text-sm text-slate-500">{description}</p></div>
        </div>
      </div>
      {actions}
    </div>
    {children}
  </div>;
}

export function State({ loading, error, empty, onRetry }) {
  if (loading) return <div className="flex min-h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white"><Loader2 className="animate-spin text-blue-600" size={25}/><span className="ml-2 text-sm text-slate-500">Loading…</span></div>;
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6"><div className="flex gap-3 text-red-700"><AlertCircle className="mt-0.5 shrink-0"/><div><p className="font-semibold">Unable to load this data</p><p className="mt-1 text-sm">{error}</p>{onRetry && <button onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"><RefreshCw size={15}/>Retry</button>}</div></div></div>;
  if (empty) return <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center"><div><p className="font-semibold text-slate-800">No records found.</p><p className="mt-1 text-sm text-slate-500">There is no data available for this section yet.</p></div></div>;
  return null;
}

export function AdminTable({ columns, rows, getKey = (r) => r.id, actions }) {
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{columns.map(c=><th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}{actions && <th className="px-4 py-3 text-right font-semibold">Actions</th>}</tr></thead>
        <tbody className="divide-y divide-slate-100">{rows.map(row=><tr key={getKey(row)} className="hover:bg-slate-50/70">{columns.map(c=><td key={c.key} className="px-4 py-3 text-slate-700">{c.render ? c.render(row) : (row[c.key] ?? "—")}</td>)}{actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}</tr>)}</tbody>
      </table>
    </div>
  </div>;
}

export function Badge({ children, tone="slate" }) {
  const map={slate:"bg-slate-100 text-slate-700",blue:"bg-blue-50 text-blue-700",green:"bg-emerald-50 text-emerald-700",amber:"bg-amber-50 text-amber-700",red:"bg-red-50 text-red-700"};
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${map[tone]||map.slate}`}>{children}</span>;
}

export function Toolbar({ search, setSearch, filters, right }) {
  return <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
    {setSearch && <div className="relative min-w-0 flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white"/></div>}
    {filters}
    {right}
  </div>;
}

export function Confirm({ open, title="Confirm action", message="Are you sure you want to continue?", onCancel, onConfirm, danger=true, busy=false }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h3 className="text-lg font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{message}</p></div><button onClick={onCancel} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div><div className="mt-6 flex justify-end gap-2"><button disabled={busy} onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button disabled={busy} onClick={onConfirm} className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${danger?"bg-red-600 hover:bg-red-700":"bg-blue-600 hover:bg-blue-700"}`}>{busy?<Loader2 className="animate-spin" size={17}/>: "Confirm"}</button></div></div>
  </div>;
}

export function ResourcePage({ config }) {
  const { title, description, icon, table, columns, searchKeys=[], order="created_at", formFields=[], createLabel="Add", canCreate=true, canEdit=true, canDelete=false, transformRow, emptyMessage } = config;
  const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(null),[search,setSearch]=useState(""),[modal,setModal]=useState(false),[editing,setEditing]=useState(null),[busy,setBusy]=useState(false),[confirm,setConfirm]=useState(null);
  const load=async()=>{setLoading(true);setError(null);const r=await listTable(table,{order,limit:500});setRows(r.data||[]);setError(r.error);setLoading(false)};
  useEffect(()=>{load()},[table]);
  const filtered=useMemo(()=>rows.filter(r=>!search || searchKeys.some(k=>String(r[k]??"").toLowerCase().includes(search.toLowerCase()))),[rows,search,searchKeys]);
  const submit=async(e)=>{e.preventDefault();setBusy(true);const fd=new FormData(e.currentTarget);const values={};formFields.forEach(f=>{let v=fd.get(f.name);if(v==="")v=null;if(f.type==="number"&&v!==null)v=Number(v);if(f.type==="checkbox")v=fd.get(f.name)==="on";values[f.name]=v});const r=editing?await updateRecord(table,editing.id,values):await createRecord(table,values);setBusy(false);if(r.error){setError(r.error);return}setModal(false);setEditing(null);load()};
  const remove=async()=>{setBusy(true);const r=await deleteRecord(table,confirm.id);setBusy(false);setConfirm(null);if(r.error){setError(r.error);return}load()};
  return <AdminPage title={title} description={description} icon={icon} actions={canCreate?<button onClick={()=>{setEditing(null);setModal(true)}} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Plus size={17}/>{createLabel}</button>:null}>
    <Toolbar search={search} setSearch={setSearch} right={<button onClick={load} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50" title="Refresh"><RefreshCw size={17}/></button>}/>
    {error && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div>}
    <State loading={loading} error={null} empty={!filtered.length}/>
    {!loading&&filtered.length>0&&<AdminTable columns={columns} rows={filtered.map(transformRow||((x)=>x))} actions={(canEdit||canDelete)?(row)=><div className="flex justify-end gap-1">{canEdit&&<button onClick={()=>{setEditing(row);setModal(true)}} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600" title="Edit"><Pencil size={16}/></button>}{canDelete&&<button onClick={()=>setConfirm(row)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 size={16}/></button>}</div>:undefined}/>
    }
    {modal&&<div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-slate-950">{editing?"Edit":"Create"} {title}</h2><button type="button" onClick={()=>setModal(false)}><X/></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{formFields.map(f=><label key={f.name} className={f.full?"sm:col-span-2":""}><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{f.label}</span>{f.type==="textarea"?<textarea name={f.name} defaultValue={editing?.[f.name]??""} rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"/>:<input name={f.name} type={f.type||"text"} defaultValue={editing?.[f.name]??""} required={f.required} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"/>}</label>)}</div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={()=>setModal(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">Cancel</button><button disabled={busy} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">{busy?<Loader2 className="animate-spin" size={17}/>:editing?"Save changes":"Create"}</button></div></form></div>}
    <Confirm open={!!confirm} onCancel={()=>setConfirm(null)} onConfirm={remove} title="Delete record" message="This action is permanent and may fail when other records depend on it." busy={busy}/>
  </AdminPage>;
}

export function MissingBackend({ title, description, icon, requirements=[] }) {
 return <AdminPage title={title} description={description} icon={icon}><div className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><div className="flex gap-3"><AlertCircle className="text-amber-600"/><div><h2 className="font-bold text-amber-900">Backend support required</h2><p className="mt-1 text-sm text-amber-800">This page is intentionally not pretending to save data because the current schema does not expose a supported backend contract.</p><ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-amber-800">{requirements.map(x=><li key={x}>{x}</li>)}</ul></div></div></div></AdminPage>;
}
