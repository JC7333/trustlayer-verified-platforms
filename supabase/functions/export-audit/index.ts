import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
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
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { platform_id } = await req.json();

    if (!platform_id) {
      return new Response(
        JSON.stringify({ error: "Missing platform_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user has access to this platform
    const { data: hasAccess } = await supabase.rpc("has_platform_access", {
      _user_id: user.id,
      _platform_id: platform_id,
    });

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all data for export
    const { data: endUsers, error: usersError } = await supabase
      .from("end_user_profiles")
      .select("*")
      .eq("platform_id", platform_id)
      .order("business_name");

    if (usersError) throw usersError;

    const { data: evidences, error: evidencesError } = await supabase
      .from("evidences")
      .select("*")
      .eq("platform_id", platform_id)
      .order("created_at", { ascending: false });

    if (evidencesError) throw evidencesError;

    const { data: auditLogs, error: logsError } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("platform_id", platform_id)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (logsError) throw logsError;

    // Build CSV content
    const csvLines: string[] = [];
    
    // Header
    csvLines.push("=== EXPORT AUDIT TRUSTLAYER ===");
    csvLines.push(`Date d'export: ${new Date().toLocaleString("fr-FR")}`);
    csvLines.push(`Plateforme ID: ${platform_id}`);
    csvLines.push("");
    
    // Prestataires section
    csvLines.push("=== PRESTATAIRES ===");
    csvLines.push("Nom;Email;Téléphone;Statut;Date création;Dernière mise à jour");
    
    for (const user of endUsers || []) {
      csvLines.push([
        user.business_name || "",
        user.contact_email || "",
        user.contact_phone || "",
        user.status || "",
        new Date(user.created_at).toLocaleString("fr-FR"),
        new Date(user.updated_at).toLocaleString("fr-FR"),
      ].join(";"));
    }
    
    csvLines.push("");
    
    // Documents section
    csvLines.push("=== DOCUMENTS ===");
    csvLines.push("Prestataire;Type document;Nom document;Statut revue;Date soumission;Date émission;Date expiration;Motif rejet");
    
    // Create a map of end user IDs to names
    const userMap = new Map((endUsers || []).map(u => [u.id, u.business_name]));
    
    for (const evidence of evidences || []) {
      csvLines.push([
        userMap.get(evidence.profile_id) || evidence.profile_id,
        evidence.document_type || "",
        evidence.document_name || "",
        evidence.review_status || "",
        new Date(evidence.created_at).toLocaleString("fr-FR"),
        evidence.issued_at ? new Date(evidence.issued_at).toLocaleDateString("fr-FR") : "",
        evidence.expires_at ? new Date(evidence.expires_at).toLocaleDateString("fr-FR") : "",
        (evidence.rejection_reason || "").replace(/;/g, ","),
      ].join(";"));
    }
    
    csvLines.push("");
    
    // Audit logs section
    csvLines.push("=== HISTORIQUE DECISIONS ===");
    csvLines.push("Date;Action;Type entité;ID entité;Données");
    
    for (const log of auditLogs || []) {
      csvLines.push([
        new Date(log.created_at).toLocaleString("fr-FR"),
        log.action || "",
        log.entity_type || "",
        log.entity_id || "",
        JSON.stringify(log.new_data || {}).replace(/;/g, ",").substring(0, 200),
      ].join(";"));
    }

    const csvContent = csvLines.join("\n");
    
    // Log export action
    await supabase.from("audit_logs").insert({
      platform_id,
      user_id: user.id,
      action: "audit_export",
      entity_type: "platform",
      entity_id: platform_id,
      new_data: {
        end_users_count: endUsers?.length || 0,
        evidences_count: evidences?.length || 0,
        audit_logs_count: auditLogs?.length || 0,
      },
    });

    console.log(`Audit export generated for platform ${platform_id} by user ${user.id}`);

    return new Response(csvContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="audit-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error in export-audit:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
