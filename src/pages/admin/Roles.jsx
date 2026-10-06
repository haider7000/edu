import { useEffect, useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Save,
  Search,
} from "lucide-react";

import {
  listTable,
  listUsersWithRoles,
  changeUserRole,
} from "../../services/adminService";

import {
  AdminPage,
  AdminTable,
  Badge,
  State,
} from "./_ui";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);

    const [rolesResult, usersResult] = await Promise.all([
      listTable("roles", {
        select: "id,name",
        order: "id",
        ascending: true,
      }),

      listUsersWithRoles(),
    ]);

    if (rolesResult.error) {
      setError(rolesResult.error);
    } else if (usersResult.error) {
      setError(usersResult.error);
    } else {
      setRoles(rolesResult.data || []);
      setUsers(usersResult.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (userId, roleId) => {
    setSaving(userId);

    const result = await changeUserRole(userId, roleId);

    if (result.error) {
      alert(result.error.message || "Failed to change role.");
      setSaving(null);
      return;
    }

    setUsers((current) =>
      current.map((user) => {
        if (user.id !== userId) return user;

        const role = roles.find(
          (item) => String(item.id) === String(roleId)
        );

        return {
          ...user,
          role_id: roleId,
          role_name: role?.name || "Unknown",
        };
      })
    );

    setSaving(null);
  };

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role_name?.toLowerCase().includes(query)
    );
  });

  return (
    <AdminPage
      title="Roles"
      description="Manage user roles and control access across the platform."
      icon={ShieldCheck}
      actions={
        <button
          onClick={load}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white p-2.5 hover:bg-slate-50 disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
        </button>
      }
    >
      {loading ? (
        <State loading />
      ) : error ? (
        <State error={error} />
      ) : (
        <div className="space-y-6">

          {/* Role summary */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {roles.map((role) => {
              const count = users.filter(
                (user) =>
                  String(user.role_id) === String(role.id)
              ).length;

              return (
                <div
                  key={role.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="text-sm text-slate-500">
                    {role.name}
                  </div>

                  <div className="mt-2 text-2xl font-bold text-slate-900">
                    {count}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    assigned users
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email or role..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          {/* Users */}
          <AdminTable
            rows={filteredUsers}
            columns={[
              {
                key: "full_name",
                label: "User",
                render: (user) => (
                  <div>
                    <div className="font-semibold text-slate-900">
                      {user.full_name}
                    </div>

                    <div className="text-sm text-slate-500">
                      {user.email}
                    </div>
                  </div>
                ),
              },

              {
                key: "role_name",
                label: "Current Role",
                render: (user) => (
                  <Badge
                    tone={
                      user.role_name === "Admin"
                        ? "green"
                        : user.role_name === "Manager"
                        ? "blue"
                        : user.role_name === "Teacher"
                        ? "amber"
                        : "slate"
                    }
                  >
                    {user.role_name}
                  </Badge>
                ),
              },

              {
                key: "role",
                label: "Change Role",
                render: (user) => (
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role_id || ""}
                      disabled={saving === user.id}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    >
                      <option value="" disabled>
                        Select role
                      </option>

                      {roles.map((role) => (
                        <option
                          key={role.id}
                          value={role.id}
                        >
                          {role.name}
                        </option>
                      ))}
                    </select>

                    {saving === user.id && (
                      <Save
                        size={16}
                        className="animate-pulse text-indigo-600"
                      />
                    )}
                  </div>
                ),
              },
            ]}
          />

        </div>
      )}
    </AdminPage>
  );
}