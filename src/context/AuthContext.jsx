import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

/*
|--------------------------------------------------------------------------
| ROLE → DASHBOARD
|--------------------------------------------------------------------------
*/

const ROLE_DASHBOARDS = {
  Student: "/student/dashboard",
  Teacher: "/teacher/dashboard",
  Manager: "/manager/dashboard",
  Admin: "/admin/dashboard",
};

/*
|--------------------------------------------------------------------------
| NORMALIZE ROLE
|--------------------------------------------------------------------------
*/

function normalizeRole(roleName) {
  if (!roleName) {
    return null;
  }

  const value = String(roleName).trim().toLowerCase();

  const roles = {
    student: "Student",
    teacher: "Teacher",
    manager: "Manager",
    admin: "Admin",
  };

  return roles[value] || null;
}

/*
|--------------------------------------------------------------------------
| GET DASHBOARD
|--------------------------------------------------------------------------
*/

export function getDashboardPath(role) {
  if (!role) {
    return null;
  }

  return ROLE_DASHBOARDS[role] || null;
}

/*
|--------------------------------------------------------------------------
| AUTH PROVIDER
|--------------------------------------------------------------------------
*/

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Refs
  |--------------------------------------------------------------------------
  */

  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);

  /*
  |--------------------------------------------------------------------------
  | LOAD PROFILE + ROLE
  |--------------------------------------------------------------------------
  */

  const loadProfileAndRole = useCallback(async (currentUser) => {
    const requestId = ++requestIdRef.current;

    /*
    |--------------------------------------------------------------------------
    | No user
    |--------------------------------------------------------------------------
    */

    if (!currentUser) {
      if (!mountedRef.current) {
        return;
      }

      setProfile(null);
      setRole(null);

      return;
    }

    try {
      /*
      |--------------------------------------------------------------------------
      | STEP 1 — PROFILE
      |--------------------------------------------------------------------------
      */

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current
      ) {

        return;
      }

      if (profileError) {
        console.error(
          "AUTH PROFILE ERROR:",
          profileError
        );

        setProfile(null);
        setRole(null);

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | STEP 2 — USER ROLE
      |--------------------------------------------------------------------------
      */

      const {
        data: userRoleData,
        error: userRoleError,
      } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", currentUser.id);

      const userRoleRows = userRoleData || [];

      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current
      ) {

        return;
      }

      if (userRoleError) {
        console.error(
          "AUTH USER ROLE ERROR:",
          userRoleError
        );

        setProfile(profileData || null);
        setRole(null);

        return;
      }

      if (!userRoleRows.length) {
        console.warn(
          "AUTH WARNING: User has no assigned role."
        );

        setProfile(profileData || null);
        setRole(null);

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | STEP 3 — ROLES
      |--------------------------------------------------------------------------
      | A user can have more than one role. Fetch all assigned role records
      | instead of using maybeSingle(), which fails when multiple rows exist.
      | Manager is preferred when present so a user explicitly assigned the
      | Manager role can access the Manager Portal without a 406/multiple-row
      | error.
      */

      const roleIds = userRoleRows.map((row) => row.role_id).filter(Boolean);

      const {
        data: roleRows,
        error: roleError,
      } = await supabase
        .from("roles")
        .select("id, name")
        .in("id", roleIds);

      const roleData =
        (roleRows || []).find(
          (item) => normalizeRole(item.name) === "Admin"
        ) ||
        (roleRows || []).find(
          (item) => normalizeRole(item.name) === "Manager"
        ) ||
        (roleRows || []).find(
          (item) => normalizeRole(item.name) === "Teacher"
        ) ||
        (roleRows || []).find(
          (item) => normalizeRole(item.name) === "Student"
        ) ||
        null;

      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current
      ) {

        return;
      }

      if (roleError) {
        console.error(
          "AUTH ROLE ERROR:",
          roleError
        );

        setProfile(profileData || null);
        setRole(null);

        return;
      }

      if (!roleData) {
        console.warn(
          "AUTH WARNING: Role record not found."
        );

        setProfile(profileData || null);
        setRole(null);

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | NORMALIZE ROLE
      |--------------------------------------------------------------------------
      */

      const rawRoleName = roleData.name;

      const normalizedRole =
        normalizeRole(rawRoleName);

      /*
      |--------------------------------------------------------------------------
      | DASHBOARD
      |--------------------------------------------------------------------------
      */

      const dashboardPath =
        getDashboardPath(normalizedRole);

      /*
      |--------------------------------------------------------------------------
      | SAVE STATE
      |--------------------------------------------------------------------------
      */

      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      setProfile(profileData || null);
      setRole(normalizedRole);
    } catch (error) {
      console.error(
        "AUTH PROFILE/ROLE ERROR:",
        error
      );

      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      setProfile(null);
      setRole(null);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | INITIALIZE AUTH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    mountedRef.current = true;

    let subscription = null;

    const initializeAuth = async () => {

      try {
        const {
          data: {
            session: currentSession,
          },
          error,
        } = await supabase.auth.getSession();

        if (!mountedRef.current) {
          return;
        }

        if (error) {
          console.error(
            "AUTH SESSION ERROR:",
            error
          );

          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
          setLoading(false);

          return;
        }

        const currentUser =
          currentSession?.user || null;

        setSession(currentSession);
        setUser(currentUser);

        if (currentUser) {
          setLoading(true);

          await loadProfileAndRole(
            currentUser
          );
        } else {
          setProfile(null);
          setRole(null);
        }

        if (mountedRef.current) {
          setLoading(false);
        }

        /*
        |--------------------------------------------------------------------------
        | AUTH STATE LISTENER
        |--------------------------------------------------------------------------
        */

        const {
          data: {
            subscription: authSubscription,
          },
        } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            if (!mountedRef.current) {
              return;
            }

            /*
            |--------------------------------------------------------------------------
            | SIGNED OUT
            |--------------------------------------------------------------------------
            */

            if (
              event === "SIGNED_OUT" ||
              !newSession?.user
            ) {
              requestIdRef.current += 1;

              setSession(null);
              setUser(null);
              setProfile(null);
              setRole(null);
              setLoading(false);

              return;
            }

            /*
            |--------------------------------------------------------------------------
            | SIGNED IN / INITIAL SESSION / TOKEN REFRESH
            |--------------------------------------------------------------------------
            */

            setSession(newSession);
            setUser(newSession.user);
            setLoading(true);

            /*
            |--------------------------------------------------------------------------
            | Let Supabase finish its auth callback first.
            |--------------------------------------------------------------------------
            */

            setTimeout(async () => {
              if (!mountedRef.current) {
                return;
              }

              await loadProfileAndRole(
                newSession.user
              );

              if (mountedRef.current) {
                setLoading(false);
              }
            }, 0);
          }
        );

        subscription = authSubscription;
      } catch (error) {
        console.error(
          "AUTH INITIALIZATION ERROR:",
          error
        );

        if (!mountedRef.current) {
          return;
        }

        setSession(null);
        setUser(null);
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    };

    initializeAuth();

    /*
    |--------------------------------------------------------------------------
    | CLEANUP
    |--------------------------------------------------------------------------
    */

    return () => {
      mountedRef.current = false;

      requestIdRef.current += 1;

      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [loadProfileAndRole]);

  /*
  |--------------------------------------------------------------------------
  | SIGN IN
  |--------------------------------------------------------------------------
  */

  const signIn = useCallback(
    async (email, password) => {
      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | SIGN UP
  |--------------------------------------------------------------------------
  */

  const signUp = useCallback(
    async (
      email,
      password,
      fullName
    ) => {
      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | SIGN OUT
  |--------------------------------------------------------------------------
  */

  const signOut = useCallback(
    async () => {
      requestIdRef.current += 1;

      const {
        error,
      } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      if (!mountedRef.current) {
        return;
      }

      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      setLoading(false);
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | REFRESH USER
  |--------------------------------------------------------------------------
  */

  const refreshUser = useCallback(
    async () => {
      if (!mountedRef.current) {
        return;
      }

      setLoading(true);

      try {
        const {
          data: {
            session: currentSession,
          },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mountedRef.current) {
          return;
        }

        const currentUser =
          currentSession?.user || null;

        setSession(currentSession);
        setUser(currentUser);

        if (currentUser) {
          await loadProfileAndRole(
            currentUser
          );
        } else {
          setProfile(null);
          setRole(null);
        }
      } catch (error) {
        console.error(
          "AUTH REFRESH ERROR:",
          error
        );

        if (!mountedRef.current) {
          return;
        }

        setSession(null);
        setUser(null);
        setProfile(null);
        setRole(null);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [loadProfileAndRole]
  );

  /*
  |--------------------------------------------------------------------------
  | CURRENT USER
  |--------------------------------------------------------------------------
  */

  const getCurrentUser =
    useCallback(() => {
      return user;
    }, [user]);

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD PATH
  |--------------------------------------------------------------------------
  */

  const dashboardPath = useMemo(() => {
    return getDashboardPath(role);
  }, [role]);

  /*
  |--------------------------------------------------------------------------
  | CONTEXT VALUE
  |--------------------------------------------------------------------------
  */

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      role,
      loading,

      isAuthenticated:
        Boolean(user && session),

      dashboardPath,

      signIn,
      signUp,
      signOut,

      refreshUser,
      getCurrentUser,
    }),
    [
      user,
      session,
      profile,
      role,
      loading,
      dashboardPath,
      signIn,
      signUp,
      signOut,
      refreshUser,
      getCurrentUser,
    ]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| USE AUTH
|--------------------------------------------------------------------------
*/

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
}

export default AuthContext;