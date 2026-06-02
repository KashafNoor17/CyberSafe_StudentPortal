import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity expert analyzing text for phishing indicators. Always respond with valid JSON only, no markdown."
          },
          {
            role: "user",
            content: `Analyze this text for phishing indicators: "${text}"
            
            Respond with exactly this JSON format:
            {
              "isPhishing": true or false,
              "confidence": "high" or "medium" or "low",
              "indicators": ["indicator 1", "indicator 2"],
              "explanation": "brief explanation",
              "recommendation": "what the user should do"
            }`
          }
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const text2 = data.choices?.[0]?.message?.content || "{}";
    
    let result;
    try {
      result = JSON.parse(text2);
    } catch {
      result = { isPhishing: false, confidence: "low", indicators: [], explanation: "Could not analyze.", recommendation: "Be cautious." };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "An error occurred analyzing text." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});