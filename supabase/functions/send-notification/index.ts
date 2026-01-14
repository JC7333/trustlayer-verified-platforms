import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Default from email - can be overridden by platform settings
const DEFAULT_FROM_EMAIL = "onboarding@resend.dev";

interface SendNotificationRequest {
  type: "expiration_reminder" | "document_rejected" | "document_approved" | "new_link" | "deposit_confirmation";
  to_email: string;
  platform_name: string;
  provider_name: string;
  document_name?: string;
  days_until_expiry?: number;
  magic_link_url?: string;
  rejection_reason?: string;
  documents_submitted?: string[];
  notification_id?: string;
  from_email?: string;
}

const getEmailContent = (params: SendNotificationRequest) => {
  const { type, platform_name, provider_name, document_name, days_until_expiry, magic_link_url, rejection_reason, documents_submitted } = params;
  
  switch (type) {
    case "expiration_reminder":
      const urgency = days_until_expiry === 0 ? "URGENT" : days_until_expiry === 1 ? "Important" : "Rappel";
      const expiryText = days_until_expiry === 0 
        ? "expire aujourd'hui" 
        : days_until_expiry === 1 
          ? "expire demain"
          : `expire dans ${days_until_expiry} jours`;
      
      return {
        subject: `[${urgency}] ${document_name} ${expiryText} - ${platform_name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0F4C81; margin: 0;">${platform_name}</h1>
            </div>
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Bonjour ${provider_name},</h2>
            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">
              Votre document <strong>${document_name}</strong> ${expiryText}.
            </p>
            <div style="background-color: ${days_until_expiry === 0 ? '#fef2f2' : '#fffbeb'}; border-left: 4px solid ${days_until_expiry === 0 ? '#dc2626' : '#f59e0b'}; padding: 16px; margin: 20px 0;">
              <p style="color: ${days_until_expiry === 0 ? '#dc2626' : '#92400e'}; margin: 0; font-weight: 500;">
                ${days_until_expiry === 0 
                  ? "⚠️ Votre accès à la plateforme sera suspendu si ce document n'est pas renouvelé."
                  : "📋 Veuillez le renouveler dès que possible pour éviter toute interruption de service."
                }
              </p>
            </div>
            ${magic_link_url ? `
              <div style="margin: 30px 0; text-align: center;">
                <a href="${magic_link_url}" style="background-color: #0F4C81; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
                  Mettre à jour mes documents
                </a>
              </div>
            ` : ""}
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              — L'équipe ${platform_name}
            </p>
          </div>
        `,
      };

    case "document_rejected":
      return {
        subject: `Document rejeté - Action requise - ${platform_name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0F4C81; margin: 0;">${platform_name}</h1>
            </div>
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Bonjour ${provider_name},</h2>
            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">
              Votre document <strong>${document_name}</strong> a été rejeté.
            </p>
            ${rejection_reason ? `
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
                <p style="color: #dc2626; margin: 0;"><strong>Motif :</strong> ${rejection_reason}</p>
              </div>
            ` : ""}
            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">
              Veuillez soumettre un nouveau document conforme dans les plus brefs délais.
            </p>
            ${magic_link_url ? `
              <div style="margin: 30px 0; text-align: center;">
                <a href="${magic_link_url}" style="background-color: #0F4C81; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
                  Soumettre un nouveau document
                </a>
              </div>
            ` : ""}
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              — L'équipe ${platform_name}
            </p>
          </div>
        `,
      };

    case "document_approved":
      return {
        subject: `✓ Document validé - ${platform_name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0F4C81; margin: 0;">${platform_name}</h1>
            </div>
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Bonjour ${provider_name},</h2>
            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0;">
              <p style="color: #166534; margin: 0; font-size: 16px;">
                ✓ Votre document <strong>${document_name}</strong> a été validé avec succès.
              </p>
            </div>
            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">
              Merci pour votre diligence. Votre profil est à jour.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              — L'équipe ${platform_name}
            </p>
          </div>
        `,
      };

    case "new_link":
      return {
        subject: `Accès à votre espace documents - ${platform_name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0F4C81; margin: 0;">${platform_name}</h1>
            </div>
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Bonjour ${provider_name},</h2>
            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">
              Vous avez reçu un lien pour soumettre vos documents sur la plateforme <strong>${platform_name}</strong>.
            </p>
            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">
              Cliquez sur le bouton ci-dessous pour accéder à votre espace personnel et télécharger vos documents.
            </p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${magic_link_url}" style="background-color: #0F4C81; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
                Accéder à mon espace documents
              </a>
            </div>
            <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 13px; margin: 0;">
                ⏱️ Ce lien est valable <strong>7 jours</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.
              </p>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              — L'équipe ${platform_name}
            </p>
          </div>
        `,
      };

    case "deposit_confirmation":
      const docList = documents_submitted?.join(", ") || document_name || "vos documents";
      return {
        subject: `Confirmation de dépôt - ${platform_name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0F4C81; margin: 0;">${platform_name}</h1>
            </div>
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Bonjour ${provider_name},</h2>
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
              <p style="color: #1e40af; margin: 0; font-size: 16px;">
                📄 Nous avons bien reçu : <strong>${docList}</strong>
              </p>
            </div>
            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">
              Vos documents sont en cours de vérification. Vous recevrez une notification dès qu'ils auront été traités.
            </p>
            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">
              Délai habituel de traitement : <strong>24-48h ouvrées</strong>.
            </p>
            ${magic_link_url ? `
              <div style="margin: 30px 0; text-align: center;">
                <a href="${magic_link_url}" style="background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
                  Voir mes documents
                </a>
              </div>
            ` : ""}
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              — L'équipe ${platform_name}
            </p>
          </div>
        `,
      };

    default:
      return { subject: "Notification", html: "<p>Notification</p>" };
  }
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: SendNotificationRequest = await req.json();
    
    if (!body.to_email) {
      console.error("Missing to_email in request");
      return new Response(
        JSON.stringify({ error: "Missing to_email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = getEmailContent(body);
    const fromEmail = body.from_email || DEFAULT_FROM_EMAIL;
    const fromName = body.platform_name || "TrustLayer";

    console.log(`Sending ${body.type} email to ${body.to_email} from ${fromName} <${fromEmail}>`);

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [body.to_email],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      
      // Update notification status if notification_id provided
      if (body.notification_id) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase
          .from("notifications_queue")
          .update({ 
            status: "failed", 
            error_message: error.message,
            last_attempt_at: new Date().toISOString()
          })
          .eq("id", body.notification_id);
      }
      
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Email sent successfully to ${body.to_email}: ${body.type} (id: ${data?.id})`);

    // Update notification status if notification_id provided
    if (body.notification_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase
        .from("notifications_queue")
        .update({ 
          status: "sent", 
          sent_at: new Date().toISOString(),
          resend_message_id: data?.id,
          last_attempt_at: new Date().toISOString()
        })
        .eq("id", body.notification_id);
    }

    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
