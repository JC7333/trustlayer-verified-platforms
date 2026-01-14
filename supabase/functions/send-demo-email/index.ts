import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DemoEmailRequest {
  name: string;
  email: string;
  company: string;
  vertical: string;
  volume: string;
}

// Simple email validation regex
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Extract pure email from "Name <email>" format or plain email
function extractEmail(input: string): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  
  // Check for "Name <email>" format
  const bracketMatch = trimmed.match(/<([^>]+)>/);
  if (bracketMatch) {
    return bracketMatch[1].trim();
  }
  
  // Plain email
  return trimmed;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const DEMO_NOTIFY_TO_EMAIL = Deno.env.get("DEMO_NOTIFY_TO_EMAIL");
    const APP_PUBLIC_URL = Deno.env.get("APP_PUBLIC_URL") || "https://preuvio.com";

    console.log("[send-demo-email] Checking environment variables...");
    console.log("[send-demo-email] RESEND_API_KEY configured:", !!RESEND_API_KEY);
    console.log("[send-demo-email] DEMO_NOTIFY_TO_EMAIL configured:", !!DEMO_NOTIFY_TO_EMAIL);
    console.log("[send-demo-email] DEMO_NOTIFY_TO_EMAIL type:", typeof DEMO_NOTIFY_TO_EMAIL);
    console.log("[send-demo-email] DEMO_NOTIFY_TO_EMAIL length:", DEMO_NOTIFY_TO_EMAIL?.length || 0);

    if (!RESEND_API_KEY) {
      console.error("[send-demo-email] RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!DEMO_NOTIFY_TO_EMAIL) {
      console.error("[send-demo-email] DEMO_NOTIFY_TO_EMAIL is not configured");
      return new Response(
        JSON.stringify({ error: "Demo notification email not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the recipient email format
    const recipientEmail = extractEmail(DEMO_NOTIFY_TO_EMAIL);
    console.log("[send-demo-email] Extracted recipient email valid:", isValidEmail(recipientEmail || ""));
    
    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      console.error("[send-demo-email] Invalid DEMO_NOTIFY_TO_EMAIL format. Must be 'email@example.com' or 'Name <email@example.com>'");
      return new Response(
        JSON.stringify({ 
          error: "Invalid recipient email configuration",
          hint: "DEMO_NOTIFY_TO_EMAIL must be 'email@example.com' or 'Name <email@example.com>'"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: DemoEmailRequest = await req.json();
    const { name, email, company, vertical, volume } = body;

    console.log(`[send-demo-email] Received demo request from ${name} (${email}) at ${company}`);

    // Validate required fields
    if (!name || !email || !company) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map vertical to display name
    const verticalNames: Record<string, string> = {
      "sante": "Santé",
      "services-domicile": "Services à domicile",
      "marketplace": "Marketplace B2B",
      "services-financiers": "Services financiers",
      "education": "Éducation",
      "logistique": "Transport & Logistique",
      "autre": "Autre",
    };

    const volumeNames: Record<string, string> = {
      "moins-100": "Moins de 100",
      "100-500": "100 - 500",
      "500-1000": "500 - 1 000",
      "1000-5000": "1 000 - 5 000",
      "plus-5000": "Plus de 5 000",
    };

    // Determine "from" email - use verified domain if available, fallback to onboarding@resend.dev
    const fromEmail = "Preuvio <onboarding@resend.dev>";
    // After domain verification: "Preuvio <noreply@mail.preuvio.com>"

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0F4C81 0%, #1E88E5 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
    .content { background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 12px 12px; }
    .info-row { display: flex; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
    .info-label { color: #6b7280; font-weight: 500; min-width: 140px; }
    .info-value { color: #1a1a1a; font-weight: 600; }
    .cta-button { display: inline-block; background: #0F4C81; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600; }
    .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">📋 Nouvelle demande de démo</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">Un prospect veut découvrir Preuvio</p>
    </div>
    <div class="content">
      <div class="info-row">
        <span class="info-label">👤 Nom</span>
        <span class="info-value">${name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">📧 Email</span>
        <span class="info-value"><a href="mailto:${email}">${email}</a></span>
      </div>
      <div class="info-row">
        <span class="info-label">🏢 Entreprise</span>
        <span class="info-value">${company}</span>
      </div>
      <div class="info-row">
        <span class="info-label">📊 Secteur</span>
        <span class="info-value">${verticalNames[vertical] || vertical}</span>
      </div>
      <div class="info-row">
        <span class="info-label">📈 Volume mensuel</span>
        <span class="info-value">${volumeNames[volume] || volume}</span>
      </div>
      
      <p style="margin-top: 24px; color: #6b7280;">
        Vous pouvez répondre directement à cet email pour contacter le prospect.
      </p>
      
      <a href="mailto:${email}?subject=Votre%20démo%20Preuvio" class="cta-button">
        Répondre à ${name}
      </a>
    </div>
    <div class="footer">
      <p>Email envoyé automatiquement par Preuvio</p>
      <p>${APP_PUBLIC_URL}</p>
    </div>
  </div>
</body>
</html>`;

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [DEMO_NOTIFY_TO_EMAIL],
        reply_to: email,
        subject: `🎯 Nouvelle demande de démo - ${company}`,
        html: htmlContent,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[send-demo-email] Resend API error:", resendData);
      return new Response(
        JSON.stringify({ error: resendData.message || "Failed to send email" }),
        { status: resendResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-demo-email] Email sent successfully. Message ID: ${resendData.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: resendData.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[send-demo-email] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
