import { useEffect, useMemo, useState } from "react";
import { Check, KeyRound, RefreshCw, Search, ShieldCheck, X } from "lucide-react";
import { listTable } from "../../services/adminService";
import { supabase } from "../../lib/supabase";
import { AdminPage, Badge, State } from "./_ui";

const ROLE_ORDER = ["Admin", "Manager", "Teacher", "Student"];

const friendlyPermissionError = (error) => {
  if (!error) return "Unable to update permission.";
  const message = error.message || "Unable to update permission.";
  if (/row-level security|permission denied|policy/i.test(message)) {
    return "Only an Admin can change role permissions. Check the Admin RLS policy if you are signed in as Admin.";
  }
  return message;
};

export default function Permissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [category, setCategory] = useState("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    setNotice(null);

    const [roleResult, permissionResult, assignmentResult] = await Promise.all([
      listTable("roles", { select: "id,name", order: "id", ascending: true, limit: 100 }),
      listTable("permissions", { select: "id,name,description,category,created_at", order: "category", ascending: true, limit: 500 }),
      listTable("role_permissions", { select: "id,role_id,permission_id,created_at", order: "id", ascending: true, limit: 1000 }),
    ]);

    const firstError = roleResult.error || permissionResult.error || assignmentResult.error;
    if (firstError) {
      setError(firstError);
      setLoading(false);
      return;
    }

    const orderedRoles = [...(roleResult.data || [])].sort((a, b) => {
      const ai = ROLE_ORDER.indexOf(a.name);
      const bi = ROLE_ORDER.indexOf(b.name);
      if (ai === -1 && bi === -1) return String(a.name).localeCompare(String(b.name));
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    setRoles(orderedRoles);
    setPermissions(permissionResult.data || []);
    setAssignments(assignmentResult.data || []);
    setSelectedRole((current) => current || String(orderedRoles[0]?.id || ""));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const selectedRoleRecord = useMemo(
    () => roles.find((role) => String(role.id) === String(selectedRole)) || null,
    [roles, selectedRole]
  );

  const categories = useMemo(() => {
    const values = [...new Set(permissions.map((permission) => permission.category).filter(Boolean))];
    return values.sort((a, b) => a.localeCompare(b));
  }, [permissions]);

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return permissions.filter((permission) => {
      const matchesCategory = category === "all" || permission.category === category;
      const matchesSearch = !query || [permission.name, permission.description, permission.category]
        .some((value) => String(value || "").toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [permissions, search, category]);

  const assignedIds = useMemo(() => {
    const set = new Set();
    assignments.forEach((assignment) => {
      if (String(assignment.role_id) === String(selectedRole)) set.add(String(assignment.permission_id));
    });
    return set;
  }, [assignments, selectedRole]);

  const togglePermission = async (permission) => {
    if (!selectedRoleRecord || busyKey) return;

    const key = `${selectedRoleRecord.id}:${permission.id}`;
    const currentlyEnabled = assignedIds.has(String(permission.id));
    setBusyKey(key);
    setError(null);
    setNotice(null);

    if (currentlyEnabled) {
      const { error: deleteError } = await supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", selectedRoleRecord.id)
        .eq("permission_id", permission.id);

      if (deleteError) {
        setError(friendlyPermissionError(deleteError));
        setBusyKey("");
        return;
      }

      setAssignments((current) => current.filter(
        (item) => !(String(item.role_id) === String(selectedRoleRecord.id) && String(item.permission_id) === String(permission.id))
      ));
      setNotice(`${permission.name} removed from ${selectedRoleRecord.name}.`);
    } else {
      const { data, error: insertError } = await supabase
        .from("role_permissions")
        .insert({ role_id: selectedRoleRecord.id, permission_id: permission.id })
        .select("id,role_id,permission_id,created_at")
        .single();

      if (insertError) {
        setError(friendlyPermissionError(insertError));
        setBusyKey("");
        return;
      }

      setAssignments((current) => [...current, data]);
      setNotice(`${permission.name} granted to ${selectedRoleRecord.name}.`);
    }

    setBusyKey("");
  };

  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce((groups, permission) => {
      const key = permission.category || "general";
      if (!groups[key]) groups[key] = [];
      groups[key].push(permission);
      return groups;
    }, {});
  }, [filteredPermissions]);

  return (
    <AdminPage
      title="Permissions"
      description="Fine-grained permission management."
      icon={KeyRound}
      actions={
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      }
    >
      {loading ? (
        <State loading />
      ) : error ? (
        <State error={error} onRetry={load} />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <ShieldCheck size={18} className="text-blue-600" />
                Select role
              </div>
              <div className="space-y-2">
                {roles.map((role) => {
                  const count = assignments.filter((item) => String(item.role_id) === String(role.id)).length;
                  const active = String(role.id) === String(selectedRole);
                  return (
                    <button
                      type="button"
                      key={role.id}
                      onClick={() => setSelectedRole(String(role.id))}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition ${active ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={`font-semibold ${active ? "text-blue-700" : "text-slate-800"}`}>{role.name}</span>
                        <Badge tone={role.name === "Admin" ? "blue" : "slate"}>{count}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{count} assigned permissions</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">{selectedRoleRecord?.name || "Role"} permissions</h2>
                    <p className="mt-1 text-sm text-slate-500">Enable or disable capabilities for this role. Changes are saved directly to Supabase.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search permissions..."
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white sm:w-64"
                      />
                    </div>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="all">All categories</option>
                      {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {notice && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {notice}
                </div>
              )}

              {Object.keys(groupedPermissions).length === 0 ? (
                <State empty />
              ) : (
                Object.entries(groupedPermissions).map(([group, items]) => (
                  <section key={group} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                      <h3 className="font-bold capitalize text-slate-900">{group}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">{items.length} permission{items.length === 1 ? "" : "s"}</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {items.map((permission) => {
                        const enabled = assignedIds.has(String(permission.id));
                        const busy = busyKey === `${selectedRoleRecord?.id}:${permission.id}`;
                        return (
                          <div key={permission.id} className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-slate-50/70">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">{permission.name}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{permission.description || "No description provided."}</p>
                            </div>
                            <button
                              type="button"
                              aria-pressed={enabled}
                              aria-label={`${enabled ? "Disable" : "Enable"} ${permission.name}`}
                              disabled={busy || !selectedRoleRecord}
                              onClick={() => togglePermission(permission)}
                              className={`relative flex h-9 w-[68px] shrink-0 items-center rounded-full p-1 transition ${enabled ? "bg-blue-600" : "bg-slate-200"} disabled:cursor-wait disabled:opacity-70`}
                            >
                              <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-7" : "translate-x-0"}`}>
                                {busy ? <RefreshCw size={14} className="animate-spin text-slate-500" /> : enabled ? <Check size={15} className="text-blue-600" /> : <X size={15} className="text-slate-400" />}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
