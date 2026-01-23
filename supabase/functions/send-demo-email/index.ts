import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

// === RATE LIMITING ===
// In-memory rate limiter (resets on cold start, but provides basic protection)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // Max 5 requests per minute per IP
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (entry.count >= RATE_LIMIT) {
    return true;
  }

  entry.count++;
  return false;
}

// Basic input sanitization
function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  // Remove potential script tags and limit length
  return input
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 500);
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // === RATE LIMITING ===
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (isRateLimited(clientIp)) {
      console.log(
        `[send-demo-email] Rate limit exceeded for IP: ${clientIp.slice(0, 8)}...`,
      );
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const DEMO_NOTIFY_TO_EMAIL = Deno.env.get("DEMO_NOTIFY_TO_EMAIL");
    const APP_PUBLIC_URL =
      Deno.env.get("APP_PUBLIC_URL") || "https://preuvio.com";

    console.log("[send-demo-email] Processing request...");

    if (!RESEND_API_KEY) {
      console.error("[send-demo-email] RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!DEMO_NOTIFY_TO_EMAIL) {
      console.error("[send-demo-email] DEMO_NOTIFY_TO_EMAIL is not configured");
      return new Response(
        JSON.stringify({ error: "Demo notification email not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate the recipient email format
    const recipientEmail = extractEmail(DEMO_NOTIFY_TO_EMAIL);

    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      console.error("[send-demo-email] Invalid DEMO_NOTIFY_TO_EMAIL format");
      return new Response(
        JSON.stringify({ error: "Invalid recipient email configuration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body: DemoEmailRequest = await req.json();

    // Sanitize and validate inputs
    const name = sanitizeInput(body.name);
    const email = body.email?.trim().toLowerCase();
    const company = sanitizeInput(body.company);
    const vertical = sanitizeInput(body.vertical);
    const volume = sanitizeInput(body.volume);

    console.log(
      `[send-demo-email] Demo request from company: ${company.slice(0, 20)}...`,
    );

    // Validate required fields
    if (!name || name.length < 2) {
      return new Response(
        JSON.stringify({ error: "Name is required (min 2 characters)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!company || company.length < 2) {
      return new Response(
        JSON.stringify({ error: "Company is required (min 2 characters)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Map vertical to display name
    const verticalNames: Record<string, string> = {
      sante: "Santé",
      "services-domicile": "Services à domicile",
      marketplace: "Marketplace B2B",
      "services-financiers": "Services financiers",
      education: "Éducation",
      logistique: "Transport & Logistique",
      autre: "Autre",
    };

    const volumeNames: Record<string, string> = {
      "moins-100": "Moins de 100",
      "100-500": "100 - 500",
      "500-1000": "500 - 1 000",
      "1000-5000": "1 000 - 5 000",
      "plus-5000": "Plus de 5 000",
    };

    // Determine "from" email - use verified domain if available
    const fromEmail = "Preuvio <onboarding@resend.dev>";

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
        <span class="info-value">${verticalNames[vertical] || vertical || "Non spécifié"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">📈 Volume mensuel</span>
        <span class="info-value">${volumeNames[volume] || volume || "Non spécifié"}</span>
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
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        reply_to: email,
        subject: `🎯 Nouvelle demande de démo - ${company}`,
        html: htmlContent,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[send-demo-email] Resend API error:", resendData);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(
      `[send-demo-email] Email sent successfully. Message ID: ${resendData.id}`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        message_id: resendData.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[send-demo-email] Error:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
