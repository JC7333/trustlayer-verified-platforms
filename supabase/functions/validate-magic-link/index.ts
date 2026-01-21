import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60000; // 1 minute in ms

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return true;
  }
  
  entry.count++;
  return false;
}

interface ValidateMagicLinkRequest {
  token: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ValidateMagicLinkRequest = await req.json();
    const { token } = body;

    if (!token || token.length !== 64) {
      return new Response(
        JSON.stringify({ error: "Invalid token format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash the provided token
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Look up the magic link
    const { data: magicLink, error: lookupError } = await supabase
      .from("magic_links")
      .select(`
        *,
        end_user_profiles!inner(
          id,
          business_name,
          contact_email,
          contact_phone,
          status,
          platform_id,
          platforms!inner(
            id,
            name,
            logo_url,
            primary_color
          )
        )
      `)
      .eq("token_hash", tokenHash)
      .single();

    if (lookupError || !magicLink) {
      console.log("Magic link not found for hash");
      return new Response(
        JSON.stringify({ error: "Invalid or expired link" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if revoked
    if (magicLink.revoked_at) {
      return new Response(
        JSON.stringify({ error: "This link has been revoked" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (new Date(magicLink.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "This link has expired. Please contact your platform administrator for a new link." }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark as used (first use)
    if (!magicLink.used_at) {
      await supabase
        .from("magic_links")
        .update({ used_at: new Date().toISOString() })
        .eq("id", magicLink.id);
    }

    // Get required documents for this platform's rule pack
    const endUser = magicLink.end_user_profiles;
    const platform = endUser.platforms;


    // 1) Try: latest rule pack for this platform
    const { data: platformPack } = await supabase
      .from("rules_packages")
      .select("id")
      .eq("platform_id", platform.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2) Fallback: latest template pack
    const { data: templatePack } = platformPack?.id
      ? { data: null }
      : await supabase
          .from("rules_packages")
          .select("id")
          .eq("is_template", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

    const rulesPackageId = platformPack?.id || templatePack?.id;

    if (!rulesPackageId) {
      return new Response(
        JSON.stringify({ error: "No rule pack configured for this platform" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get rule pack items
    const { data: ruleItems } = await supabase
      .from("rules_items")
      .select("*")
      .eq("package_id", rulesPackageId)
      .order("is_required", { ascending: false });

    // Get existing evidences for this end user
    const { data: existingEvidences } = await supabase
      .from("evidences")
      .select("*")
      .eq("profile_id", endUser.id)
      .eq("platform_id", platform.id);

    console.log(`Magic link validated for end_user ${endUser.id}`);

    return new Response(
      JSON.stringify({
        valid: true,
        end_user: {
          id: endUser.id,
          business_name: endUser.business_name,
          status: endUser.status,
        },
        platform: {
          id: platform.id,
          name: platform.name,
          logo_url: platform.logo_url,
          primary_color: platform.primary_color,
        },
        required_documents: ruleItems || [],
        existing_evidences: existingEvidences || [],
        magic_link_id: magicLink.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in validate-magic-link:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
