import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit } from "../_shared/rateLimit.ts";

// Allowed origins for CORS
const allowedOrigins = [
  'https://cybersafe-edu.lovable.app',
  'https://id-preview--f8172b8a-dce7-4f81-9ee6-f01fa9dc0397.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && allowedOrigins.some(a => origin.startsWith(a.replace(/\/$/, '')))
    ? origin
    : (origin || allowedOrigins[0]);
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Server-side rate limit check (15 requests per 5 minutes)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed, retryAfter } = await checkRateLimit(ip, "personalize", 15, 300);
    if (!allowed) {
      return new Response(JSON.stringify({ error: `Too many requests. Please try again in ${retryAfter} seconds.` }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(retryAfter) },
      });
    }

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

    const { action } = await req.json();

    if (typeof action !== "string" || action.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-recommendations") {
      // Gather user data for AI-based recommendations
      const [completions, quizAnswers, modules, profile] = await Promise.all([
        supabase.from("module_completions").select("module_id, completed_at").eq("user_id", user.id),
        supabase.from("user_quiz_answers").select("module_id, is_correct, quiz_id").eq("user_id", user.id),
        supabase.from("learning_modules").select("id, title, slug, difficulty, estimated_minutes, order_index").order("order_index"),
        supabase.from("profiles").select("total_points, level, cyber_score").eq("user_id", user.id).maybeSingle(),
      ]);

      const completedIds = new Set((completions.data || []).map((c: any) => c.module_id));
      const allModules = modules.data || [];
      const answers = quizAnswers.data || [];

      // Calculate per-module quiz accuracy
      const moduleAccuracy: Record<string, { correct: number; total: number }> = {};
      answers.forEach((a: any) => {
        if (!moduleAccuracy[a.module_id]) moduleAccuracy[a.module_id] = { correct: 0, total: 0 };
        moduleAccuracy[a.module_id].total++;
        if (a.is_correct) moduleAccuracy[a.module_id].correct++;
      });

      // Identify weak areas (below 70% accuracy)
      const weakModules = Object.entries(moduleAccuracy)
        .filter(([, stats]) => stats.total > 0 && (stats.correct / stats.total) < 0.7)
        .map(([moduleId]) => allModules.find((m: any) => m.id === moduleId))
        .filter(Boolean);

      // Identify next uncompleted modules
      const nextModules = allModules.filter((m: any) => !completedIds.has(m.id));

      // Build AI prompt for personalized recommendations
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      const userContext = {
        level: profile.data?.level || "Beginner",
        points: profile.data?.total_points || 0,
        completedCount: completedIds.size,
        totalModules: allModules.length,
        weakAreas: weakModules.map((m: any) => m.title),
        nextAvailable: nextModules.slice(0, 3).map((m: any) => ({ title: m.title, slug: m.slug, difficulty: m.difficulty })),
        overallAccuracy: answers.length > 0
          ? Math.round((answers.filter((a: any) => a.is_correct).length / answers.length) * 100)
          : 0,
      };

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
              content: `You are a learning recommendation engine for CyberSafe, a cybersecurity education platform. Based on the user's progress data, generate personalized recommendations. Return a JSON response with this structure:
{
  "greeting": "A short personalized greeting (1 sentence)",
  "nextAction": "What the user should do next (1 sentence)",
  "focusAreas": ["area1", "area2"],
  "motivationalTip": "A brief motivational message",
  "estimatedTimeToGoal": "e.g. '2 weeks to certificate'"
}
Only return valid JSON, no markdown.`
            },
            {
              role: "user",
              content: `User progress: ${JSON.stringify(userContext)}`
            }
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required" }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI gateway error");
      }

      const aiData = await aiResponse.json();
      const rawContent = aiData.choices?.[0]?.message?.content || "{}";

      let recommendations;
      try {
        recommendations = JSON.parse(rawContent.replace(/```json\n?|\n?```/g, "").trim());
      } catch {
        recommendations = {
          greeting: `Welcome back! You've completed ${userContext.completedCount} modules.`,
          nextAction: nextModules.length > 0 ? `Try "${nextModules[0].title}" next` : "Review your completed modules",
          focusAreas: weakModules.slice(0, 2).map((m: any) => m.title),
          motivationalTip: "Keep learning, every module brings you closer to your certificate!",
          estimatedTimeToGoal: "Keep going!",
        };
      }

      return new Response(JSON.stringify({
        recommendations,
        userContext,
        weakModules: weakModules.map((m: any) => ({ id: m.id, title: m.title, slug: m.slug })),
        nextModules: nextModules.slice(0, 3).map((m: any) => ({ id: m.id, title: m.title, slug: m.slug, difficulty: m.difficulty })),
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Personalization error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
