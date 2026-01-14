import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeDocumentRequest {
  evidence_id: string;
}

interface ExtractedData {
  doc_type: string | null;
  name_or_company: string | null;
  siret_siren: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  confidence: number;
  raw_text?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("[analyze-document] LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: AnalyzeDocumentRequest = await req.json();
    const { evidence_id } = body;

    if (!evidence_id) {
      return new Response(
        JSON.stringify({ error: "Missing evidence_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[analyze-document] Starting analysis for evidence: ${evidence_id}`);

    // Fetch evidence
    const { data: evidence, error: evidenceError } = await supabase
      .from("evidences")
      .select("*")
      .eq("id", evidence_id)
      .single();

    if (evidenceError || !evidence) {
      console.error("[analyze-document] Evidence not found:", evidenceError);
      return new Response(
        JSON.stringify({ error: "Evidence not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get signed URL for the file (5 min validity)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("evidences")
      .createSignedUrl(evidence.file_path, 300);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("[analyze-document] Failed to get signed URL:", signedUrlError);
      return new Response(
        JSON.stringify({ error: "Failed to access document" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[analyze-document] Got signed URL for document`);

    // Download the file and convert to base64 for vision API
    const fileResponse = await fetch(signedUrlData.signedUrl);
    const fileBlob = await fileResponse.blob();
    const arrayBuffer = await fileBlob.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Determine media type
    const mediaType = evidence.mime_type || "image/jpeg";

    // Call Lovable AI Gateway with vision
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Tu es un expert en extraction de données de documents administratifs français. 
Tu dois analyser l'image d'un document et extraire les informations suivantes au format JSON strict.

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après.

Format de réponse attendu:
{
  "doc_type": "carte_professionnelle_vtc" | "permis_conduire" | "kbis" | "attestation_assurance" | "certificat_immatriculation" | "autre",
  "name_or_company": "Nom de la personne ou raison sociale",
  "siret_siren": "Numéro SIRET ou SIREN si visible (14 ou 9 chiffres)",
  "issue_date": "YYYY-MM-DD ou null si non visible",
  "expiry_date": "YYYY-MM-DD ou null si non visible",
  "confidence": 0.0 à 1.0
}

Règles:
- Si une information n'est pas visible, utilise null
- Le score de confidence reflète la qualité de lecture (0.5 = illisible, 0.8 = lisible avec doutes, 1.0 = parfaitement lisible)
- Les dates doivent être au format ISO (YYYY-MM-DD)
- Pour les cartes VTC, cherche la date de validité
- Pour les attestations d'assurance, cherche la période de couverture`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyse ce document "${evidence.document_name}" de type attendu "${evidence.document_type}" et extrais les informations demandées.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mediaType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[analyze-document] AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";

    console.log(`[analyze-document] AI response received`);

    // Parse the JSON from AI response
    let extractedData: ExtractedData;
    try {
      // Try to extract JSON from the response (might be wrapped in markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("[analyze-document] Failed to parse AI response:", parseError);
      extractedData = {
        doc_type: evidence.document_type,
        name_or_company: null,
        siret_siren: null,
        issue_date: null,
        expiry_date: null,
        confidence: 0.3,
        raw_text: aiContent,
      };
    }

    console.log(`[analyze-document] Extracted data:`, extractedData);

    // Update evidence with extracted data
    const updateData: Record<string, unknown> = {
      ai_analysis: extractedData,
      extraction_confidence: extractedData.confidence,
      updated_at: new Date().toISOString(),
    };

    // Update expiry_date if extracted and not already set
    if (extractedData.expiry_date && !evidence.expires_at) {
      updateData.expires_at = extractedData.expiry_date;
    }

    // Update issued_at if extracted and not already set
    if (extractedData.issue_date && !evidence.issued_at) {
      updateData.issued_at = extractedData.issue_date;
    }

    const { error: updateError } = await supabase
      .from("evidences")
      .update(updateData)
      .eq("id", evidence_id);

    if (updateError) {
      console.error("[analyze-document] Failed to update evidence:", updateError);
    }

    // Log the analysis
    await supabase.from("audit_logs").insert({
      platform_id: evidence.platform_id,
      action: "ai_analysis_completed",
      entity_type: "evidence",
      entity_id: evidence_id,
      new_data: { 
        confidence: extractedData.confidence,
        doc_type: extractedData.doc_type,
        expiry_date: extractedData.expiry_date,
      },
    });

    console.log(`[analyze-document] Analysis completed for evidence: ${evidence_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        extracted_data: extractedData 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[analyze-document] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
