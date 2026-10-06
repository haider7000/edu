import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";
    const callerClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: authData, error: authError } = await callerClient.auth.getUser();
    if (authError || !authData.user) throw new Error("Unauthorized");

    const adminClient = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: roleRows, error: roleErr } = await adminClient
      .from("user_roles").select("roles(name)").eq("user_id", authData.user.id);
    if (roleErr) throw roleErr;
    const callerRole = String((roleRows?.[0] as any)?.roles?.name || "").toLowerCase();
    if (!["admin", "manager"].includes(callerRole)) throw new Error("Only Admin or Manager can create users.");

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const fullName = String(body.full_name || "").trim();
    const requestedRole = String(body.role || "Student").trim();
    if (!email || !password || password.length < 8 || !fullName) throw new Error("Name, valid email and password of at least 8 characters are required.");
    if (!["Student", "Teacher", "Manager", "Admin"].includes(requestedRole)) throw new Error("Invalid role.");
    if (callerRole === "manager" && ["Admin", "Manager"].includes(requestedRole)) throw new Error("Managers can create Student or Teacher accounts only.");

    const { data: role, error: findRoleError } = await adminClient.from("roles").select("id,name").eq("name", requestedRole).single();
    if (findRoleError) throw findRoleError;

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: fullName },
    });
    if (createError) throw createError;
    const userId = created.user.id;
    const { error: profileError } = await adminClient.from("profiles").upsert({ id: userId, email, full_name: fullName }, { onConflict: "id" });
    if (profileError) throw profileError;
    await adminClient.from("user_roles").delete().eq("user_id", userId);
    const { error: assignError } = await adminClient.from("user_roles").insert({ user_id: userId, role_id: role.id });
    if (assignError) throw assignError;

    return new Response(JSON.stringify({ user: { id: userId, email, full_name: fullName, role: requestedRole } }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unable to create user." }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
