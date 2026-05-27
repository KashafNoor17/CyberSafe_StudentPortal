import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const allowedOrigins = [
  'https://cybersafe-edu.lovable.app',
  'https://id-preview--f8172b8a-dce7-4f81-9ee6-f01fa9dc0397.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, ''))) 
    ? origin 
    : (origin || allowedOrigins[0]);
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate content input
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: "Content is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit content length to prevent abuse
    if (content.length > 10000) {
      return new Response(
        JSON.stringify({ error: "Content exceeds maximum length of 10,000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a phishing detection expert. Analyze the provided email, SMS, or message content for phishing indicators.

Return a JSON response with:
{
  "verdict": "safe" | "suspicious" | "phishing",
  "confidence": number (0-100),
  "reasons": string[] (key reasons for the verdict),
  "suspiciousElements": string[] (specific suspicious elements found)
}

Indicators to check:
- Urgency or threat language ("act now", "account suspended", "limited time")
- Requests for sensitive info (passwords, SSN, credit cards)
- Generic greetings ("Dear Customer")
- Suspicious links or shortened URLs
- Poor grammar/spelling
- Mismatched sender domains
- Too-good-to-be-true offers
- Impersonation of known brands
- Pressure tactics

Be thorough but avoid false positives. Legitimate marketing emails may have some urgency but shouldn't be flagged as phishing.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this message for phishing:\n\n${content}` }
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const responseContent = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = responseContent;
      const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      const result = JSON.parse(jsonStr.trim());
      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseContent);
      // Return a default suspicious response
      return new Response(
        JSON.stringify({
          verdict: "suspicious",
          confidence: 50,
          reasons: ["Unable to fully analyze the content"],
          suspiciousElements: ["Analysis incomplete"]
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});