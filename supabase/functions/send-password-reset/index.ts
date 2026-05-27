import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Allowed origins for CORS
const allowedOrigins = [
  'https://cybersafe-edu.lovable.app',
  'https://id-preview--f8172b8a-dce7-4f81-9ee6-f01fa9dc0397.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, ''))) 
    ? origin 
    : (origin || allowedOrigins[0]);
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Limit email length
    if (email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Email address is too long" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("Processing password reset for:", normalizedEmail);

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Rate limiting: max 3 requests per email per hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count } = await supabaseAdmin
      .from('password_reset_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('email', normalizedEmail)
      .gte('created_at', oneHourAgo);

    if ((count ?? 0) >= 3) {
      // Silent rate limit — return generic success to prevent enumeration
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a reset link has been sent." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log this attempt
    await supabaseAdmin.from('password_reset_attempts').insert({ email: normalizedEmail });

    // Check if user exists
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("name, email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    // Always return success to prevent email enumeration
    if (!profile) {
      console.log("No user found for email, returning generic success");
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a reset link has been sent." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate password reset link using Supabase Auth
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: normalizedEmail,
      options: {
        redirectTo: "https://cybersafe-edu.lovable.app/auth?mode=reset",
      },
    });

    if (resetError) {
      console.error("Error generating reset link:", resetError);
      throw new Error("Failed to generate reset link");
    }

    const resetUrl = resetData.properties?.action_link;
    const userName = profile.name || "Student";

    // Send email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "CyberSafe <noreply@resend.dev>",
      to: [email],
      subject: "Reset Your CyberSafe Password",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; border: 1px solid #00d4ff30; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #00d4ff20;">
              <div style="display: inline-block; background: linear-gradient(135deg, #00d4ff20 0%, #00ff8810 100%); padding: 16px; border-radius: 16px; margin-bottom: 20px;">
                <span style="font-size: 32px;">🛡️</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Password Reset Request</h1>
              <p style="margin: 10px 0 0; color: #00d4ff; font-size: 14px;">CyberSafe Student Portal</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
                Hi <strong style="color: #00d4ff;">${userName}</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #a0a0a0; font-size: 15px; line-height: 1.6;">
                We received a request to reset your password for your CyberSafe account. Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #00d4ff 0%, #00ff88 100%); color: #0a0a0f; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 20px #00d4ff40;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: #a0a0a0; font-size: 14px; line-height: 1.6;">
                This link will expire in <strong style="color: #ffa500;">1 hour</strong> for security reasons.
              </p>
              
              <div style="background: #ffffff08; border: 1px solid #ffa50030; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; color: #ffa500; font-size: 13px; line-height: 1.5;">
                  ⚠️ If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>
              </div>
              
              <p style="margin: 20px 0 0; color: #666666; font-size: 12px; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #00d4ff; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: #00000030; border-top: 1px solid #00d4ff20; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} CyberSafe Student Portal. All rights reserved.
              </p>
              <p style="margin: 0; color: #444444; font-size: 11px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error("Failed to send reset email");
    }

    console.log("Password reset email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, message: "Password reset email sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);