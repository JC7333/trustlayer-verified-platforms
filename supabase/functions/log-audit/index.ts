import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// 🔒 Allowlists (à étendre si besoin)
const ALLOWED_ACTIONS = new Set([
  "evidence_approved",
  "evidence_rejected",
  "evidence_uploaded",
  "magic_link_validated",
]);

const ALLOWED_ENTITY_TYPES = new Set([
  "evidence",
  "magic_link",
  "end_user_profile",
  "verification_request",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase env vars" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ✅ Client user (JWT)
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } =
      await supabaseUser.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = userData.user;

    const body = await req.json();
    const { platform_id, action, entity_type, entity_id, old_data, new_data } =
      body ?? {};

    if (!platform_id || !action || !entity_type) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ✅ Basic hardening (allowlist)
    if (!ALLOWED_ACTIONS.has(action)) {
      return new Response(JSON.stringify({ error: "Action not allowed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ALLOWED_ENTITY_TYPES.has(entity_type)) {
      return new Response(
        JSON.stringify({ error: "Entity type not allowed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ✅ Admin client (service role) : insert server-side only
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ✅ Role check (FIX : user_roles, not platform_memberships)
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("platform_id", platform_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) {
      return new Response(
        JSON.stringify({ error: "Failed to check permissions" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const allowed = ["platform_owner", "platform_admin", "reviewer"];
    if (!membership || !allowed.includes(membership.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip_address =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const user_agent = req.headers.get("user-agent") ?? null;

    const { error: insErr } = await supabaseAdmin.from("audit_logs").insert({
      platform_id,
      user_id: user.id,
      action,
      entity_type,
      entity_id: entity_id ?? null,
      old_data: old_data ?? null,
      new_data: new_data ?? null,
      ip_address,
      user_agent,
    });

    if (insErr) {
      return new Response(
        JSON.stringify({ error: String(insErr.message ?? insErr) }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("log-audit error:", e);

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
