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
    const { topic } = await req.json();

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
            content: "You are a cybersecurity quiz generator. Always respond with valid JSON only, no markdown."
          },
          {
            role: "user",
            content: `Generate 3 multiple choice quiz questions about "${topic}" for cybersecurity students. 
            Respond with this exact JSON format:
            {"questions":[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A","explanation":"..."}]}`
          }
        ],
        max_tokens: 800,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    
    let questions;
    try {
      questions = JSON.parse(text);
    } catch {
      questions = { questions: [] };
    }

    return new Response(
      JSON.stringify(questions),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "An error occurred generating quiz." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
