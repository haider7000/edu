import { useMemo, useState } from "react";
import { CheckCircle2, Eye, UserPlus, XCircle } from "lucide-react";
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
  Toolbar,
  useManagerData,
  formatDate,
} from "../../components/manager/ManagerUI";
import { getAdmissions, updateAdmission } from "../../services/managerService";

const statuses = ["pending", "approved", "rejected", "interview", "enrolled"];

export default function Admissions() {
  const { data, loading, error, reload } = useManagerData(getAdmissions, []);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "" });
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const admissions = data || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return admissions.filter((item) => {
      const matchesStatus = !filters.status || item.status === filters.status;
      const haystack = [
        item.first_name,
        item.last_name,
        item.email,
        item.phone,
        item.city,
        item.course_name,
      ].filter(Boolean).join(" ").toLowerCase();
      return matchesStatus && (!q || haystack.includes(q));
    });
  }, [admissions, filters.status, search]);

  const counts = useMemo(() => statuses.reduce((acc, status) => {
    acc[status] = admissions.filter((item) => item.status === status).length;
    return acc;
  }, {}), [admissions]);

  const changeStatus = async (id, status) => {
    try {
      setBusyId(id);
      await updateAdmission(id, status);
      await reload();
      setSelected((current) => current?.id === id ? { ...current, status } : current);
    } catch (err) {
      console.error(err);
      window.alert(err?.message || "Unable to update admission.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !data) return <LoadingState text="Loading admissions…" />;
  if (error) return <ErrorState onRetry={reload} message={error.message || "Unable to load admissions."} />;

  return (
    <>
      <PageHeader
        title="Admissions"
        description="Review applications submitted through the public admission form and update their status."
        icon={UserPlus}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statuses.map((status) => (
          <Card key={status} className="p-5">
            <p className="text-sm font-semibold capitalize text-slate-500">{status}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{counts[status] || 0}</p>
            <p className="mt-1 text-xs text-slate-400">Applications</p>
          </Card>
        ))}
      </div>

      <Toolbar
        search={search}
        setSearch={setSearch}
        filters={[{ key: "status", label: "All statuses", options: statuses }]}
        value={filters}
        setValue={setFilters}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Education</th>
                <th className="px-4 py-3 font-semibold">Applied</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length ? filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{item.first_name} {item.last_name}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.email}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{item.course_name || "—"}</td>
                  <td className="px-4 py-4 text-slate-700">{item.education || "—"}</td>
                  <td className="px-4 py-4 text-slate-500">{formatDate(item.created_at)}</td>
                  <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setSelected(item)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        <Eye size={14} /> View
                      </button>
                      {item.status !== "approved" && item.status !== "enrolled" && (
                        <button type="button" disabled={busyId === item.id} onClick={() => changeStatus(item.id, "approved")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50">
                          <CheckCircle2 size={14} /> Approve
                        </button>
                      )}
                      {item.status !== "rejected" && item.status !== "enrolled" && (
                        <button type="button" disabled={busyId === item.id} onClick={() => changeStatus(item.id, "rejected")} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50">
                          <XCircle size={14} /> Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6}><EmptyState title="No admissions found" description="Applications submitted through the public form will appear here." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Admission application</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">{selected.first_name} {selected.last_name}</h2>
                <p className="mt-1 text-sm text-slate-500">{selected.email}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Detail label="Phone" value={selected.phone} />
              <Detail label="City" value={selected.city} />
              <Detail label="Education" value={selected.education} />
              <Detail label="Institution" value={selected.institution} />
              <Detail label="Experience" value={selected.experience} />
              <Detail label="Course" value={selected.course_name} />
            </div>

            <Detail label="Learning goal" value={selected.learning_goal} wide />
            <Detail label="Additional information" value={selected.message} wide />

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5">
              <button type="button" onClick={() => setSelected(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Close</button>
              <button type="button" disabled={busyId === selected.id} onClick={() => changeStatus(selected.id, "interview")} className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50">Move to interview</button>
              <button type="button" disabled={busyId === selected.id} onClick={() => changeStatus(selected.id, "rejected")} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Reject</button>
              <button type="button" disabled={busyId === selected.id} onClick={() => changeStatus(selected.id, "approved")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Approve</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Detail({ label, value, wide = false }) {
  return (
    <div className={wide ? "mt-5 sm:col-span-2" : "rounded-xl border border-slate-100 bg-slate-50 p-4"}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`${wide ? "mt-2 rounded-xl border border-slate-100 bg-slate-50 p-4" : "mt-1"} whitespace-pre-wrap text-sm leading-6 text-slate-700`}>{value || "—"}</p>
    </div>
  );
}
