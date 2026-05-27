import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Validate that a value is a non-empty string within a max length.
function validString(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function parseAIJSON(raw: string, fallback: unknown = {}) {
  try {
    return JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    return fallback;
  }
}

// Simple hash for cache keys
async function hashContent(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

async function callAI(apiKey: string, messages: { role: string; content: string }[], maxTokens = 1500, temperature = 0.7) {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!resp.ok) {
    const status = resp.status;
    if (status === 429 || status === 402) {
      throw { httpStatus: status, message: status === 429 ? "Rate limited" : "Payment required" };
    }
    throw new Error("AI gateway error");
  }

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  const tokensUsed = data.usage?.total_tokens || 0;
  return { content, tokensUsed };
}

// Try cache first, call AI if miss, store result
async function cachedAICall(
  supabase: any,
  cacheKey: string,
  contentType: string,
  aiCall: () => Promise<{ content: string; tokensUsed: number }>
): Promise<{ result: any; tokensUsed: number; cached: boolean }> {
  const hash = await hashContent(cacheKey);

  // Check cache
  const { data: cached } = await supabase
    .from("ai_content_cache")
    .select("response, id")
    .eq("content_hash", hash)
    .maybeSingle();

  if (cached) {
    // Increment access count (fire and forget)
    supabase.rpc("increment_cache_access", { cache_id: cached.id }).catch(() => {});
    return { result: cached.response, tokensUsed: 0, cached: true };
  }

  // Cache miss - call AI
  const { content, tokensUsed } = await aiCall();
  const parsed = parseAIJSON(content, null);

  if (parsed) {
    // Store in cache (fire and forget)
    supabase.from("ai_content_cache").insert({
      content_hash: hash,
      content_type: contentType,
      response: parsed,
    }).then(() => {}).catch(() => {});
  }

  return { result: parsed, tokensUsed, cached: false };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return jsonResponse({ error: "Auth required" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return jsonResponse({ error: "Invalid auth" }, 401);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const { action } = body;

    // ─── Generate Module Content ───
    if (action === "generate-module") {
      const topic = validString(body.topic, 200);
      const difficulty = validString(body.difficulty, 50) ?? "beginner";
      const audience = validString(body.audience, 100) ?? "general";
      if (!topic) return jsonResponse({ error: "topic required (≤200 chars)" }, 400);

      const { content: raw, tokensUsed } = await callAI(LOVABLE_API_KEY, [
        {
          role: "system",
          content: `You are a cybersecurity curriculum designer. Generate a complete learning module. Return ONLY valid JSON:
{
  "title": "Module title",
  "description": "1-2 sentence description",
  "sections": [
    { "title": "Section title", "content": "Detailed content (3-5 paragraphs)" }
  ],
  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3", "takeaway4", "takeaway5"],
  "studyQuestions": ["question1", "question2", "question3"],
  "estimatedMinutes": 15,
  "summary": "3-paragraph summary of key concepts"
}
Include practical examples and real-world scenarios. Make content educational and actionable.`
        },
        {
          role: "user",
          content: `Generate a ${difficulty}-level module about "${topic}" for ${audience} audience.`
        }
      ], 3000, 0.8);

      const content = parseAIJSON(raw, null);
      if (!content) return jsonResponse({ error: "Failed to generate module" }, 500);

      const { data: saved, error: saveErr } = await supabase
        .from("ai_generated_content")
        .insert({
          content_type: "module",
          content_data: content,
          prompt_used: `Topic: ${topic}, Difficulty: ${difficulty}, Audience: ${audience}`,
          created_by: user.id,
          status: "pending",
        })
        .select("id")
        .single();

      if (!saveErr && saved) {
        await supabase.from("content_review_queue").insert({
          content_id: saved.id,
          content_type: "module",
          priority: "medium",
        });
      }

      return jsonResponse({ content, contentId: saved?.id });
    }

    // ─── Generate Exercise ───
    if (action === "generate-exercise") {
      const topic = validString(body.topic, 200);
      const difficulty = validString(body.difficulty, 50) ?? "beginner";
      const exerciseType = validString(body.exerciseType, 50) ?? "scenario";
      if (!topic) return jsonResponse({ error: "topic required (≤200 chars)" }, 400);

      const { content: raw } = await callAI(LOVABLE_API_KEY, [
        {
          role: "system",
          content: `You are a cybersecurity exercise designer. Generate an interactive practice exercise. Return ONLY valid JSON:
{
  "title": "Exercise title",
  "scenario": "Detailed scenario description (2-3 paragraphs)",
  "instructions": ["step1", "step2", "step3"],
  "hints": [
    { "level": 1, "text": "Gentle nudge" },
    { "level": 2, "text": "More specific hint" },
    { "level": 3, "text": "Nearly gives the answer" }
  ],
  "solution": "Step-by-step solution explanation",
  "learningPoints": ["point1", "point2", "point3"],
  "difficulty": "${difficulty}"
}
Make it realistic and educational.`
        },
        {
          role: "user",
          content: `Generate a ${difficulty} ${exerciseType} exercise about "${topic}".`
        }
      ], 2000, 0.8);

      const content = parseAIJSON(raw, null);
      if (!content) return jsonResponse({ error: "Failed to generate exercise" }, 500);

      const { data: saved } = await supabase
        .from("ai_generated_content")
        .insert({
          content_type: "exercise",
          content_data: content,
          prompt_used: `Topic: ${topic}, Type: ${exerciseType}, Difficulty: ${difficulty}`,
          created_by: user.id,
          status: "pending",
        })
        .select("id")
        .single();

      return jsonResponse({ content, contentId: saved?.id });
    }

    // ─── Summarize Module (with caching) ───
    if (action === "summarize-module") {
      const { moduleId } = body;
      if (!moduleId) return jsonResponse({ error: "moduleId required" }, 400);

      const [moduleResult, sectionsResult] = await Promise.all([
        supabase.from("learning_modules").select("title, description, content, difficulty").eq("id", moduleId).maybeSingle(),
        supabase.from("module_sections").select("title, content").eq("module_id", moduleId).order("order_index"),
      ]);

      const mod = moduleResult.data;
      if (!mod) return jsonResponse({ error: "Module not found" }, 404);

      const moduleContent = mod.content as any;
      const sections = sectionsResult.data || [];
      const allText = [
        mod.description,
        moduleContent?.definition,
        moduleContent?.methodology,
        moduleContent?.example,
        ...(moduleContent?.prevention || []),
        ...(moduleContent?.sections?.map((s: any) => `${s.title}: ${s.content}`) || []),
        ...sections.map((s: any) => `${s.title}: ${s.content}`),
      ].filter(Boolean).join("\n\n");

      const cacheKey = `summary:${moduleId}:${allText.slice(0, 200)}`;

      const { result: summary, cached } = await cachedAICall(
        supabase,
        cacheKey,
        "summary",
        async () => callAI(LOVABLE_API_KEY, [
          {
            role: "system",
            content: `You are a cybersecurity education summarizer. Create a comprehensive summary. Return ONLY valid JSON:
{
  "summary": "3-paragraph summary of key concepts",
  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3", "takeaway4", "takeaway5"],
  "studyQuestions": [
    { "question": "Question text?", "hint": "Brief hint for the answer" }
  ],
  "keyTerms": [
    { "term": "Term name", "definition": "Brief definition" }
  ],
  "estimatedReadMinutes": 3
}`
          },
          {
            role: "user",
            content: `Summarize this ${mod.difficulty}-level cybersecurity module titled "${mod.title}":\n\n${allText.slice(0, 4000)}`
          }
        ], 1500, 0.6)
      );

      const finalSummary = summary || {
        summary: `This module covers ${mod.title}. ${mod.description || ""}`,
        keyTakeaways: ["Review the module content for key concepts"],
        studyQuestions: [{ question: `What are the main concepts of ${mod.title}?`, hint: "Review the module sections." }],
        keyTerms: [],
        estimatedReadMinutes: 3,
      };

      return jsonResponse({ summary: finalSummary, moduleTitle: mod.title, cached });
    }

    // ─── Optimized Learning Path ───
    if (action === "optimized-path") {
      const [completions, quizAnswers, modules, profile, prefs] = await Promise.all([
        supabase.from("module_completions").select("module_id").eq("user_id", user.id),
        supabase.from("user_quiz_answers").select("module_id, is_correct").eq("user_id", user.id),
        supabase.from("learning_modules").select("id, title, slug, difficulty, estimated_minutes, order_index").order("order_index"),
        supabase.from("profiles").select("level, total_points").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_learning_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      const completedIds = new Set((completions.data || []).map((c: any) => c.module_id));
      const allModules = modules.data || [];
      const answers = quizAnswers.data || [];
      const incompleteModules = allModules.filter((m: any) => !completedIds.has(m.id));

      const modAcc: Record<string, { correct: number; total: number }> = {};
      answers.forEach((a: any) => {
        if (!modAcc[a.module_id]) modAcc[a.module_id] = { correct: 0, total: 0 };
        modAcc[a.module_id].total++;
        if (a.is_correct) modAcc[a.module_id].correct++;
      });

      const weakModuleIds = Object.entries(modAcc)
        .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.7)
        .map(([id]) => id);

      const { content: raw } = await callAI(LOVABLE_API_KEY, [
        {
          role: "system",
          content: `You are a learning path optimizer for CyberSafe. Suggest the next 5 modules and alternative paths. Return ONLY valid JSON:
{
  "recommendedPath": [
    { "moduleTitle": "title", "reason": "why this module next", "estimatedMinutes": 15, "priority": "high|medium|low" }
  ],
  "alternativePaths": {
    "quickWins": [{ "moduleTitle": "title", "reason": "reason" }],
    "deepDive": [{ "moduleTitle": "title", "reason": "reason" }]
  },
  "overallStrategy": "1-2 sentence learning strategy recommendation",
  "estimatedCompletionWeeks": 2
}`
        },
        {
          role: "user",
          content: `User level: ${profile.data?.level || "Beginner"}. Points: ${profile.data?.total_points || 0}. Completed: ${completedIds.size}/${allModules.length}. Weak areas: ${weakModuleIds.length} modules. Available modules: ${incompleteModules.slice(0, 10).map((m: any) => `${m.title} (${m.difficulty}, ${m.estimated_minutes}min)`).join(", ")}. Preferred session: ${prefs.data?.preferred_session_minutes || 15} min.`
        }
      ], 1000, 0.7);

      const path = parseAIJSON(raw, {
        recommendedPath: incompleteModules.slice(0, 5).map((m: any) => ({
          moduleTitle: m.title,
          reason: "Next in sequence",
          estimatedMinutes: m.estimated_minutes,
          priority: "medium",
        })),
        alternativePaths: { quickWins: [], deepDive: [] },
        overallStrategy: "Follow the recommended path to build foundational skills.",
        estimatedCompletionWeeks: 4,
      });

      return jsonResponse({
        path,
        userStats: {
          completed: completedIds.size,
          total: allModules.length,
          level: profile.data?.level || "Beginner",
        },
        availableModules: incompleteModules.map((m: any) => ({
          id: m.id, title: m.title, slug: m.slug, difficulty: m.difficulty, estimatedMinutes: m.estimated_minutes,
        })),
      });
    }

    // ─── Explain Concept (with caching) ───
    if (action === "explain-concept") {
      const concept = validString(body.concept, 200);
      const level = validString(body.level, 50) ?? "beginner";
      const context = (typeof body.context === "string" ? body.context : "").slice(0, 500);
      if (!concept) return jsonResponse({ error: "concept required (≤200 chars)" }, 400);

      const cacheKey = `explain:${concept}:${level}:${context}`;

      const { result: explanation, cached } = await cachedAICall(
        supabase,
        cacheKey,
        "explanation",
        async () => callAI(LOVABLE_API_KEY, [
          {
            role: "system",
            content: `You are a patient cybersecurity tutor. Explain concepts clearly at the student's level. Return ONLY valid JSON:
{
  "explanation": "Clear explanation adapted to level (2-3 paragraphs)",
  "examples": [
    { "title": "Example title", "description": "Practical real-world example" },
    { "title": "Example title", "description": "Another practical example" }
  ],
  "analogy": "A relatable analogy to help understand the concept",
  "followUpQuestions": [
    { "question": "Check-understanding question?", "answer": "Brief answer" }
  ]
}`
          },
          {
            role: "user",
            content: `Explain "${concept}" at ${level} level.${context ? ` Context: ${context}` : ""}`
          }
        ], 1500, 0.7)
      );

      const finalExplanation = explanation || {
        explanation: `${concept} is an important cybersecurity concept. Please try again later for a detailed explanation.`,
        examples: [],
        analogy: "",
        followUpQuestions: [],
      };

      return jsonResponse({ explanation: finalExplanation, cached });
    }

    // ─── Progressive Hint Generation ───
    if (action === "generate-hint") {
      const exerciseTopic = validString(body.exerciseTopic, 200);
      const hintLevel = Number(body.hintLevel) || 1;
      const userAttempt = (typeof body.userAttempt === "string" ? body.userAttempt : "").slice(0, 200);
      if (!exerciseTopic) return jsonResponse({ error: "exerciseTopic required (≤200 chars)" }, 400);

      const hintDescriptions: Record<number, string> = {
        1: "a gentle nudge that points in the right direction without revealing the answer",
        2: "a more specific hint that narrows down the approach",
        3: "a direct hint that nearly gives the answer but still requires the user to think",
      };

      const { content: raw } = await callAI(LOVABLE_API_KEY, [
        {
          role: "system",
          content: `You are a cybersecurity tutor providing progressive hints. Return ONLY valid JSON:
{
  "hint": "The hint text",
  "encouragement": "A brief encouraging message"
}`
        },
        {
          role: "user",
          content: `Exercise topic: "${exerciseTopic}". Hint level ${hintLevel}/3: Provide ${hintDescriptions[hintLevel] || hintDescriptions[1]}.${userAttempt ? ` User's current attempt: "${userAttempt.slice(0, 200)}"` : ""}`
        }
      ], 300, 0.7);

      const hint = parseAIJSON(raw, {
        hint: "Think about the fundamental concepts related to this topic.",
        encouragement: "You're on the right track!",
      });

      return jsonResponse({ hint, level: hintLevel });
    }

    // ─── Analyze User Progress ───
    if (action === "analyze-progress") {
      const [completions, quizAnswers, modules, profile] = await Promise.all([
        supabase.from("module_completions").select("module_id, completed_at").eq("user_id", user.id),
        supabase.from("user_quiz_answers").select("module_id, is_correct, answered_at").eq("user_id", user.id),
        supabase.from("learning_modules").select("id, title, difficulty").order("order_index"),
        supabase.from("profiles").select("level, total_points, cyber_score").eq("user_id", user.id).maybeSingle(),
      ]);

      const completedIds = new Set((completions.data || []).map((c: any) => c.module_id));
      const allModules = modules.data || [];
      const answers = quizAnswers.data || [];

      // Per-module accuracy
      const modAcc: Record<string, { correct: number; total: number; title: string }> = {};
      answers.forEach((a: any) => {
        const mod = allModules.find((m: any) => m.id === a.module_id);
        if (!modAcc[a.module_id]) modAcc[a.module_id] = { correct: 0, total: 0, title: mod?.title || "Unknown" };
        modAcc[a.module_id].total++;
        if (a.is_correct) modAcc[a.module_id].correct++;
      });

      const strengths = Object.entries(modAcc)
        .filter(([, s]) => s.total >= 3 && s.correct / s.total >= 0.8)
        .map(([, s]) => s.title);

      const weaknesses = Object.entries(modAcc)
        .filter(([, s]) => s.total >= 2 && s.correct / s.total < 0.7)
        .map(([, s]) => s.title);

      const overallAccuracy = answers.length > 0
        ? Math.round((answers.filter((a: any) => a.is_correct).length / answers.length) * 100)
        : 0;

      return jsonResponse({
        progress: {
          completedModules: completedIds.size,
          totalModules: allModules.length,
          completionRate: Math.round((completedIds.size / Math.max(allModules.length, 1)) * 100),
          overallAccuracy,
          strengths,
          weaknesses,
          level: profile.data?.level || "Beginner",
          totalPoints: profile.data?.total_points || 0,
          cyberScore: profile.data?.cyber_score || 0,
        },
      });
    }

    // ─── Predictive Analytics (at-risk students) ───
    if (action === "at-risk-analysis") {
      const { data: roleCheck } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleCheck) return jsonResponse({ error: "Admin access required" }, 403);

      const [segments, streaks] = await Promise.all([
        supabase.from("user_segments").select("user_id, segment_name, days_since_last_visit, total_modules_completed").order("days_since_last_visit", { ascending: false }).limit(50),
        supabase.from("user_streaks").select("user_id, current_streak").order("current_streak").limit(50),
      ]);

      const users = segments.data || [];
      const atRisk = users
        .filter((u: any) => u.days_since_last_visit > 7 || u.segment_name === "churned" || u.segment_name === "at_risk")
        .map((u: any) => {
          const streak = (streaks.data || []).find((s: any) => s.user_id === u.user_id);
          const riskScore = Math.min(100, Math.max(0,
            (u.days_since_last_visit > 30 ? 90 : u.days_since_last_visit > 14 ? 70 : u.days_since_last_visit > 7 ? 50 : 20) +
            (u.total_modules_completed === 0 ? 20 : 0) -
            ((streak?.current_streak || 0) * 5)
          ));
          return {
            userId: u.user_id,
            segment: u.segment_name,
            daysSinceLastVisit: u.days_since_last_visit,
            modulesCompleted: u.total_modules_completed,
            currentStreak: streak?.current_streak || 0,
            riskScore,
            intervention: riskScore > 70 ? "Send re-engagement email" : riskScore > 50 ? "Send reminder notification" : "Monitor",
          };
        })
        .sort((a: any, b: any) => b.riskScore - a.riskScore);

      return jsonResponse({
        atRiskStudents: atRisk.slice(0, 20),
        totalAtRisk: atRisk.filter((u: any) => u.riskScore > 50).length,
        totalUsers: users.length,
      });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (error: any) {
    if (error?.httpStatus) {
      return jsonResponse({ error: error.message }, error.httpStatus);
    }
    console.error("AI Content error:", error);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
