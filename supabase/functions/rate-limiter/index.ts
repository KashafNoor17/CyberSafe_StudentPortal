import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";

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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    
    // Parse request body for action parameter
    let action = "api";
    try {
      const body = await req.json();
      if (body && typeof body.action === "string") {
        action = body.action;
      }
    } catch {
      // Allow fallback if body parsing fails or is empty
    }

    let maxRequests = 60;
    let windowSeconds = 60;

    if (action === "login") {
      maxRequests = 5;
      windowSeconds = 900; // 15 minutes
    } else if (action === "signup") {
      maxRequests = 3;
      windowSeconds = 3600; // 1 hour
    }

    if (action === "login" || action === "signup") {
      console.log(`[Authentication Attempt] IP: ${ip}, Action: ${action}, Timestamp: ${new Date().toISOString()}`);
    }

    const { allowed, remaining, retryAfter } = await checkRateLimit(
      ip,
      action,
      maxRequests,
      windowSeconds
    );

    if (!allowed) {
      return new Response(
        JSON.stringify({ allowed: false, error: "Rate limit exceeded", retryAfter }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter)
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ allowed: true, remaining }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error: any) {
    console.error("Error in rate-limiter function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
