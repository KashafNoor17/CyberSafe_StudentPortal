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
  const allowedOrigin = origin && allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, ''))) 
    ? origin 
    : (origin || allowedOrigins[0]);
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

// Knowledge base for common cybersecurity questions
const knowledgeBase: Record<string, string> = {
  // Password Security
  "strong password": `A strong password has these characteristics:

🔐 **Length**: At least 12-16 characters
🔤 **Variety**: Mix uppercase, lowercase, numbers, and symbols
🚫 **No personal info**: Avoid names, birthdays, or common words
🎲 **Unpredictable**: Random combinations are best

**Example of a weak password**: password123
**Example of a strong password**: K9$mP2@xL!nR7qW

💡 **Pro tip**: Use a passphrase like "Purple-Elephant-Dances-Freely-42!" - it's long, memorable, and secure!`,

  "password manager": `Password managers are secure digital vaults that:

🔒 **Store passwords**: Keep all your passwords encrypted in one place
🔑 **Generate passwords**: Create strong, unique passwords automatically
📱 **Auto-fill**: Fill in login forms so you don't need to type
🔄 **Sync**: Access passwords across all your devices

**Popular options**: Bitwarden (free), 1Password, LastPass, Dashlane

**How they work**:
1. You create ONE master password (make it strong!)
2. The manager encrypts all your other passwords
3. Only you can unlock it with your master password

💡 This means you only need to remember ONE password instead of dozens!`,

  "two-factor authentication": `Two-Factor Authentication (2FA) adds an extra layer of security:

🔐 **What it is**: Requires TWO things to log in:
1. Something you **know** (password)
2. Something you **have** (phone, security key)

**Common 2FA methods**:
📱 SMS codes (text messages)
📲 Authenticator apps (Google Authenticator, Authy)
🔑 Hardware keys (YubiKey)
📧 Email codes

**Why use it?**
Even if someone steals your password, they can't log in without your second factor!

💡 **Tip**: Use authenticator apps over SMS when possible - they're more secure.`,

  // Phishing
  "phishing email": `Here's how to spot a phishing email:

🚨 **Red flags to watch for**:
• Urgent language ("Act now!", "Account suspended!")
• Sender email doesn't match the company
• Generic greetings ("Dear Customer" instead of your name)
• Spelling and grammar mistakes
• Suspicious links (hover to preview before clicking)
• Requests for personal information
• Unexpected attachments

**What to do if you receive one**:
1. ❌ Don't click any links
2. ❌ Don't download attachments
3. ✅ Report it to your IT team or email provider
4. ✅ Delete the email

💡 When in doubt, go directly to the company's official website instead of clicking links!`,

  "report phishing": `Here's how to report a phishing attempt:

📧 **For email phishing**:
1. Forward to your company's IT security team
2. Report to the impersonated company (e.g., security@paypal.com)
3. Forward to reportphishing@apwg.org
4. Mark as spam/phishing in your email client

📱 **For SMS phishing (smishing)**:
• Forward the message to 7726 (SPAM)
• Report to the FTC at reportfraud.ftc.gov

🌐 **For website phishing**:
• Report to Google Safe Browsing: safebrowsing.google.com/safebrowsing/report_phish/

💡 Reporting helps protect others from the same attack!`,

  "common scams": `Watch out for these common online scams:

💰 **Financial scams**:
• Fake lottery/prize winnings
• Investment "opportunities" with guaranteed returns
• Romance scams on dating sites

📧 **Email/Message scams**:
• CEO fraud (fake urgent requests from "your boss")
• Package delivery notifications
• Tax refund scams

🛒 **Shopping scams**:
• Too-good-to-be-true deals
• Fake online stores
• Non-delivery of goods

💻 **Tech scams**:
• Fake virus warnings
• Tech support calls
• Ransomware attacks

**Golden rule**: If it seems too good to be true, it probably is!`,

  // Social Media Safety
  "privacy settings": `Social media privacy settings are crucial because:

🔒 **They control who sees your**:
• Posts and photos
• Personal information
• Friends list
• Location data

**Essential settings to check**:
1. **Profile visibility**: Public vs. Friends only
2. **Post audience**: Who can see your posts
3. **Tagging**: Who can tag you in photos
4. **Location**: Disable location sharing
5. **Search**: Who can find you

**Platform-specific tips**:
• **Facebook**: Review "Privacy Checkup" tool
• **Instagram**: Switch to private account
• **Twitter/X**: Protect your tweets

💡 Review your settings every few months as platforms often change defaults!`,

  "location sharing": `Be careful with location sharing:

⚠️ **Risks of sharing location**:
• Reveals your home address patterns
• Shows when you're away (vacation = empty house)
• Enables stalking or targeted attacks
• Creates a detailed profile of your habits

**Best practices**:
1. 📍 Disable GPS on photos before posting
2. 🏠 Never tag your home location
3. ✈️ Post vacation photos AFTER you return
4. 📱 Review app location permissions regularly
5. 🗺️ Turn off "check-in" features

**Check these settings**:
• Phone: Settings → Privacy → Location Services
• Social media: Disable location tagging in each app

💡 Your location data can reveal more about you than you think!`,

  "friend requests": `Handle friend requests safely:

🔍 **Before accepting, check**:
• Do you know this person in real life?
• Is their profile new or suspicious?
• Do they have mutual friends you trust?
• Does their profile look genuine?

🚨 **Warning signs of fake accounts**:
• Very few posts or photos
• Recently created account
• Stolen or stock photos
• No mutual connections
• Too-good-to-be-true profile

**What to do**:
✅ Only accept people you actually know
✅ Ask mutual friends if they know the person
❌ Decline suspicious requests
❌ Don't feel obligated to accept everyone

💡 Quality over quantity - a smaller, trusted network is safer!`,

  // General Security
  "vpn": `A VPN (Virtual Private Network) explained:

🔒 **What it does**:
• Encrypts your internet traffic
• Hides your IP address
• Makes public WiFi safer
• Can bypass geographic restrictions

**When to use a VPN**:
✅ Public WiFi (coffee shops, airports)
✅ When privacy is important
✅ Accessing sensitive accounts on shared networks

**When you might not need one**:
• Home network (usually safe)
• HTTPS websites already encrypt data

**Popular VPN services**:
• NordVPN, ExpressVPN (paid)
• ProtonVPN (free tier available)

💡 A VPN adds privacy, but it's not a complete security solution. Still use strong passwords and be careful what you click!`,

  "personal information": `Information you should NEVER share online:

🚫 **Never share publicly**:
• Social Security Number
• Full birth date
• Home address
• Phone number
• Financial information (bank accounts, credit cards)
• Passwords (obviously!)
• Mother's maiden name (security question!)
• Travel plans (especially departure dates)

⚠️ **Be careful with**:
• Employer details
• Daily routines
• Photos showing your location
• Children's information

**Why it matters**:
Criminals can use this info for:
• Identity theft
• Account takeover
• Physical crimes
• Social engineering attacks

💡 Before posting, ask: "Would I put this on a billboard?"`,

  "update passwords": `How often should you update passwords?

📅 **Current recommendations**:

**Change immediately if**:
• You suspect a breach
• You've shared it accidentally
• The service announces a data leak
• You used a public/shared computer

**Change periodically** (every 6-12 months) for:
• Banking and financial accounts
• Primary email
• Social media

**Modern approach**:
Rather than frequent changes, focus on:
1. 🔐 Using unique passwords for each account
2. 📱 Enabling 2FA everywhere
3. 🔑 Using a password manager
4. 👀 Monitoring for breaches (haveibeenpwned.com)

💡 A strong, unique password you keep is better than a weak password you change often!`,

  "roadmap": `Here's your CyberSafe learning roadmap:

🗺️ **Recommended Learning Path:**

**Step 1 — Password Security (Start Here)**
- Learn why passwords fail and how attacks work
- Complete the interactive password strength exercise
- Pass the Password Security quiz (score ≥70%)
- Badge unlocked: Password Master 🔐

**Step 2 — Phishing Detection**
- Learn to identify fake emails and malicious links
- Complete the email classifier exercise
- Pass the Phishing Detection quiz
- Badge unlocked: Phishing Detector 🎣

**Step 3 — Social Media Safety**
- Learn privacy settings and oversharing risks
- Complete the privacy simulator exercise
- Pass the Social Media Safety quiz
- Badge unlocked: Cyber Defender 🛡️

**Final Step — Get Certified**
- Complete all 3 modules and quizzes
- Generate your verified digital certificate
- Badge unlocked: Cyber Champion 🎓

💡 **Tips:**
- Each module takes about 20-30 minutes
- You can pause and resume anytime
- Aim for 100% on quizzes for bonus points
- Check the leaderboard to track your ranking`
};

// Find matching knowledge base response
function findKnowledgeBaseResponse(query: string): string | null {
  const lowerQuery = query.toLowerCase();
  
  // Direct keyword matching
  const keywordMap: Record<string, string[]> = {
    "strong password": ["strong password", "good password", "secure password", "password strong", "make password"],
    "password manager": ["password manager", "store passwords", "remember password"],
    "two-factor authentication": ["two-factor", "2fa", "two factor", "mfa", "multi-factor", "authentication app"],
    "phishing email": ["phishing email", "spot phishing", "fake email", "suspicious email", "phishing attack"],
    "report phishing": ["report phishing", "report scam", "report spam"],
    "common scams": ["common scam", "online scam", "type of scam", "scam example"],
    "privacy settings": ["privacy setting", "privacy important", "social media privacy"],
    "location sharing": ["location sharing", "share location", "gps", "location data"],
    "friend requests": ["friend request", "accept friend", "fake profile", "fake account"],
    "vpn": ["vpn", "virtual private network", "public wifi"],
    "personal information": ["personal information", "never share", "share online", "private information"],
    "update passwords": ["update password", "change password", "how often password"],
    "roadmap": ["roadmap", "learning path", "where to start", "how to begin", "what to do first", "get started"]
  };

  for (const [topic, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => lowerQuery.includes(kw))) {
      return knowledgeBase[topic];
    }
  }

  return null;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Server-side rate limit check (10 requests per 5 minutes)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed, retryAfter } = await checkRateLimit(ip, "ai-chat", 10, 300);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: `Too many requests. Please try again in ${retryAfter} seconds.` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(retryAfter) } }
      );
    }

    // Verify user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, context } = await req.json();
    
    // Validate messages input
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cap per-message and context length to prevent token exhaustion
    const MAX_MSG_LEN = 2000;
    const MAX_CTX_LEN = 500;
    const sanitizedMessages = messages
      .filter((m: { role?: string; content?: unknown }) => typeof m?.content === "string")
      .map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content.slice(0, MAX_MSG_LEN),
      }))
      .slice(-10);
    const safeContext = typeof context === "string" ? context.slice(0, MAX_CTX_LEN) : "";

    // Get the latest user message
    const latestUserMessage = sanitizedMessages.filter((m: { role: string }) => m.role === 'user').pop();
    const userQuery = latestUserMessage?.content || '';

    // Try knowledge base first for quick, consistent responses
    const knowledgeResponse = findKnowledgeBaseResponse(userQuery);
    if (knowledgeResponse) {
      console.log("Returning knowledge base response for query:", userQuery.substring(0, 50));
      return new Response(
        JSON.stringify({ content: knowledgeResponse }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user progress for personalized tutoring
    let userProgressContext = '';
    try {
      const [profileResult, completionsResult, quizResult] = await Promise.all([
        supabase.from('profiles').select('level, total_points, cyber_score').eq('user_id', user.id).maybeSingle(),
        supabase.from('module_completions').select('module_id').eq('user_id', user.id),
        supabase.from('user_quiz_answers').select('is_correct').eq('user_id', user.id),
      ]);

      const profile = profileResult.data;
      const completedCount = (completionsResult.data || []).length;
      const answers = quizResult.data || [];
      const accuracy = answers.length > 0
        ? Math.round((answers.filter((a: any) => a.is_correct).length / answers.length) * 100)
        : 0;

      userProgressContext = `\n\nUser profile: Level ${profile?.level || 'Beginner'}, ${profile?.total_points || 0} points, ${completedCount} modules completed, ${accuracy}% quiz accuracy. Adapt your response complexity to their level.`;
    } catch {
      // Silent fail — proceed without personalization
    }

    // Fall back to AI for complex questions
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const contextInfo = safeContext ? `\n\nThe user is currently learning about: ${safeContext}. Tailor your responses to be relevant to this topic when applicable.` : '';

    const systemPrompt = `You are CyberSafe AI, a friendly and knowledgeable cybersecurity assistant for the CyberSafe Student Portal. Your role is to:

1. Answer questions about cybersecurity topics (phishing, malware, passwords, social engineering, etc.)
2. Help users navigate the platform (modules, quizzes, certificates, etc.)
3. Provide security tips and best practices
4. Explain technical concepts in simple, student-friendly language
5. Offer personalized learning advice based on the user's progress

Guidelines:
- Keep responses concise and educational (under 300 words)
- Use emojis and formatting (bold, bullet points) for readability
- Be encouraging and supportive
- If asked about non-cybersecurity topics, politely redirect to cybersecurity
- Never provide actual hacking instructions or malicious advice
- Recommend platform features when relevant (e.g., "Try our Password Checker tool!")
- When the user asks for help or seems stuck, offer targeted hints rather than full answers
- Adapt explanation complexity to the user's level

Platform features to reference:
- Learning Modules: Password Security, Phishing Detection, Social Media Safety
- Phishing Detection Quiz
- Password Strength Checker (/password-checker)
- Weekly Security Tips (/tips)
- Community Forums (/community)
- Leaderboard & Badges
- Certificate of Completion
- Spaced Repetition Review Queue
- AI Recommendations on Dashboard${contextInfo}${userProgressContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...sanitizedMessages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ content }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat error:", error);
    
    // Graceful fallback message
    const fallbackMessage = `I'm still learning about that topic. Here are some things you can try:

🔍 **Rephrase your question** - Try asking in a different way
📚 **Check our modules** - Visit the Learning hub for structured lessons
💬 **Ask the community** - Post your question in the Community Forums
🔧 **Try our tools** - Use the Password Checker or take the Phishing Quiz

Is there something specific about cybersecurity I can help you with?`;

    return new Response(
      JSON.stringify({ content: fallbackMessage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
