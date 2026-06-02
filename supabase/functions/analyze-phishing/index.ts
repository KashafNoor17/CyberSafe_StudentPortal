import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function cleanAndParseJson(text: string): any {
  let cleaned = text.trim();
  // Strip markdown code block wrappers if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();
  return JSON.parse(cleaned);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    const systemPrompt = "You are a cybersecurity expert analyzing message text for phishing indicators. You MUST respond with valid JSON only. Do not wrap your response in markdown code blocks or add any conversational text.";
    const userPrompt = `Analyze the following message text for phishing indicators: "${content}"
    
    Provide your response in this exact JSON schema:
    {
      "verdict": "safe", "suspicious", or "phishing",
      "confidence": 85, // a number from 0 to 100 representing confidence percentage
      "reasons": [
        "reason 1",
        "reason 2"
      ],
      "suspiciousElements": [
        "suspicious element/indicator 1",
        "suspicious element/indicator 2"
      ]
    }`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content || "";
    const result = cleanAndParseJson(replyText);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Phishing analysis error:", error);
    // Return a structured error response or let the client-side perform rule-based analysis
    return new Response(
      JSON.stringify({ 
        verdict: "suspicious",
        confidence: 50,
        reasons: ["An error occurred while connecting to AI analysis"],
        suspiciousElements: ["Connection timed out / offline fallback"]
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});