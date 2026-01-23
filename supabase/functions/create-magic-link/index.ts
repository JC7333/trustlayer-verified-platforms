import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateMagicLinkRequest {
  platform_id: string;
  end_user_id: string;
  expires_in_days?: number;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token from request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: CreateMagicLinkRequest = await req.json();
    const { platform_id, end_user_id, expires_in_days = 7 } = body;

    if (!platform_id || !end_user_id) {
      return new Response(
        JSON.stringify({ error: "Missing platform_id or end_user_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if user has admin/owner role for this platform
    const { data: hasRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _platform_id: platform_id,
      _role: "platform_admin",
    });

    const { data: hasOwnerRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _platform_id: platform_id,
      _role: "platform_owner",
    });

    if (!hasRole && !hasOwnerRole) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized - admin or owner role required",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate a secure random token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const rawToken = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Hash the token for storage (using SHA-256)
    const encoder = new TextEncoder();
    const data = encoder.encode(rawToken);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    // Revoke any existing active magic links for this end_user
    await supabase
      .from("magic_links")
      .update({ revoked_at: new Date().toISOString() })
      .eq("end_user_id", end_user_id)
      .is("revoked_at", null)
      .is("used_at", null);

    // Insert the new magic link
    const { data: magicLink, error: insertError } = await supabase
      .from("magic_links")
      .insert({
        platform_id,
        end_user_id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating magic link:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create magic link" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update end_user status to needs_docs if not already set
    await supabase
      .from("end_user_profiles")
      .update({ status: "needs_docs" })
      .eq("id", end_user_id)
      .eq("status", "active");

    // Log the action
    await supabase.from("audit_logs").insert({
      platform_id,
      user_id: user.id,
      action: "magic_link_created",
      entity_type: "magic_link",
      entity_id: magicLink.id,
      new_data: { end_user_id, expires_at: expiresAt.toISOString() },
    });

    // Build the magic link URL
    const appUrl =
      Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "") || "";
    const magicLinkUrl = `${req.headers.get("origin") || "https://trustlayer.app"}/u/${rawToken}`;

    console.log(
      `Magic link created for end_user ${end_user_id}, expires ${expiresAt.toISOString()}`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        magic_link_url: magicLinkUrl,
        expires_at: expiresAt.toISOString(),
        id: magicLink.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in create-magic-link:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
