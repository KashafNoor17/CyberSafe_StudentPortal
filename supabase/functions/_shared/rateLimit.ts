import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function checkRateLimit(
  ip: string,
  endpoint: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Rate limiter configuration error: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    // Fail-open to prevent user-facing downtime
    return { allowed: true, remaining: 1, retryAfter: 0 };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const now = new Date();

  try {
    // 1. Delete expired rate limits for this endpoint/IP
    await supabase
      .from("rate_limits")
      .delete()
      .lt("reset_at", now.toISOString());

    // 2. Query rate limit entry for this IP and endpoint
    const { data, error } = await supabase
      .from("rate_limits")
      .select("id, request_count, reset_at")
      .eq("ip_address", ip)
      .eq("endpoint", endpoint)
      .maybeSingle();

    if (error) {
      console.error(`Rate limit check error for ${ip}/${endpoint}:`, error);
      return { allowed: true, remaining: 1, retryAfter: 0 };
    }

    if (!data) {
      // 3. Insert new rate limit entry
      const resetAt = new Date(now.getTime() + windowSeconds * 1000);
      const { error: insertError } = await supabase
        .from("rate_limits")
        .insert({
          ip_address: ip,
          endpoint: endpoint,
          request_count: 1,
          reset_at: resetAt.toISOString()
        });

      if (insertError) {
        // Handle race condition: if unique key violation, retry once
        if (insertError.code === "23505") {
          return checkRateLimit(ip, endpoint, maxRequests, windowSeconds);
        }
        console.error(`Rate limit insert error for ${ip}/${endpoint}:`, insertError);
        return { allowed: true, remaining: 1, retryAfter: 0 };
      }

      return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
    }

    const count = data.request_count;
    const resetAtDate = new Date(data.reset_at);
    const msRemaining = resetAtDate.getTime() - now.getTime();
    const retryAfter = Math.ceil(msRemaining / 1000);

    if (count >= maxRequests) {
      console.warn(`[Suspicious Traffic / Rate Limit Triggered] IP: ${ip}, Endpoint: ${endpoint}, Current Count: ${count}, Limit: ${maxRequests}, Cooldown: ${retryAfter}s`);
      return { allowed: false, remaining: 0, retryAfter };
    }

    // 4. Update existing entry
    const { error: updateError } = await supabase
      .from("rate_limits")
      .update({ request_count: count + 1 })
      .eq("id", data.id);

    if (updateError) {
      console.error(`Rate limit update error for ${ip}/${endpoint}:`, updateError);
      return { allowed: true, remaining: 1, retryAfter: 0 };
    }

    return { allowed: true, remaining: maxRequests - (count + 1), retryAfter: 0 };
  } catch (err) {
    console.error("Rate limiting exception:", err);
    return { allowed: true, remaining: 1, retryAfter: 0 };
  }
}
