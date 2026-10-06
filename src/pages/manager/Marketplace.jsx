import { useState } from "react";
import { Pencil, Plus, Store, Trash2, X } from "lucide-react";
import { deleteProduct, getProducts, saveProduct } from "../../services/managerService";
import { ErrorState, LoadingState, PageHeader, StatusBadge, Table, Toolbar, useManagerData, money } from "../../components/manager/ManagerUI";

const blank={name:"",description:"",sku:"",price:"0",stock:"0",image_url:"",is_active:true};
function ProductModal({initial,onClose,onSave,busy}){
 const [form,setForm]=useState({...blank,...initial});const set=(k,v)=>setForm(f=>({...f,[k]:v}));
 return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
  <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">{initial?.id?"Edit product":"Add marketplace product"}</h2><p className="mt-1 text-sm text-slate-500">Manage price, stock and visibility.</p></div><button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100"><X size={18}/></button></div>
  <div className="mt-6 grid gap-4 sm:grid-cols-2">
   <label className="sm:col-span-2 text-sm font-semibold">Product name<input value={form.name} onChange={e=>set("name",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal"/></label>
   <label className="text-sm font-semibold">SKU<input value={form.sku||""} onChange={e=>set("sku",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal"/></label>
   <label className="text-sm font-semibold">Price<input type="number" min="0" value={form.price} onChange={e=>set("price",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal"/></label>
   <label className="text-sm font-semibold">Stock<input type="number" min="0" value={form.stock} onChange={e=>set("stock",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal"/></label>
   <label className="text-sm font-semibold">Image URL<input value={form.image_url||""} onChange={e=>set("image_url",e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3 font-normal" placeholder="https://..."/></label>
   <label className="sm:col-span-2 text-sm font-semibold">Description<textarea rows="4" value={form.description||""} onChange={e=>set("description",e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal"/></label>
   <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={form.is_active!==false} onChange={e=>set("is_active",e.target.checked)}/>Visible in marketplace</label>
  </div>
  <div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-xl border px-4 py-2 text-sm font-semibold">Cancel</button><button disabled={busy} onClick={()=>onSave(form)} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy?"Saving…":"Save product"}</button></div>
 </div></div>
}
export default function Marketplace(){
 const {data,error,loading,reload}=useManagerData(getProducts);const [search,setSearch]=useState("");const [modal,setModal]=useState(null);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 if(loading)return <LoadingState/>;if(error)return <ErrorState onRetry={reload}/>;
 const rows=(data||[]).filter(p=>`${p.name} ${p.sku||""}`.toLowerCase().includes(search.toLowerCase()));
 const save=async(form)=>{setBusy(true);setMessage("");try{await saveProduct(form,form.id);setModal(null);setMessage("Product saved.");await reload()}catch(e){setMessage(e.message||"Product could not be saved.")}finally{setBusy(false)}};
 const remove=async(id)=>{if(!confirm("Delete this product? Orders using it may prevent deletion."))return;try{await deleteProduct(id);setMessage("Product deleted.");await reload()}catch(e){setMessage(e.message||"Product could not be deleted.")}};
 return <><PageHeader title="Marketplace" description="Add, edit, price, stock and publish marketplace products." icon={Store} action={<button onClick={()=>setModal(blank)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17}/>Add product</button>}/>{message&&<div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}<Toolbar search={search} setSearch={setSearch}/><Table rows={rows} empty="No marketplace products yet." columns={[
 {key:"name",label:"Product",render:r=><div className="flex items-center gap-3">{r.image_url?<img src={r.image_url} alt="" className="h-10 w-10 rounded-lg object-cover"/>:<div className="h-10 w-10 rounded-lg bg-slate-100"/>}<div><p className="font-semibold">{r.name}</p><p className="text-xs text-slate-400">{r.sku||"No SKU"}</p></div></div>},
 {key:"price",label:"Price",render:r=>money(r.price,"PKR")},
 {key:"stock",label:"Stock"},
 {key:"is_active",label:"Visibility",render:r=><StatusBadge status={r.is_active?"active":"draft"}/>},
 {key:"actions",label:"Actions",render:r=><div className="flex gap-1"><button onClick={()=>setModal(r)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Pencil size={16}/></button><button onClick={()=>remove(r.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16}/></button></div>}
 ]}/>{modal&&<ProductModal initial={modal} onClose={()=>setModal(null)} onSave={save} busy={busy}/>}</>;
}
