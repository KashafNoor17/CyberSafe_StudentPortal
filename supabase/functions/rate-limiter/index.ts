import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 100; // per window per IP

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();

  // Clean expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [key, val] of rateLimitStore) {
      if (val.resetAt < now) rateLimitStore.delete(key);
    }
  }

  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return new Response(JSON.stringify({ allowed: true, remaining: MAX_REQUESTS - 1 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    return new Response(
      JSON.stringify({ allowed: false, error: "Rate limit exceeded", retryAfter: Math.ceil((entry.resetAt - now) / 1000) }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } }
    );
  }

  return new Response(JSON.stringify({ allowed: true, remaining: MAX_REQUESTS - entry.count }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
