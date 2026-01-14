import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface SendNotificationRequest {
  type: "expiration_reminder" | "document_rejected" | "document_approved" | "new_link";
  to_email: string;
  platform_name: string;
  provider_name: string;
  document_name?: string;
  days_until_expiry?: number;
  magic_link_url?: string;
  rejection_reason?: string;
}

const getEmailContent = (params: SendNotificationRequest) => {
  const { type, platform_name, provider_name, document_name, days_until_expiry, magic_link_url, rejection_reason } = params;
  
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
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Bonjour ${provider_name},</h2>
            <p style="color: #4a4a4a; line-height: 1.6;">
              Votre document <strong>${document_name}</strong> ${expiryText}.
            </p>
            <p style="color: #4a4a4a; line-height: 1.6;">
              ${days_until_expiry === 0 
                ? "⚠️ Votre accès à la plateforme sera suspendu si ce document n'est pas renouvelé."
                : "Veuillez le renouveler dès que possible pour éviter toute interruption de service."
              }
            </p>
            ${magic_link_url ? `
              <div style="margin: 30px 0;">
                <a href="${magic_link_url}" style="background-color: #0F4C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Mettre à jour mes documents
                </a>
              </div>
            ` : ""}
            <p style="color: #888; font-size: 14px; margin-top: 30px;">
              — L'équipe ${platform_name}
            </p>
          </div>
        `,
      };

    case "document_rejected":
      return {
        subject: `Document rejeté - Action requise - ${platform_name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Bonjour ${provider_name},</h2>
            <p style="color: #4a4a4a; line-height: 1.6;">
              Votre document <strong>${document_name}</strong> a été rejeté.
            </p>
            ${rejection_reason ? `
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; margin: 20px 0;">
                <p style="color: #dc2626; margin: 0;"><strong>Motif :</strong> ${rejection_reason}</p>
              </div>
            ` : ""}
            <p style="color: #4a4a4a; line-height: 1.6;">
              Veuillez soumettre un nouveau document conforme.
            </p>
            ${magic_link_url ? `
              <div style="margin: 30px 0;">
                <a href="${magic_link_url}" style="background-color: #0F4C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Soumettre un nouveau document
                </a>
              </div>
            ` : ""}
            <p style="color: #888; font-size: 14px; margin-top: 30px;">
              — L'équipe ${platform_name}
            </p>
          </div>
        `,
      };

    case "document_approved":
      return {
        subject: `Document validé ✓ - ${platform_name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Bonjour ${provider_name},</h2>
            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; margin: 20px 0;">
              <p style="color: #166534; margin: 0;">✓ Votre document <strong>${document_name}</strong> a été validé.</p>
            </div>
            <p style="color: #4a4a4a; line-height: 1.6;">
              Merci pour votre diligence. Votre profil est à jour.
            </p>
            <p style="color: #888; font-size: 14px; margin-top: 30px;">
              — L'équipe ${platform_name}
            </p>
          </div>
        `,
      };

    case "new_link":
      return {
        subject: `Lien d'accès à vos documents - ${platform_name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Bonjour ${provider_name},</h2>
            <p style="color: #4a4a4a; line-height: 1.6;">
              Vous avez reçu un lien pour soumettre vos documents sur la plateforme <strong>${platform_name}</strong>.
            </p>
            <div style="margin: 30px 0;">
              <a href="${magic_link_url}" style="background-color: #0F4C81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accéder à mon espace documents
              </a>
            </div>
            <p style="color: #888; font-size: 14px;">
              Ce lien est valable 7 jours.
            </p>
            <p style="color: #888; font-size: 14px; margin-top: 30px;">
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
      return new Response(
        JSON.stringify({ error: "Missing to_email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = getEmailContent(body);

    const { data, error } = await resend.emails.send({
      from: `${body.platform_name} <onboarding@resend.dev>`,
      to: [body.to_email],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Email sent to ${body.to_email}: ${body.type}`);

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
