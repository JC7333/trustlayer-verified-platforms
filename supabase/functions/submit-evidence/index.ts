import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// Note: This function now triggers deposit confirmation emails after successful upload
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60000;

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

interface SubmitEvidenceRequest {
  token: string;
  document_type: string;
  document_name: string;
  file_base64: string;
  mime_type: string;
  issued_at?: string;
  expires_at?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Too many requests" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: SubmitEvidenceRequest = await req.json();
    const { token, document_type, document_name, file_base64, mime_type, issued_at, expires_at } = body;

    // Validate token
    if (!token || token.length !== 64) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash token
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Validate magic link
    const { data: magicLink, error: lookupError } = await supabase
      .from("magic_links")
      .select(`
        *,
        end_user_profiles!inner(id, platform_id, status)
      `)
      .eq("token_hash", tokenHash)
      .is("revoked_at", null)
      .single();

    if (lookupError || !magicLink) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired link" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (new Date(magicLink.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Link expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const endUser = magicLink.end_user_profiles;
    const platformId = endUser.platform_id;
    const profileId = endUser.id;

    // Validate file size (max 10MB)
    const fileBuffer = Uint8Array.from(atob(file_base64), c => c.charCodeAt(0));
    if (fileBuffer.length > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File too large (max 10MB)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate mime type
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedMimes.includes(mime_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Allowed: JPEG, PNG, WebP, PDF" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate file path
    const fileExt = mime_type.split("/")[1] === "pdf" ? "pdf" : mime_type.split("/")[1];
    const fileName = `${platformId}/${profileId}/${document_type}_${Date.now()}.${fileExt}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("evidences")
      .upload(fileName, fileBuffer, {
        contentType: mime_type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create evidence record
    const { data: evidence, error: insertError } = await supabase
      .from("evidences")
      .insert({
        platform_id: platformId,
        profile_id: profileId,
        document_type,
        document_name,
        file_path: fileName,
        mime_type,
        file_size: fileBuffer.length,
        status: "pending",
        review_status: "pending",
        issued_at: issued_at || null,
        expires_at: expires_at || null,
        metadata: { uploaded_via: "magic_link", magic_link_id: magicLink.id },
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save evidence" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update end_user status to in_review
    await supabase
      .from("end_user_profiles")
      .update({ status: "in_review", updated_at: new Date().toISOString() })
      .eq("id", profileId);

    // Log the action
    await supabase.from("audit_logs").insert({
      platform_id: platformId,
      action: "evidence_uploaded",
      entity_type: "evidence",
      entity_id: evidence.id,
      new_data: { document_type, document_name, file_size: fileBuffer.length },
    });

    // Get platform name for email
    const { data: platform } = await supabase
      .from("platforms")
      .select("name")
      .eq("id", platformId)
      .single();

    // Get end user details for email
    const { data: endUserDetails } = await supabase
      .from("end_user_profiles")
      .select("business_name, contact_email")
      .eq("id", profileId)
      .single();

    // Send deposit confirmation email if email available
    if (endUserDetails?.contact_email && platform?.name) {
      // Create notification in queue
      await supabase.from("notifications_queue").insert({
        platform_id: platformId,
        end_user_id: profileId,
        evidence_id: evidence.id,
        notification_type: "deposit_confirmation",
        recipient_email: endUserDetails.contact_email,
        subject: `Confirmation de dépôt - ${platform.name}`,
        body: JSON.stringify({
          document_name,
          platform_name: platform.name,
          provider_name: endUserDetails.business_name,
        }),
        status: "pending",
      });

      // Trigger send-notification
      try {
        await supabase.functions.invoke("send-notification", {
          body: {
            type: "deposit_confirmation",
            to_email: endUserDetails.contact_email,
            platform_name: platform.name,
            provider_name: endUserDetails.business_name,
            document_name,
          },
        });
        
        // Update notification status
        await supabase
          .from("notifications_queue")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("evidence_id", evidence.id)
          .eq("notification_type", "deposit_confirmation");
      } catch (emailErr) {
        console.error("Failed to send deposit confirmation:", emailErr);
      }
    }

    console.log(`Evidence ${evidence.id} uploaded for profile ${profileId}`);

    return new Response(
      JSON.stringify({
        success: true,
        evidence_id: evidence.id,
        message: "Document uploaded successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in submit-evidence:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
