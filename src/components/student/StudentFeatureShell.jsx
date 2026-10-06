import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function PageHeader({ eyebrow = "Student Portal", title, description, action }) {
  return (
    <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold text-blue-600">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action}
    </motion.header>
  );
}

export function EmptyState({ icon: Icon = Sparkles, title, description, action, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center sm:px-10">
      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${tones[tone] || tones.blue}`}><Icon size={25} /></div>
      <h2 className="mt-5 text-lg font-bold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{description}</p>
      {action}
    </div>
  );
}

export function EmptyAction({ to, children = "Explore courses" }) {
  return <Link to={to} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">{children}<ArrowRight size={16} /></Link>;
}

export function FilterBar({ filters = [], active = "All", onChange, search, onSearch, placeholder = "Search...", select }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {filters.length > 0 && <div className="flex flex-wrap gap-2">{filters.map((filter) => <button key={filter} type="button" onClick={() => onChange?.(filter)} className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${active === filter ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>{filter}</button>)}</div>}
      <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl lg:justify-end">
        {onSearch && <label className="relative block min-w-0 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search || ""} onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"/></label>}
        {select}
      </div>
    </div>
  </section>;
}

export function SummaryGrid({ items }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map(({ label, value = "—", description, icon: Icon }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{Icon && <Icon size={19}/>}</div><span className="text-2xl font-bold text-slate-900">{value}</span></div><p className="mt-4 text-sm font-semibold text-slate-800">{label}</p><p className="mt-1 text-xs text-slate-500">{description}</p></div>)}</div>;
}

export function PlaceholderTable({ columns, rows = 4 }) {
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{columns.map((c) => <th key={c} className="px-5 py-4 font-bold">{c}</th>)}</tr></thead><tbody>{Array.from({ length: rows }).map((_, i) => <tr key={i} className="border-t border-slate-100"><td colSpan={columns.length} className="px-5 py-5 text-center text-xs text-slate-400">Connected records will appear here</td></tr>)}</tbody></table></div><div className="space-y-3 p-4 md:hidden">{Array.from({ length: rows }).map((_, i) => <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-400">Connected records will appear here</div>)}</div></div>;
}

export function ConnectedNotice({ children = "This area is ready for real platform data. No demo records are being shown." }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-800"><Sparkles size={18} className="mt-0.5 shrink-0"/><p>{children}</p></div>;
}
