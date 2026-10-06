import { supabase } from "../lib/supabase";

/* =========================================================
   ADMIN SERVICE
   ========================================================= */

/* ---------------------------------------------------------
   Error handling
--------------------------------------------------------- */

const friendly = (error) => {
  if (!error) return null;

  const msg =
    typeof error === "string"
      ? error
      : error.message || "Request failed.";

  if (
    /relation .* does not exist|schema cache|could not find the table/i.test(
      msg
    )
  ) {
    return "This feature is not configured in the current Supabase database.";
  }

  if (
    /permission denied|row-level security|violates row-level security|policy/i.test(
      msg
    )
  ) {
    return "Your Admin role does not currently have the required database permission.";
  }

  if (/column .* does not exist/i.test(msg)) {
    return `Database schema error: ${msg}`;
  }

  if (/duplicate key|unique constraint/i.test(msg)) {
    return "This record already exists.";
  }

  if (/foreign key constraint/i.test(msg)) {
    return "This record is linked to another record and cannot be changed.";
  }

  return msg;
};

export const adminError = friendly;


/* =========================================================
   PROFILE
   ========================================================= */

export async function getAdminProfile(userId) {
  if (!userId) {
    return {
      data: null,
      error: null,
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return {
    data,
    error: error ? friendly(error) : null,
  };
}


/* =========================================================
   GENERIC TABLE HELPERS
   ========================================================= */

export async function listTable(
  table,
  {
    select = "*",
    order = "created_at",
    ascending = false,
    limit = 200,
    filters = {},
  } = {}
) {
  let query = supabase.from(table).select(select);

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query = query.eq(key, value);
    }
  });

  if (order) {
    query = query.order(order, {
      ascending,
    });
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  return {
    data: data || [],
    error: error ? friendly(error) : null,
  };
}


export async function createRecord(table, values) {
  const { data, error } = await supabase
    .from(table)
    .insert(values)
    .select()
    .single();

  return {
    data,
    error: error ? friendly(error) : null,
  };
}


export async function updateRecord(table, id, values) {
  const { data, error } = await supabase
    .from(table)
    .update(values)
    .eq("id", id)
    .select()
    .single();

  return {
    data,
    error: error ? friendly(error) : null,
  };
}


export async function deleteRecord(table, id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);

  return {
    error: error ? friendly(error) : null,
  };
}


/* =========================================================
   USERS
   ========================================================= */

export async function getUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id,full_name,email,phone,avatar_url,created_at"
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return {
      data: [],
      error: friendly(error),
    };
  }

  const users = data || [];

  if (!users.length) {
    return {
      data: [],
      error: null,
    };
  }

  const ids = users.map((user) => user.id);

  const {
    data: roleRows,
    error: roleError,
  } = await supabase
    .from("user_roles")
    .select(
      `
        user_id,
        role_id,
        roles (
          id,
          name
        )
      `
    )
    .in("user_id", ids);

  if (roleError) {
    return {
      data: users.map((user) => ({
        ...user,
        role: "Unassigned",
        role_id: null,
      })),
      error: friendly(roleError),
    };
  }

  const rows = users.map((user) => {
    const assignment = (roleRows || []).find(
      (row) => row.user_id === user.id
    );

    return {
      ...user,
      role_id: assignment?.role_id || null,
      role:
        assignment?.roles?.name ||
        "Unassigned",
    };
  });

  return {
    data: rows,
    error: null,
  };
}


/* =========================================================
   USERS + ROLES
   ========================================================= */

/**
 * Get every profile together with its assigned role.
 */
export async function listUsersWithRoles() {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        full_name,
        email,
        user_roles (
          role_id,
          roles (
            id,
            name
          )
        )
      `
    )
    .order("full_name", {
      ascending: true,
    });

  if (error) {
    return {
      data: [],
      error: friendly(error),
    };
  }

  const users = (data || []).map((user) => {
    /*
      We intentionally use the first role here.

      Your current database may contain duplicate user_roles
      rows for some users. The long-term solution is to enforce
      one role per user at the database level.
    */
    const assignment = user.user_roles?.[0];

    const role = Array.isArray(assignment?.roles)
      ? assignment.roles[0]
      : assignment?.roles;

    return {
      id: user.id,

      full_name:
        user.full_name ||
        "Unnamed User",

      email:
        user.email ||
        "",

      role_id:
        assignment?.role_id ||
        null,

      role_name:
        role?.name ||
        "Unassigned",
    };
  });

  return {
    data: users,
    error: null,
  };
}


/* =========================================================
   GET ALL AVAILABLE ROLES
   ========================================================= */

export async function getRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("id,name")
    .order("id", {
      ascending: true,
    });

  return {
    data: data || [],
    error: error ? friendly(error) : null,
  };
}


/* =========================================================
   CHANGE USER ROLE
   ========================================================= */

/**
 * Change the role of a user.
 *
 * IMPORTANT:
 * This function updates ALL existing role rows for the user.
 * If no role exists, it creates one.
 *
 * This prevents the `.maybeSingle()` error that happens when
 * duplicate user_roles records already exist.
 */
export async function changeUserRole(userId, roleId) {
  if (!userId) {
    return {
      data: null,
      error: "User ID is required.",
    };
  }

  if (
    roleId === undefined ||
    roleId === null ||
    roleId === ""
  ) {
    return {
      data: null,
      error: "Role ID is required.",
    };
  }

  /* -------------------------------------------------------
     Verify that the role actually exists
  ------------------------------------------------------- */

  const {
    data: role,
    error: roleError,
  } = await supabase
    .from("roles")
    .select("id,name")
    .eq("id", roleId)
    .maybeSingle();

  if (roleError) {
    return {
      data: null,
      error: friendly(roleError),
    };
  }

  if (!role) {
    return {
      data: null,
      error: "The selected role does not exist.",
    };
  }


  /* -------------------------------------------------------
     Find existing assignments
  ------------------------------------------------------- */

  const {
    data: existingRows,
    error: findError,
  } = await supabase
    .from("user_roles")
    .select("user_id,role_id")
    .eq("user_id", userId);

  if (findError) {
    return {
      data: null,
      error: friendly(findError),
    };
  }


  /* -------------------------------------------------------
     Existing role assignment
  ------------------------------------------------------- */

  if (existingRows && existingRows.length > 0) {
    /*
      Update every existing row.

      This is intentionally not `.maybeSingle()` because
      existing databases may contain duplicate assignments.
    */

    const {
      data,
      error,
    } = await supabase
      .from("user_roles")
      .update({
        role_id: role.id,
      })
      .eq("user_id", userId)
      .select();

    return {
      data,
      error: error ? friendly(error) : null,
    };
  }


  /* -------------------------------------------------------
     No existing role -> create assignment
  ------------------------------------------------------- */

  const {
    data,
    error,
  } = await supabase
    .from("user_roles")
    .insert({
      user_id: userId,
      role_id: role.id,
    })
    .select()
    .single();

  return {
    data,
    error: error ? friendly(error) : null,
  };
}


/* =========================================================
   REMOVE USER ROLE
   ========================================================= */

export async function removeUserRole(userId) {
  if (!userId) {
    return {
      data: null,
      error: "User ID is required.",
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .select();

  return {
    data,
    error: error ? friendly(error) : null,
  };
}


/* =========================================================
   DASHBOARD
   ========================================================= */

export async function getDashboardData() {
  const tables = [
    "profiles",
    "courses",
    "enrollments",
    "payments",
    "admissions",
    "certificates",
    "internships",
  ];

  /*
    IMPORTANT:
    Not every table uses created_at.

    Existing database schema:
      enrollments -> enrolled_at
      certificates -> issued_at
  */

  const orderBy = {
    profiles: "created_at",
    courses: "created_at",
    enrollments: "enrolled_at",
    payments: "created_at",
    admissions: "created_at",
    certificates: "issued_at",
    internships: "created_at",
  };

  const results = await Promise.all(
    tables.map((table) =>
      listTable(table, {
        order: orderBy[table] || null,
        limit: 500,
      })
    )
  );

  const output = Object.fromEntries(
    tables.map((table, index) => [
      table,
      results[index],
    ])
  );

  output.users = await getUsers();

  return output;
}


/* =========================================================
   SYSTEM HEALTH
   ========================================================= */

export async function getSystemHealth() {
  const checks = await Promise.all([
    supabase
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase.auth.getSession(),

    supabase.storage.listBuckets(),
  ]);

  return {
    database: !checks[0].error,

    authentication: !checks[1].error,

    storage: !checks[2].error,

    application: null,

    storageConfigured: !checks[2].error,
  };
}


/* =========================================================
   ANALYTICS
   ========================================================= */

export async function getAnalytics() {
  return getDashboardData();
}