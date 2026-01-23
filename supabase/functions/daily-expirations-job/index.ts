import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Thresholds for expiration reminders (in days)
const EXPIRATION_THRESHOLDS = [30, 7, 1, 0];

// Secret token for cron job authentication (should be set in environment)
const CRON_SECRET = Deno.env.get("CRON_JOB_SECRET");

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("[daily-expirations-job] Starting...");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // === AUTHENTICATION CHECK ===
    // This function should only be called by:
    // 1. Cron jobs with a secret bearer token
    // 2. Service role calls (internal)
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      console.error("[daily-expirations-job] Missing Authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Allow service role key OR cron secret
    const isServiceRole = token === supabaseServiceKey;
    const isCronSecret = CRON_SECRET && token === CRON_SECRET;

    if (!isServiceRole && !isCronSecret) {
      console.error("[daily-expirations-job] Invalid authentication token");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid credentials" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      `[daily-expirations-job] Authenticated via ${isServiceRole ? "service_role" : "cron_secret"}`,
    );

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      checked: 0,
      notifications_created: 0,
      blocked: 0,
      errors: 0,
    };

    // Get all evidences with expiration dates
    const { data: evidences, error: evidenceError } = await supabase
      .from("evidences")
      .select(
        `
        id,
        document_type,
        document_name,
        expires_at,
        platform_id,
        profile_id,
        review_status,
        end_user_profiles!inner(
          id,
          business_name,
          contact_email,
          status,
          platform_id,
          platforms!inner(id, name)
        ),
        rules_items(is_required)
      `,
      )
      .not("expires_at", "is", null)
      .eq("review_status", "approved");

    if (evidenceError) {
      console.error(
        "[daily-expirations-job] Error fetching evidences:",
        evidenceError,
      );
      throw evidenceError;
    }

    console.log(
      `[daily-expirations-job] Found ${evidences?.length || 0} evidences with expiration dates`,
    );

    for (const evidence of evidences || []) {
      stats.checked++;

      const expiresAt = new Date(evidence.expires_at);
      expiresAt.setHours(0, 0, 0, 0);

      const daysUntilExpiry = Math.ceil(
        (expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Check if we need to send a notification
      if (!EXPIRATION_THRESHOLDS.includes(daysUntilExpiry)) {
        continue;
      }

      // Handle joined relations (they come as arrays or single objects)
      const endUserData = evidence.end_user_profiles;
      const endUser = Array.isArray(endUserData) ? endUserData[0] : endUserData;
      if (!endUser) continue;

      const platformData = endUser.platforms;
      const platform = Array.isArray(platformData)
        ? platformData[0]
        : platformData;
      if (!platform) continue;

      const rulesItemData = evidence.rules_items;
      const rulesItem = Array.isArray(rulesItemData)
        ? rulesItemData[0]
        : rulesItemData;
      const isRequired = rulesItem?.is_required ?? true;

      // Determine notification type
      let notificationType: string;
      if (daysUntilExpiry === 0) {
        notificationType = "expired";
      } else if (daysUntilExpiry === 1) {
        notificationType = "expiration_1d";
      } else if (daysUntilExpiry === 7) {
        notificationType = "expiration_7d";
      } else {
        notificationType = "expiration_30d";
      }

      // Check if notification already sent today
      const todayStart = new Date(today);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      const { data: existingNotif } = await supabase
        .from("notifications_queue")
        .select("id")
        .eq("evidence_id", evidence.id)
        .eq("notification_type", notificationType)
        .gte("created_at", todayStart.toISOString())
        .lte("created_at", todayEnd.toISOString())
        .single();

      if (existingNotif) {
        console.log(
          `[daily-expirations-job] Notification already sent for evidence ${evidence.id} today`,
        );
        continue;
      }

      // Create notification in queue
      const { error: notifError } = await supabase
        .from("notifications_queue")
        .insert({
          platform_id: evidence.platform_id,
          end_user_id: endUser.id,
          evidence_id: evidence.id,
          notification_type: notificationType,
          recipient_email: endUser.contact_email,
          subject: `${evidence.document_name} - ${notificationType === "expired" ? "Expiré" : `Expire dans ${daysUntilExpiry} jour(s)`}`,
          body: JSON.stringify({
            document_name: evidence.document_name,
            days_until_expiry: daysUntilExpiry,
            platform_name: platform.name,
            provider_name: endUser.business_name,
          }),
          status: "pending",
          metadata: {
            document_type: evidence.document_type,
            expires_at: evidence.expires_at,
            is_required: isRequired,
          },
        });

      if (notifError) {
        console.error(
          `[daily-expirations-job] Error creating notification for evidence ${evidence.id}:`,
          notifError,
        );
        stats.errors++;
        continue;
      }

      stats.notifications_created++;
      console.log(
        `[daily-expirations-job] Created ${notificationType} notification for ${endUser.business_name} - ${evidence.document_name}`,
      );

      // If expired and required, block the end user
      if (daysUntilExpiry === 0 && isRequired && endUser.status !== "blocked") {
        const { error: blockError } = await supabase
          .from("end_user_profiles")
          .update({
            status: "blocked",
            updated_at: new Date().toISOString(),
          })
          .eq("id", endUser.id);

        if (blockError) {
          console.error(
            `[daily-expirations-job] Error blocking end user ${endUser.id}:`,
            blockError,
          );
          stats.errors++;
        } else {
          stats.blocked++;
          console.log(
            `[daily-expirations-job] Blocked end user ${endUser.business_name} due to expired required document`,
          );

          // Log the blocking action
          await supabase.from("audit_logs").insert({
            platform_id: evidence.platform_id,
            action: "end_user_blocked",
            entity_type: "end_user_profile",
            entity_id: endUser.id,
            new_data: {
              reason: "expired_required_document",
              document_name: evidence.document_name,
              expires_at: evidence.expires_at,
            },
          });
        }
      }
    }

    // Process pending notifications and send emails
    const { data: pendingNotifs } = await supabase
      .from("notifications_queue")
      .select("*")
      .eq("status", "pending")
      .not("recipient_email", "is", null)
      .limit(50);

    let emailsSent = 0;
    for (const notif of pendingNotifs || []) {
      try {
        const bodyData = JSON.parse(notif.body || "{}");

        // Call send-notification function with service role auth
        const { error: emailError } = await supabase.functions.invoke(
          "send-notification",
          {
            body: {
              type: "expiration_reminder",
              to_email: notif.recipient_email,
              platform_name: bodyData.platform_name,
              provider_name: bodyData.provider_name,
              document_name: bodyData.document_name,
              days_until_expiry: bodyData.days_until_expiry,
              notification_id: notif.id,
            },
          },
        );

        if (emailError) {
          await supabase
            .from("notifications_queue")
            .update({
              status: "failed",
              error_message: emailError.message,
            })
            .eq("id", notif.id);
        } else {
          emailsSent++;
        }
      } catch (err) {
        console.error(
          `[daily-expirations-job] Error sending notification ${notif.id}:`,
          err,
        );
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[daily-expirations-job] Completed in ${duration}ms`);
    console.log(
      `[daily-expirations-job] Stats: ${JSON.stringify({ ...stats, emails_sent: emailsSent })}`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        duration_ms: duration,
        stats: { ...stats, emails_sent: emailsSent },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[daily-expirations-job] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
