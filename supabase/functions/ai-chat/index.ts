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
    const { messages, context } = await req.json();

    const systemPrompt = `You are CyberSafe AI, a friendly and knowledgeable cybersecurity assistant for the CyberSafe Student Portal.
Your role is to answer questions about cybersecurity topics (phishing, malware, passwords, safe browsing, etc.), help users navigate the platform, and provide security best practices in simple, student-friendly language.

Guidelines:
- Keep responses concise and educational (under 300 words).
- Use emojis and formatting (bold, bullet points) for readability.
- Be encouraging and supportive.
${context ? `- Note: The user is currently learning about "${context}". Tailor your response to be relevant to this topic when applicable.` : ""}`;

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []).map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: groqMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ 
        content: "I'm having trouble connecting right now. Please try again in a moment." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
