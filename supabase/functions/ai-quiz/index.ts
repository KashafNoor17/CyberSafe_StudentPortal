import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Auth required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, moduleId, quizResults } = await req.json();

    if (typeof action !== "string" || action.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (moduleId !== undefined && (typeof moduleId !== "string" || moduleId.length > 100)) {
      return new Response(JSON.stringify({ error: "Invalid moduleId" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // ─── Action: generate-quiz ───
    if (action === "generate-quiz") {
      // Gather user weak areas for this module
      const [answersResult, moduleResult] = await Promise.all([
        supabase.from("user_quiz_answers").select("quiz_id, is_correct, selected_answer").eq("user_id", user.id).eq("module_id", moduleId),
        supabase.from("learning_modules").select("title, difficulty, slug").eq("id", moduleId).maybeSingle(),
      ]);

      const answers = answersResult.data || [];
      const module = moduleResult.data;
      if (!module) {
        return new Response(JSON.stringify({ error: "Module not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const wrongCount = answers.filter((a: any) => !a.is_correct).length;
      const totalCount = answers.length;
      const accuracy = totalCount > 0 ? Math.round((1 - wrongCount / totalCount) * 100) : 0;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a cybersecurity quiz generator for CyberSafe, an educational platform. Generate adaptive quiz questions based on the user's performance. Return ONLY valid JSON array, no markdown.

Each question object must have:
- "question": string (the question text)
- "options": { "A": string, "B": string, "C": string, "D": string }
- "correct": "A" | "B" | "C" | "D"
- "explanation": string (why the answer is correct)
- "difficulty": "easy" | "medium" | "hard"
- "topic": string (specific sub-topic)

Generate practical, scenario-based questions. Make them educational.`,
            },
            {
              role: "user",
              content: `Generate 5 multiple-choice questions about "${module.title}" (${module.difficulty} difficulty).
User's current accuracy on this module: ${accuracy}%.
${accuracy < 50 ? "User is struggling — generate easier questions focusing on fundamentals." : accuracy < 80 ? "User is progressing — mix fundamental and intermediate questions." : "User is doing well — include challenging scenario-based questions."}
${wrongCount > 0 ? `User has gotten ${wrongCount} out of ${totalCount} questions wrong previously.` : "User hasn't attempted questions yet — start with foundational concepts."}`,
            },
          ],
          max_tokens: 1500,
          temperature: 0.8,
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        if (status === 429 || status === 402) {
          return new Response(JSON.stringify({ error: status === 429 ? "Rate limited" : "Payment required" }), {
            status, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI gateway error");
      }

      const aiData = await aiResponse.json();
      const raw = aiData.choices?.[0]?.message?.content || "[]";

      let questions;
      try {
        questions = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
      } catch {
        questions = [];
      }

      return new Response(JSON.stringify({ questions, moduleTitle: module.title, userAccuracy: accuracy }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Action: generate-feedback ───
    if (action === "generate-feedback") {
      if (!quizResults) {
        return new Response(JSON.stringify({ error: "quizResults required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { score, total, wrongTopics, moduleTitle } = quizResults;
      const safeScore = Math.max(0, Math.min(Number(score) || 0, 1000));
      const safeTotal = Math.max(0, Math.min(Number(total) || 0, 1000));
      const safeModuleTitle = (typeof moduleTitle === "string" ? moduleTitle : "").slice(0, 200);
      const safeWrongTopics = Array.isArray(wrongTopics)
        ? wrongTopics.slice(0, 20).map((t: unknown) => String(t).slice(0, 100))
        : [];
      const percentage = safeTotal > 0 ? Math.round((safeScore / safeTotal) * 100) : 0;

      const [profileResult] = await Promise.all([
        supabase.from("profiles").select("level, total_points").eq("user_id", user.id).maybeSingle(),
      ]);
      const level = profileResult.data?.level || "Beginner";

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a supportive cybersecurity tutor providing personalized quiz feedback. Return ONLY valid JSON with this structure:
{
  "summary": "1-2 sentence performance summary",
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "tips": ["actionable tip 1", "actionable tip 2"],
  "encouragement": "motivational message",
  "nextSteps": "what to do next"
}
Be encouraging but honest. Adapt complexity to user level.`,
            },
            {
              role: "user",
              content: `User scored ${safeScore}/${safeTotal} (${percentage}%) on "${safeModuleTitle || "a quiz"}".
User level: ${level}.
${safeWrongTopics.length > 0 ? `Topics they struggled with: ${safeWrongTopics.join(", ")}` : "No specific weak topics identified."}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        if (status === 429 || status === 402) {
          return new Response(JSON.stringify({ error: status === 429 ? "Rate limited" : "Payment required" }), {
            status, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI gateway error");
      }

      const aiData = await aiResponse.json();
      const raw = aiData.choices?.[0]?.message?.content || "{}";

      let feedback;
      try {
        feedback = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
      } catch {
        feedback = {
          summary: `You scored ${percentage}%. ${percentage >= 70 ? "Great job!" : "Keep practicing!"}`,
          strengths: [],
          improvements: wrongTopics || [],
          tips: ["Review the module material and try again"],
          encouragement: "Every attempt makes you stronger!",
          nextSteps: "Review weak areas and retake the quiz.",
        };
      }

      return new Response(JSON.stringify({ feedback, score: safeScore, total: safeTotal, percentage }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Action: daily-checkin ───
    if (action === "daily-checkin") {
      const [profileResult, completionsResult, streakResult, srResult] = await Promise.all([
        supabase.from("profiles").select("name, level, total_points, cyber_score").eq("user_id", user.id).maybeSingle(),
        supabase.from("module_completions").select("module_id, completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(5),
        supabase.from("user_streaks").select("current_streak, longest_streak").eq("user_id", user.id).maybeSingle(),
        supabase.from("spaced_repetition_items").select("id").eq("user_id", user.id).lte("next_review_at", new Date().toISOString()),
      ]);

      const profile = profileResult.data;
      const recentCompletions = completionsResult.data || [];
      const streak = streakResult.data;
      const dueReviews = (srResult.data || []).length;

      const hour = new Date().getUTCHours();
      const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `You are CyberSafe Mentor, a friendly AI learning companion. Generate a personalized daily check-in. Return ONLY valid JSON:
{
  "greeting": "personalized greeting (1 sentence)",
  "dailyTip": "a practical cybersecurity tip (2-3 sentences)",
  "dailyGoal": "a specific achievable goal for today",
  "motivation": "brief motivational message",
  "focusSuggestion": "what to focus on today based on their progress"
}
Be warm, concise, and encouraging.`,
            },
            {
              role: "user",
              content: `Time: ${timeOfDay}. User: ${profile?.name || "Student"}. Level: ${profile?.level || "Beginner"}. Points: ${profile?.total_points || 0}. Streak: ${streak?.current_streak || 0} days. Reviews due: ${dueReviews}. Recent completions: ${recentCompletions.length}. ${recentCompletions.length > 0 ? "Completed a module recently." : "Hasn't completed a module recently."}`,
            },
          ],
          max_tokens: 300,
          temperature: 0.9,
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        if (status === 429 || status === 402) {
          return new Response(JSON.stringify({ error: status === 429 ? "Rate limited" : "Payment required" }), {
            status, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI gateway error");
      }

      const aiData = await aiResponse.json();
      const raw = aiData.choices?.[0]?.message?.content || "{}";

      let checkin;
      try {
        checkin = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
      } catch {
        checkin = {
          greeting: `Good ${timeOfDay}, ${profile?.name || "Student"}!`,
          dailyTip: "Always verify the sender's email address before clicking any links.",
          dailyGoal: "Complete one learning module today.",
          motivation: "Every step forward makes you more secure online!",
          focusSuggestion: "Start with the next available module in your learning path.",
        };
      }

      return new Response(JSON.stringify({
        checkin,
        stats: {
          streak: streak?.current_streak || 0,
          dueReviews,
          level: profile?.level || "Beginner",
        },
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Quiz error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
