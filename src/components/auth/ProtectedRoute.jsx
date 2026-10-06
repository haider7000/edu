import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const {
    user,
    role,
    loading,
    dashboardPath,
  } = useAuth();

  const location = useLocation();

  /*
   * ------------------------------------------------------------
   * AUTH LOADING
   * ------------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm font-medium text-slate-500">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------
   * NOT LOGGED IN
   * ------------------------------------------------------------
   */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  /*
   * ------------------------------------------------------------
   * ROLE STILL NOT AVAILABLE
   * ------------------------------------------------------------
   */

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-lg font-bold text-amber-700">!</div>
          <h2 className="text-lg font-bold text-slate-900">Account role required</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your login is valid, but this account has no academy role assigned yet.
            Ask an administrator to assign Student, Teacher, Manager, or Admin access.
          </p>
          <button
            onClick={() => window.location.assign("/")}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to website
          </button>
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------
   * NO ALLOWED ROLE RESTRICTION
   * ------------------------------------------------------------
   */

  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  /*
   * ------------------------------------------------------------
   * ROLE CHECK
   * ------------------------------------------------------------
   */

  const normalizedRole = String(role)
    .trim()
    .toLowerCase();

  const normalizedAllowedRoles =
    allowedRoles.map((allowedRole) =>
      String(allowedRole)
        .trim()
        .toLowerCase()
    );

  const isAuthorized =
    normalizedAllowedRoles.includes(
      normalizedRole
    );

  /*
   * ------------------------------------------------------------
   * AUTHORIZED
   * ------------------------------------------------------------
   */

  if (isAuthorized) {
    return children;
  }

  /*
   * ------------------------------------------------------------
   * WRONG DASHBOARD
   * ------------------------------------------------------------
   *
   * Example:
   *
   * Teacher opens:
   * /student/dashboard
   *
   * Instead of showing 403:
   *
   * Teacher -> /teacher/dashboard
   */

  console.warn(
    "PROTECTED ROUTE: WRONG ROLE DASHBOARD",
    {
      role,
      allowedRoles,
      currentPath: location.pathname,
      correctDashboard: dashboardPath,
    }
  );

  if (dashboardPath) {
    return (
      <Navigate
        to={dashboardPath}
        replace
      />
    );
  }

  /*
   * ------------------------------------------------------------
   * FALLBACK
   * ------------------------------------------------------------
   */

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <span className="text-xl font-bold">
            403
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Access denied
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          You don't have permission to access this area.
        </p>

        <div className="mt-6 flex justify-center gap-3">

          <button
            onClick={() => {
              window.location.href =
                "/";
            }}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Go to website
          </button>

          {dashboardPath && (
            <button
              onClick={() => {
                window.location.href =
                  dashboardPath;
              }}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              My dashboard
            </button>
          )}

        </div>

      </div>
    </div>
  );
}