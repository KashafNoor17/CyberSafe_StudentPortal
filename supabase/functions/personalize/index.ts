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
    const { userLevel, completedModules, quizScores } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a personalized cybersecurity learning advisor. Always respond with valid JSON only, no markdown."
          },
          {
            role: "user",
            content: `Create a personalized learning recommendation for a student with:
            - Level: ${userLevel || "beginner"}
            - Completed modules: ${JSON.stringify(completedModules || [])}
            - Quiz scores: ${JSON.stringify(quizScores || {})}
            
            Respond with exactly this JSON format:
            {
              "nextModule": "recommended module name",
              "reason": "why this module",
              "tips": ["tip 1", "tip 2", "tip 3"],
              "encouragement": "motivational message"
            }`
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { nextModule: "Password Security", reason: "Start with the basics.", tips: ["Take your time", "Practice daily", "Ask questions"], encouragement: "You are doing great!" };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "An error occurred personalizing content." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
