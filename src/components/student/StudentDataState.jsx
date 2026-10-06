import { AlertCircle, Inbox, RefreshCw } from "lucide-react";

export function LoadingState({ label = "Loading your data..." }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

export function ErrorState({ message = "We couldn't load this information right now.", onRetry }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-white p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <AlertCircle size={22} />
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-950">Something went wrong</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      {onRetry && (
        <button onClick={onRetry} type="button" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          <RefreshCw size={15} /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, icon: Icon = Inbox, action }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center sm:px-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon size={25} />
      </div>
      <h2 className="mt-5 text-lg font-bold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="text-sm font-semibold text-blue-600">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function formatDate(value, fallback = "—") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function formatDateTime(value, fallback = "—") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function money(amount, currency = "PKR") {
  if (amount === null || amount === undefined || amount === "") return "—";
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(amount)); }
  catch { return `${currency} ${amount}`; }
}
