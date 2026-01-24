import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const requestId = crypto.randomUUID();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error(`[log-audit] Missing env vars requestId=${requestId}`);
      return jsonResponse(
        { error: "Server misconfigured", request_id: requestId },
        500,
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const user = userData.user;

    const { action, entity_type, entity_id, platform_id, details } =
      await req.json();

    if (!action || !entity_type || !platform_id) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    // Minimal sanity allowlist
    const allowedActions = new Set([
      "create",
      "update",
      "delete",
      "review",
      "approve",
      "reject",
      "export",
      "login",
    ]);
    if (!allowedActions.has(String(action))) {
      return jsonResponse({ error: "Invalid action" }, 400);
    }

    // Check membership (admin/service role => reads)
    const { data: membership } = await supabaseAdmin
      .from("platform_memberships")
      .select("role")
      .eq("platform_id", platform_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    // Insert audit log
    const { error: insertError } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: user.id,
        platform_id,
        action,
        entity_type,
        entity_id: entity_id || null,
        details: details || {},
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error(
        `[log-audit] Insert failed requestId=${requestId}`,
        insertError,
      );
      return jsonResponse(
        { error: "Internal server error", request_id: requestId },
        500,
      );
    }

    return jsonResponse({ success: true });
  } catch (e) {
    console.error(`[log-audit] Unhandled error requestId=${requestId}`, e);
    // ✅ NE JAMAIS renvoyer String(e) => stack trace leak
    return jsonResponse(
      { error: "Internal server error", request_id: requestId },
      500,
    );
  }
});
