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
    const body = await req.json();
    const { action } = body;

    let systemPrompt = "You are a cybersecurity educator. You MUST respond with valid JSON only. Do not wrap your response in markdown code blocks or add any conversational text.";
    let userPrompt = "";
    let fallbackResponse: any = {};

    if (action === "summarize-module") {
      const topic = body.moduleTitle || body.moduleId || "Cybersecurity Basics";
      userPrompt = `Create a summary, key takeaways, and study questions for a cybersecurity module about: "${topic}".
      Provide your response in this exact JSON schema:
      {
        "summary": "a paragraph summary of the topic",
        "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
        "studyQuestions": [
          {"question": "question 1", "hint": "hint/answer 1"},
          {"question": "question 2", "hint": "hint/answer 2"}
        ],
        "estimatedReadMinutes": 3
      }`;

      fallbackResponse = {
        summary: {
          summary: "This module covers key cybersecurity concepts, principles, and practical security safeguards.",
          keyTakeaways: [
            "Always use strong, unique passwords for every account.",
            "Be vigilant against unsolicited requests for personal or sensitive information.",
            "Keep software and security settings updated to protect against vulnerabilities."
          ],
          studyQuestions: [
            { "question": "What is the recommended minimum password length?", "hint": "Security experts recommend at least 12 characters." },
            { "question": "How can you verify if an email is real?", "hint": "Check the sender domain name carefully and contact the organization using official channels." }
          ],
          estimatedReadMinutes: 3
        }
      };
    } else if (action === "explain-concept") {
      const { concept, level, context } = body;
      userPrompt = `Explain the following cybersecurity concept: "${concept}"
      Tailor the explanation for level: "${level || 'beginner'}".
      Context/Topic: "${context || ''}"
      
      Provide your response in this exact JSON schema:
      {
        "explanation": "a simple, clear explanation of the concept",
        "analogy": "a helpful real-world analogy to understand it",
        "examples": [
          {"title": "example title 1", "description": "practical example description 1"},
          {"title": "example title 2", "description": "practical example description 2"}
        ],
        "followUpQuestions": [
          {"question": "question 1", "answer": "answer 1"},
          {"question": "question 2", "answer": "answer 2"}
        ]
      }`;

      fallbackResponse = {
        explanation: {
          explanation: `Here is an explanation for "${concept}". It refers to security mechanisms and practices used to protect digital systems and sensitive information from unauthorized access.`,
          analogy: "Like locking your front door and checking window locks to keep your house safe.",
          examples: [
            { "title": "Example", "description": "Applying security updates and checking link safety before clicking." }
          ],
          followUpQuestions: [
            { "question": "Why is this concept important?", "answer": "It helps prevent data breaches and unauthorized system access." }
          ]
        }
      };
    } else if (action === "generate-exercise") {
      const { topic, difficulty } = body;
      userPrompt = `Create a practical practice exercise about: "${topic}"
      Difficulty: "${difficulty || 'beginner'}"
      
      Provide your response in this exact JSON schema:
      {
        "title": "Exercise Title",
        "scenario": "A brief realistic scenario setting up the task",
        "instructions": [
          "instruction step 1",
          "instruction step 2"
        ],
        "hints": [
          {"level": 1, "text": "hint 1"},
          {"level": 2, "text": "hint 2"}
        ],
        "solution": "Detailed solution explanation",
        "learningPoints": [
          "learning point 1",
          "learning point 2"
        ],
        "difficulty": "${difficulty || 'beginner'}"
      }`;

      fallbackResponse = {
        content: {
          title: `Practice Exercise: ${topic}`,
          scenario: `A training scenario simulating real-world safety checks regarding ${topic}.`,
          instructions: [
            "Review the details carefully.",
            "Identify potential safety risks or configuration steps.",
            "Submit the proposed security action."
          ],
          hints: [
            { "level": 1, "text": "Check for common indicator patterns." }
          ],
          solution: "Adopt secure defaults, enforce authentication filters, and keep logs.",
          learningPoints: [
            "Early detection prevents security incidents.",
            "Always verify before trusting."
          ],
          difficulty: difficulty || "beginner"
        }
      };
    } else {
      throw new Error(`Unsupported action: ${action}`);
    }

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
        max_tokens: 800,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "";
    
    let parsed = cleanAndParseJson(reply);
    
    // Wrap response according to the action expected by front-end
    let finalResult = {};
    if (action === "summarize-module") {
      finalResult = { summary: parsed };
    } else if (action === "explain-concept") {
      finalResult = { explanation: parsed };
    } else if (action === "generate-exercise") {
      finalResult = { content: parsed };
    }

    return new Response(
      JSON.stringify(finalResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI Content error:", error);
    // Return fallback JSON to prevent frontend crash
    return new Response(
      JSON.stringify(fallbackResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
