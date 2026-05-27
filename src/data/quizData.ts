export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  /** Optional scenario/email content for phishing-style questions */
  scenario?: string;
}

export interface QuizDefinition {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: QuizQuestion[];
  passingScore: number; // percentage 0-100
}

export const QUIZZES: QuizDefinition[] = [
  // ── 1. Password Security ──────────────────────────────
  {
    id: 'password-security',
    title: 'Password Security Quiz',
    description: 'Test your knowledge of strong password practices and authentication.',
    icon: '🔐',
    difficulty: 'Beginner',
    passingScore: 70,
    questions: [
      {
        id: 'pw-1',
        question: 'What is the minimum recommended length for a strong password?',
        options: ['8 characters', '10 characters', '12 characters', '14 characters'],
        correctAnswer: '12 characters',
        explanation: 'Security experts recommend at least 12 characters. Modern computing power can crack shorter passwords in hours.',
      },
      {
        id: 'pw-2',
        question: 'Which is the strongest password?',
        options: ['password123', 'P@ssw0rd', 'correct-horse-battery-staple', 'admin2024'],
        correctAnswer: 'correct-horse-battery-staple',
        explanation: 'Long passphrases are harder to crack than short, complex passwords. Length beats complexity.',
      },
      {
        id: 'pw-3',
        question: 'What is a password manager?',
        options: ['A tool that securely stores and generates passwords', 'A type of virus', 'A built-in browser feature only', 'A hacker tool'],
        correctAnswer: 'A tool that securely stores and generates passwords',
        explanation: 'Password managers securely store all your passwords behind one master password and can generate strong unique passwords.',
      },
      {
        id: 'pw-4',
        question: 'What is two-factor authentication (2FA)?',
        options: ['Using two passwords', 'Something you know + something you have', 'Two usernames', 'Logging in twice'],
        correctAnswer: 'Something you know + something you have',
        explanation: '2FA combines something you know (password) with something you have (phone/token) for an extra layer of security.',
      },
      {
        id: 'pw-5',
        question: 'How often should you change your passwords?',
        options: ['Every 30 days', 'Every 90 days', 'Only after a known breach', 'Never'],
        correctAnswer: 'Only after a known breach',
        explanation: 'Modern guidance (NIST) recommends changing passwords only when compromised. Frequent changes lead to weaker passwords.',
      },
      {
        id: 'pw-6',
        question: 'What should you never do with passwords?',
        options: ['Use a password manager', 'Share them with anyone', 'Make them long', 'Use different ones per site'],
        correctAnswer: 'Share them with anyone',
        explanation: 'Passwords should always remain private. Even trusted individuals should not have your credentials.',
      },
    ],
  },

  // ── 2. Phishing Detection ─────────────────────────────
  {
    id: 'phishing-detection',
    title: 'Phishing Detection Quiz',
    description: 'Can you spot phishing attempts in emails and messages?',
    icon: '🎣',
    difficulty: 'Beginner',
    passingScore: 70,
    questions: [
      {
        id: 'ph-1',
        question: 'Is this email legitimate or a phishing attempt?',
        scenario: 'From: security@paypa1.com\nSubject: URGENT: Your account will be suspended!\n\nDear Customer,\n\nWe detected suspicious activity on your account. Click here immediately to verify your identity:\nhttp://paypa1-verify.com/secure\n\nIf you don\'t act within 24 hours, your account will be permanently suspended.\n\nPayPal Security Team',
        options: ['Legitimate email', 'Phishing attempt'],
        correctAnswer: 'Phishing attempt',
        explanation: 'Notice "paypa1" uses the number 1 instead of lowercase L. The suspicious domain, urgent language, and threatening tone are classic phishing indicators.',
      },
      {
        id: 'ph-2',
        question: 'Is this email legitimate or a phishing attempt?',
        scenario: 'From: no-reply@paypal.com\nSubject: Recent login from new device\n\nHi there,\n\nWe noticed a login to your account from Chrome on Windows 11.\nLocation: New York, US\n\nIf this was you, no action is needed.\nIf you don\'t recognize this activity, please visit paypal.com to secure your account.\n\nThanks,\nPayPal',
        options: ['Legitimate email', 'Phishing attempt'],
        correctAnswer: 'Legitimate email',
        explanation: 'Official domain, no urgent action required, informational tone, and directs to main site rather than a suspicious link.',
      },
      {
        id: 'ph-3',
        question: 'Is this email legitimate or a phishing attempt?',
        scenario: 'From: support@amaz0n-support.com\nSubject: Your order cannot be shipped\n\nDear Valued Customer,\n\nYour recent order #392-4821 cannot be shipped.\nPlease reply with your password to confirm your identity.\n\nAmazon Customer Support',
        options: ['Legitimate email', 'Phishing attempt'],
        correctAnswer: 'Phishing attempt',
        explanation: '"amaz0n" uses zero instead of O. Legitimate companies never ask for passwords via email. The unofficial domain is a red flag.',
      },
      {
        id: 'ph-4',
        question: 'Which is the biggest red flag in a suspicious email?',
        options: ['The email has a company logo', 'It asks you to click a link urgently', 'It was sent during business hours', 'It includes your name'],
        correctAnswer: 'It asks you to click a link urgently',
        explanation: 'Urgency pressure to click links is the most common phishing tactic. Logos can be copied and names can be found publicly.',
      },
      {
        id: 'ph-5',
        question: 'What should you do if you suspect an email is phishing?',
        options: ['Reply asking if it\'s real', 'Click the link to check', 'Report it and delete it', 'Forward it to friends'],
        correctAnswer: 'Report it and delete it',
        explanation: 'Never interact with suspicious emails. Report to your IT team or email provider, then delete it.',
      },
      {
        id: 'ph-6',
        question: 'Which URL looks most suspicious?',
        options: ['https://accounts.google.com/signin', 'https://google-account-verify.com/login', 'https://mail.google.com', 'https://www.google.com'],
        correctAnswer: 'https://google-account-verify.com/login',
        explanation: 'This is not a Google domain. Phishing sites often use lookalike domains with extra words to seem legitimate.',
      },
      {
        id: 'ph-7',
        question: 'What type of phishing targets specific individuals?',
        options: ['Bulk phishing', 'Spear phishing', 'Whale phishing', 'Clone phishing'],
        correctAnswer: 'Spear phishing',
        explanation: 'Spear phishing targets specific people using personal information to craft convincing messages.',
      },
      {
        id: 'ph-8',
        question: 'How can you verify a suspicious email from your bank?',
        options: ['Click the link in the email', 'Call the number in the email', 'Call your bank using the number on their official website', 'Reply to the email'],
        correctAnswer: 'Call your bank using the number on their official website',
        explanation: 'Always verify through official channels, not through any contact information provided in the suspicious email.',
      },
    ],
  },

  // ── 3. Social Media Safety ────────────────────────────
  {
    id: 'social-media-safety',
    title: 'Social Media Safety Quiz',
    description: 'Learn how to protect your privacy on social platforms.',
    icon: '👤',
    difficulty: 'Beginner',
    passingScore: 70,
    questions: [
      {
        id: 'sm-1',
        question: 'When should you post vacation photos?',
        options: ['During your vacation', 'After returning home', 'Before leaving', 'Never'],
        correctAnswer: 'After returning home',
        explanation: 'Posting during a vacation tells thieves your home is empty. Wait until you return.',
      },
      {
        id: 'sm-2',
        question: 'Should you accept friend requests from strangers?',
        options: ['Yes, always', 'No, never', 'Only if you have mutual friends', 'Only if their profile looks real'],
        correctAnswer: 'Only if you have mutual friends',
        explanation: 'Verify identity through mutual connections before accepting. Fake profiles are common attack vectors.',
      },
      {
        id: 'sm-3',
        question: 'What location sharing setting is safest?',
        options: ['Always on', 'Disabled / Never', 'Only while using the app', 'Ask each time'],
        correctAnswer: 'Disabled / Never',
        explanation: 'Disable location sharing by default. It can reveal your home, work, and daily patterns to anyone.',
      },
      {
        id: 'sm-4',
        question: 'Which information should be kept private on social media?',
        options: ['Your birthday', 'Your email address', 'Your home address', 'All of the above'],
        correctAnswer: 'All of the above',
        explanation: 'Personal details like birthdays, emails, and addresses can be used for identity theft and social engineering.',
      },
      {
        id: 'sm-5',
        question: 'What are app permissions?',
        options: ['App features you unlock', 'Requests for access to your data', 'Payment methods', 'App settings'],
        correctAnswer: 'Requests for access to your data',
        explanation: 'Apps request permission to access your camera, contacts, location, etc. Only grant what is necessary.',
      },
      {
        id: 'sm-6',
        question: 'How can you spot a fake social media profile?',
        options: ['It has many followers', 'It has recent photos', 'It has no mutual friends and was recently created', 'It has a verified badge'],
        correctAnswer: 'It has no mutual friends and was recently created',
        explanation: 'Fake profiles typically have no real connections, stock photos, and very recent creation dates.',
      },
    ],
  },

  // ── 4. Network Security ───────────────────────────────
  {
    id: 'network-security',
    title: 'Network Security Quiz',
    description: 'Test your understanding of network protection fundamentals.',
    icon: '🌐',
    difficulty: 'Intermediate',
    passingScore: 70,
    questions: [
      {
        id: 'ns-1',
        question: 'What is a firewall?',
        options: ['A physical wall', 'Software or hardware that filters network traffic', 'A type of virus', 'A network cable'],
        correctAnswer: 'Software or hardware that filters network traffic',
        explanation: 'Firewalls monitor and control incoming/outgoing network traffic based on security rules.',
      },
      {
        id: 'ns-2',
        question: 'What does VPN stand for?',
        options: ['Virtual Private Network', 'Very Protected Network', 'Virtual Public Network', 'Verified Private Network'],
        correctAnswer: 'Virtual Private Network',
        explanation: 'A VPN creates an encrypted tunnel for your internet traffic, protecting your data from eavesdroppers.',
      },
      {
        id: 'ns-3',
        question: 'Is public WiFi safe for online banking?',
        options: ['Yes, always safe', 'No, never safe', 'Safe if using a VPN', 'Safe in incognito mode'],
        correctAnswer: 'Safe if using a VPN',
        explanation: 'A VPN encrypts your traffic even on public networks. Without one, attackers can intercept your data.',
      },
      {
        id: 'ns-4',
        question: 'What is HTTPS?',
        options: ['An encrypted web protocol', 'A hacker tool', 'A type of virus', 'A server name'],
        correctAnswer: 'An encrypted web protocol',
        explanation: 'HTTPS encrypts data between your browser and the website, preventing eavesdropping.',
      },
      {
        id: 'ns-5',
        question: 'What is a port scan?',
        options: ['Checking for open network ports', 'A physical inspection', 'A network speed test', 'A virus scan'],
        correctAnswer: 'Checking for open network ports',
        explanation: 'Port scans identify open ports on a system. Attackers use them to find vulnerabilities; defenders use them for auditing.',
      },
      {
        id: 'ns-6',
        question: 'What is WPA3?',
        options: ['A WiFi password', 'The latest WiFi encryption standard', 'A virus type', 'A router brand'],
        correctAnswer: 'The latest WiFi encryption standard',
        explanation: 'WPA3 is the most current WiFi security protocol, offering stronger encryption than WPA2.',
      },
      {
        id: 'ns-7',
        question: 'Should you change your router\'s default password?',
        options: ['Yes, immediately', 'No, defaults are secure', 'Only if you suspect hacking', 'It doesn\'t matter'],
        correctAnswer: 'Yes, immediately',
        explanation: 'Default router passwords are publicly available. Changing them is one of the first steps in home network security.',
      },
      {
        id: 'ns-8',
        question: 'What is DNS?',
        options: ['Domain Name System', 'Direct Network Service', 'Data Name Server', 'Digital Network System'],
        correctAnswer: 'Domain Name System',
        explanation: 'DNS translates human-readable domain names (like google.com) into IP addresses that computers use.',
      },
      {
        id: 'ns-9',
        question: 'What is a man-in-the-middle attack?',
        options: ['A physical interception', 'An attacker intercepting network communication', 'An email phishing attack', 'A brute-force password attack'],
        correctAnswer: 'An attacker intercepting network communication',
        explanation: 'In MITM attacks, the attacker secretly relays and possibly alters communication between two parties.',
      },
      {
        id: 'ns-10',
        question: 'What is network segmentation?',
        options: ['Dividing a network into isolated sections', 'A speed-boosting technique', 'A type of virus protection', 'A data backup method'],
        correctAnswer: 'Dividing a network into isolated sections',
        explanation: 'Segmentation limits the blast radius of an attack by isolating parts of the network from each other.',
      },
    ],
  },

  // ── 5. Malware Types & Protection ─────────────────────
  {
    id: 'malware-protection',
    title: 'Malware Identification Quiz',
    description: 'Identify different types of malware and how to protect against them.',
    icon: '🦠',
    difficulty: 'Intermediate',
    passingScore: 70,
    questions: [
      {
        id: 'mw-1',
        question: 'What is ransomware?',
        options: ['Software that speeds up your computer', 'Malware that encrypts files and demands payment', 'A type of antivirus', 'An ad blocker'],
        correctAnswer: 'Malware that encrypts files and demands payment',
        explanation: 'Ransomware locks your files with encryption and demands money (usually cryptocurrency) for the decryption key.',
      },
      {
        id: 'mw-2',
        question: 'What is a Trojan horse in cybersecurity?',
        options: ['A strong firewall', 'Malware disguised as legitimate software', 'A type of encryption', 'A network protocol'],
        correctAnswer: 'Malware disguised as legitimate software',
        explanation: 'Trojans appear to be useful programs but contain hidden malicious code that runs when you install them.',
      },
      {
        id: 'mw-3',
        question: 'How does a computer worm spread?',
        options: ['Through email attachments only', 'By self-replicating across networks', 'Only through USB drives', 'Through website ads'],
        correctAnswer: 'By self-replicating across networks',
        explanation: 'Worms can spread automatically across networks without user interaction, making them particularly dangerous.',
      },
      {
        id: 'mw-4',
        question: 'What is the best protection against malware?',
        options: ['Using only Apple devices', 'Keeping software updated and using antivirus', 'Never going online', 'Using incognito mode'],
        correctAnswer: 'Keeping software updated and using antivirus',
        explanation: 'Regular updates patch known vulnerabilities. Combined with antivirus software, this provides strong protection.',
      },
      {
        id: 'mw-5',
        question: 'What is spyware?',
        options: ['Software that protects privacy', 'Software that secretly monitors user activity', 'A type of firewall', 'An encryption tool'],
        correctAnswer: 'Software that secretly monitors user activity',
        explanation: 'Spyware silently collects information like keystrokes, browsing habits, and personal data without consent.',
      },
      {
        id: 'mw-6',
        question: 'What is a rootkit?',
        options: ['A gardening app', 'Malware that hides deep in the OS to avoid detection', 'A system repair tool', 'A type of antivirus'],
        correctAnswer: 'Malware that hides deep in the OS to avoid detection',
        explanation: 'Rootkits embed themselves at the operating system level, making them extremely difficult to detect and remove.',
      },
      {
        id: 'mw-7',
        question: 'What should you do if you suspect malware on your device?',
        options: ['Ignore it', 'Disconnect from the network and run a full scan', 'Restart the computer', 'Delete your browser'],
        correctAnswer: 'Disconnect from the network and run a full scan',
        explanation: 'Disconnecting prevents the malware from spreading or communicating with its command server. Then scan and clean.',
      },
    ],
  },

  // ── 6. Cloud Security ─────────────────────────────────
  {
    id: 'cloud-security',
    title: 'Cloud Security Quiz',
    description: 'Understand cloud security principles and best practices.',
    icon: '☁️',
    difficulty: 'Intermediate',
    passingScore: 70,
    questions: [
      {
        id: 'cs-1',
        question: 'What is the shared responsibility model in cloud security?',
        options: ['The cloud provider handles everything', 'Security is split between provider and customer', 'The customer handles everything', 'Neither party is responsible'],
        correctAnswer: 'Security is split between provider and customer',
        explanation: 'Cloud providers secure the infrastructure; customers secure their data, access controls, and configurations.',
      },
      {
        id: 'cs-2',
        question: 'What is data encryption at rest?',
        options: ['Encrypting data while it\'s being sent', 'Encrypting stored data', 'Deleting old data', 'Compressing files'],
        correctAnswer: 'Encrypting stored data',
        explanation: 'Encryption at rest protects data stored on disks, databases, or backups from unauthorized access.',
      },
      {
        id: 'cs-3',
        question: 'What is multi-tenancy in cloud computing?',
        options: ['Multiple users sharing the same physical infrastructure', 'Having multiple cloud providers', 'Renting multiple offices', 'Using multiple passwords'],
        correctAnswer: 'Multiple users sharing the same physical infrastructure',
        explanation: 'In multi-tenant environments, proper isolation is critical to prevent data leakage between tenants.',
      },
      {
        id: 'cs-4',
        question: 'What is the principle of least privilege?',
        options: ['Giving everyone admin access', 'Granting only the minimum access needed', 'Removing all access', 'Sharing passwords'],
        correctAnswer: 'Granting only the minimum access needed',
        explanation: 'Users should only have the permissions necessary for their specific role — no more, no less.',
      },
      {
        id: 'cs-5',
        question: 'What is a cloud access security broker (CASB)?',
        options: ['A person who sells cloud services', 'A security tool between users and cloud services', 'A type of firewall', 'A cloud storage format'],
        correctAnswer: 'A security tool between users and cloud services',
        explanation: 'CASBs enforce security policies, provide visibility, and protect data as it moves to and from the cloud.',
      },
      {
        id: 'cs-6',
        question: 'Why is MFA important for cloud accounts?',
        options: ['It\'s not important', 'It adds an extra verification step beyond passwords', 'It makes login faster', 'It reduces costs'],
        correctAnswer: 'It adds an extra verification step beyond passwords',
        explanation: 'MFA prevents unauthorized access even if passwords are compromised, which is critical for cloud resources.',
      },
      {
        id: 'cs-7',
        question: 'What is a misconfigured cloud storage bucket risk?',
        options: ['Slower performance', 'Public exposure of sensitive data', 'Higher costs', 'Better accessibility'],
        correctAnswer: 'Public exposure of sensitive data',
        explanation: 'Misconfigured storage (like open S3 buckets) is one of the most common causes of cloud data breaches.',
      },
      {
        id: 'cs-8',
        question: 'What does "zero trust" mean in cloud security?',
        options: ['Trust no one — verify every access request', 'Don\'t use the cloud', 'Only trust internal users', 'Use zero passwords'],
        correctAnswer: 'Trust no one — verify every access request',
        explanation: 'Zero trust assumes no user or device is inherently trustworthy, requiring continuous verification.',
      },
    ],
  },

  // ── 7. Mobile Device Security ─────────────────────────
  {
    id: 'mobile-security',
    title: 'Mobile Security Quiz',
    description: 'Learn how to keep your mobile devices secure.',
    icon: '📱',
    difficulty: 'Beginner',
    passingScore: 70,
    questions: [
      {
        id: 'ms-1',
        question: 'What is the safest way to unlock your phone?',
        options: ['No lock screen', '4-digit PIN', 'Biometric (fingerprint/face) + PIN', 'Pattern lock'],
        correctAnswer: 'Biometric (fingerprint/face) + PIN',
        explanation: 'Biometrics combined with a PIN provides the strongest mobile device authentication.',
      },
      {
        id: 'ms-2',
        question: 'Should you install apps from unknown sources?',
        options: ['Yes, for more choices', 'No, only use official app stores', 'Only if friends recommend them', 'It doesn\'t matter'],
        correctAnswer: 'No, only use official app stores',
        explanation: 'Official stores have security checks. Sideloaded apps may contain malware.',
      },
      {
        id: 'ms-3',
        question: 'What should you do if your phone is lost or stolen?',
        options: ['Wait for someone to return it', 'Remotely wipe it', 'Buy a new phone', 'Post about it on social media'],
        correctAnswer: 'Remotely wipe it',
        explanation: 'Remote wipe erases all data, preventing unauthorized access to your personal information.',
      },
      {
        id: 'ms-4',
        question: 'Why are OS updates important for mobile security?',
        options: ['New emojis', 'They patch security vulnerabilities', 'Faster performance only', 'They\'re not important'],
        correctAnswer: 'They patch security vulnerabilities',
        explanation: 'Updates fix known security holes that attackers actively exploit. Always keep your OS current.',
      },
      {
        id: 'ms-5',
        question: 'Is public charging (juice jacking) a real risk?',
        options: ['No, it\'s a myth', 'Yes, malware can transfer through USB', 'Only with old phones', 'Only on Android'],
        correctAnswer: 'Yes, malware can transfer through USB',
        explanation: 'Compromised public charging stations can install malware. Use a charge-only cable or power bank instead.',
      },
    ],
  },

  // ── 8. Identity Theft Protection ──────────────────────
  {
    id: 'identity-theft',
    title: 'Identity Protection Quiz',
    description: 'Learn to protect yourself from identity theft.',
    icon: '🆔',
    difficulty: 'Beginner',
    passingScore: 70,
    questions: [
      {
        id: 'id-1',
        question: 'What is the most common method of identity theft?',
        options: ['In-person theft', 'Data breaches and phishing', 'Mail theft', 'Dumpster diving'],
        correctAnswer: 'Data breaches and phishing',
        explanation: 'Digital methods like data breaches and phishing emails account for the majority of identity theft cases.',
      },
      {
        id: 'id-2',
        question: 'What is a credit freeze?',
        options: ['Closing your bank account', 'Preventing new credit accounts from being opened', 'Freezing your credit card', 'Stopping all spending'],
        correctAnswer: 'Preventing new credit accounts from being opened',
        explanation: 'A credit freeze blocks lenders from accessing your credit report, preventing fraudulent accounts.',
      },
      {
        id: 'id-3',
        question: 'What information do identity thieves need most?',
        options: ['Your favorite color', 'Social Security number', 'Your pet\'s name', 'Your job title'],
        correctAnswer: 'Social Security number',
        explanation: 'SSNs are the master key to your identity — they can be used to open accounts, file taxes, and more.',
      },
      {
        id: 'id-4',
        question: 'How often should you check your credit report?',
        options: ['Never', 'Once a year', 'At least annually, ideally quarterly', 'Only after a breach'],
        correctAnswer: 'At least annually, ideally quarterly',
        explanation: 'Regular monitoring helps catch unauthorized accounts early. You can get free reports from each bureau annually.',
      },
      {
        id: 'id-5',
        question: 'What is synthetic identity theft?',
        options: ['Stealing your wallet', 'Combining real and fake information to create a new identity', 'Using your email', 'Hacking your phone'],
        correctAnswer: 'Combining real and fake information to create a new identity',
        explanation: 'Synthetic identity theft mixes real data (like a child\'s SSN) with fake info to create a fictitious person.',
      },
      {
        id: 'id-6',
        question: 'What should you do first if you suspect identity theft?',
        options: ['Wait and see', 'Place a fraud alert with credit bureaus', 'Delete your social media', 'Change your name'],
        correctAnswer: 'Place a fraud alert with credit bureaus',
        explanation: 'A fraud alert tells creditors to verify identity before opening new accounts. It\'s the critical first step.',
      },
    ],
  },

  // ── 9. Incident Response ──────────────────────────────
  {
    id: 'incident-response',
    title: 'Incident Response Quiz',
    description: 'Test your knowledge of security incident handling procedures.',
    icon: '🚨',
    difficulty: 'Advanced',
    passingScore: 70,
    questions: [
      {
        id: 'ir-1',
        question: 'What is the first phase of incident response?',
        options: ['Eradication', 'Preparation', 'Containment', 'Recovery'],
        correctAnswer: 'Preparation',
        explanation: 'Preparation involves creating plans, training teams, and setting up tools before an incident occurs.',
      },
      {
        id: 'ir-2',
        question: 'What is containment in incident response?',
        options: ['Deleting all data', 'Isolating affected systems to prevent spread', 'Shutting down the company', 'Notifying the media'],
        correctAnswer: 'Isolating affected systems to prevent spread',
        explanation: 'Containment limits the damage by isolating compromised systems while preserving evidence.',
      },
      {
        id: 'ir-3',
        question: 'What is the chain of custody?',
        options: ['A blockchain', 'Documentation tracking evidence handling', 'A management hierarchy', 'A type of encryption'],
        correctAnswer: 'Documentation tracking evidence handling',
        explanation: 'Chain of custody documents who handled evidence and when, ensuring it\'s admissible in legal proceedings.',
      },
      {
        id: 'ir-4',
        question: 'When should you notify affected parties of a data breach?',
        options: ['Never', 'As soon as reasonably possible', 'After fixing the issue completely', 'Only if legally required'],
        correctAnswer: 'As soon as reasonably possible',
        explanation: 'Timely notification allows affected individuals to protect themselves. Many regulations mandate prompt disclosure.',
      },
      {
        id: 'ir-5',
        question: 'What is a post-mortem / lessons learned session?',
        options: ['A meeting to assign blame', 'An analysis of what happened and how to improve', 'A legal proceeding', 'A press conference'],
        correctAnswer: 'An analysis of what happened and how to improve',
        explanation: 'Blameless post-mortems focus on understanding root causes and improving processes to prevent recurrence.',
      },
      {
        id: 'ir-6',
        question: 'What is an IOC (Indicator of Compromise)?',
        options: ['A financial metric', 'Evidence that a security breach has occurred', 'A network speed test', 'A type of firewall rule'],
        correctAnswer: 'Evidence that a security breach has occurred',
        explanation: 'IOCs include unusual network traffic, unexpected file changes, or suspicious login patterns.',
      },
      {
        id: 'ir-7',
        question: 'Should you immediately shut down a compromised server?',
        options: ['Yes, always', 'No — isolate it but preserve evidence first', 'Only on weekends', 'Only if it\'s a database server'],
        correctAnswer: 'No — isolate it but preserve evidence first',
        explanation: 'Shutting down destroys volatile memory evidence. Isolate the system from the network while preserving forensic data.',
      },
      {
        id: 'ir-8',
        question: 'What is a tabletop exercise?',
        options: ['A board game', 'A simulated incident response discussion', 'A physical security drill', 'A type of penetration test'],
        correctAnswer: 'A simulated incident response discussion',
        explanation: 'Tabletop exercises walk through hypothetical scenarios to test and improve incident response plans.',
      },
    ],
  },

  // ── 10. Encryption Basics ─────────────────────────────
  {
    id: 'encryption-basics',
    title: 'Encryption Quiz',
    description: 'Understand the fundamentals of data encryption.',
    icon: '🔑',
    difficulty: 'Intermediate',
    passingScore: 70,
    questions: [
      {
        id: 'en-1',
        question: 'What is encryption?',
        options: ['Deleting data', 'Converting data into an unreadable format', 'Compressing files', 'Backing up data'],
        correctAnswer: 'Converting data into an unreadable format',
        explanation: 'Encryption transforms plaintext into ciphertext that can only be read with the correct decryption key.',
      },
      {
        id: 'en-2',
        question: 'What is the difference between symmetric and asymmetric encryption?',
        options: ['Speed vs. security', 'Same key vs. different keys for encrypt/decrypt', 'Old vs. new methods', 'Text vs. file encryption'],
        correctAnswer: 'Same key vs. different keys for encrypt/decrypt',
        explanation: 'Symmetric uses one key for both; asymmetric uses a public key to encrypt and private key to decrypt.',
      },
      {
        id: 'en-3',
        question: 'What is AES?',
        options: ['A programming language', 'Advanced Encryption Standard — widely used symmetric cipher', 'An antivirus program', 'A network protocol'],
        correctAnswer: 'Advanced Encryption Standard — widely used symmetric cipher',
        explanation: 'AES is the gold standard for symmetric encryption, used by governments and industries worldwide.',
      },
      {
        id: 'en-4',
        question: 'What is end-to-end encryption?',
        options: ['Only the sender and receiver can read messages', 'Encryption on one end only', 'Encryption during storage only', 'No encryption'],
        correctAnswer: 'Only the sender and receiver can read messages',
        explanation: 'E2E encryption ensures even the service provider cannot read the content — only the communicating users can.',
      },
      {
        id: 'en-5',
        question: 'What is a digital certificate?',
        options: ['A PDF diploma', 'An electronic document proving ownership of a public key', 'A digital signature', 'A type of password'],
        correctAnswer: 'An electronic document proving ownership of a public key',
        explanation: 'Digital certificates verify that a public key belongs to the claimed entity, enabling trusted communication.',
      },
      {
        id: 'en-6',
        question: 'What happens if you lose your encryption key?',
        options: ['Nothing, data auto-decrypts', 'The encrypted data becomes permanently inaccessible', 'You can guess it', 'Contact the government'],
        correctAnswer: 'The encrypted data becomes permanently inaccessible',
        explanation: 'Without the key, properly encrypted data cannot be recovered. Key management is critical.',
      },
      {
        id: 'en-7',
        question: 'What is hashing?',
        options: ['A type of encryption', 'A one-way function that produces a fixed-size output', 'A compression algorithm', 'A network protocol'],
        correctAnswer: 'A one-way function that produces a fixed-size output',
        explanation: 'Hashing is irreversible — unlike encryption, you cannot recover the original data from a hash. Used for passwords and integrity.',
      },
    ],
  },

  // ── 11. Security Compliance ───────────────────────────
  {
    id: 'security-compliance',
    title: 'Compliance Quiz',
    description: 'Test your knowledge of security regulations and frameworks.',
    icon: '⚖️',
    difficulty: 'Advanced',
    passingScore: 70,
    questions: [
      {
        id: 'co-1',
        question: 'What does GDPR protect?',
        options: ['Corporate trade secrets', 'Personal data of EU residents', 'Government networks', 'Financial transactions'],
        correctAnswer: 'Personal data of EU residents',
        explanation: 'GDPR is a comprehensive data protection regulation governing how personal data of EU residents is handled.',
      },
      {
        id: 'co-2',
        question: 'What is the maximum GDPR fine?',
        options: ['$1,000', '$1 million', '€20 million or 4% of global turnover', '€100,000'],
        correctAnswer: '€20 million or 4% of global turnover',
        explanation: 'GDPR fines can reach whichever is higher: €20 million or 4% of annual worldwide turnover.',
      },
      {
        id: 'co-3',
        question: 'What does HIPAA regulate?',
        options: ['Financial data', 'Protected health information (PHI)', 'Environmental safety', 'Consumer products'],
        correctAnswer: 'Protected health information (PHI)',
        explanation: 'HIPAA sets standards for protecting sensitive patient health information in the US healthcare system.',
      },
      {
        id: 'co-4',
        question: 'What is PCI-DSS?',
        options: ['A programming language', 'Payment Card Industry Data Security Standard', 'A type of firewall', 'A government agency'],
        correctAnswer: 'Payment Card Industry Data Security Standard',
        explanation: 'PCI-DSS defines security requirements for organizations that handle credit card data.',
      },
      {
        id: 'co-5',
        question: 'What is a DPO (Data Protection Officer)?',
        options: ['A security guard', 'A person responsible for data protection compliance', 'A type of encryption', 'A government official'],
        correctAnswer: 'A person responsible for data protection compliance',
        explanation: 'DPOs oversee data protection strategy, ensure GDPR compliance, and serve as the contact for data subjects.',
      },
      {
        id: 'co-6',
        question: 'What is the "right to be forgotten"?',
        options: ['Deleting social media', 'The right to request deletion of personal data', 'A memory technique', 'Clearing browser history'],
        correctAnswer: 'The right to request deletion of personal data',
        explanation: 'Under GDPR, individuals can request organizations to erase their personal data under certain conditions.',
      },
    ],
  },

  // ── 12. Ethical Hacking Fundamentals ──────────────────
  {
    id: 'ethical-hacking',
    title: 'Ethical Hacking Quiz',
    description: 'Learn about ethical hacking principles and techniques.',
    icon: '🎯',
    difficulty: 'Advanced',
    passingScore: 70,
    questions: [
      {
        id: 'eh-1',
        question: 'What is the primary difference between ethical hacking and malicious hacking?',
        options: ['The tools used', 'Authorization and intent', 'The target systems', 'The time of day'],
        correctAnswer: 'Authorization and intent',
        explanation: 'Ethical hackers have explicit permission and aim to improve security. Intent and authorization are the key differences.',
      },
      {
        id: 'eh-2',
        question: 'What is a penetration test?',
        options: ['A physical security check', 'An authorized simulated attack to find vulnerabilities', 'A network speed test', 'A firewall configuration'],
        correctAnswer: 'An authorized simulated attack to find vulnerabilities',
        explanation: 'Pen tests simulate real attacks to identify weaknesses before malicious hackers can exploit them.',
      },
      {
        id: 'eh-3',
        question: 'What is the first phase of ethical hacking?',
        options: ['Exploitation', 'Reconnaissance / information gathering', 'Reporting', 'Cleanup'],
        correctAnswer: 'Reconnaissance / information gathering',
        explanation: 'Recon involves collecting information about the target system, network, and organization before any testing begins.',
      },
      {
        id: 'eh-4',
        question: 'What is a vulnerability scanner?',
        options: ['A virus', 'A tool that automatically identifies security weaknesses', 'A type of firewall', 'An encryption tool'],
        correctAnswer: 'A tool that automatically identifies security weaknesses',
        explanation: 'Vulnerability scanners like Nessus or OpenVAS automatically detect known vulnerabilities in systems.',
      },
      {
        id: 'eh-5',
        question: 'What does CVE stand for?',
        options: ['Computer Virus Encyclopedia', 'Common Vulnerabilities and Exposures', 'Cyber Vulnerability Exam', 'Critical Virus Emergency'],
        correctAnswer: 'Common Vulnerabilities and Exposures',
        explanation: 'CVE is a standardized list of publicly known cybersecurity vulnerabilities, each with a unique ID.',
      },
      {
        id: 'eh-6',
        question: 'What is social engineering in the context of ethical hacking?',
        options: ['Building social media apps', 'Manipulating people to reveal information', 'Social media marketing', 'Team building'],
        correctAnswer: 'Manipulating people to reveal information',
        explanation: 'Social engineering exploits human psychology rather than technical vulnerabilities to gain unauthorized access.',
      },
      {
        id: 'eh-7',
        question: 'What is a bug bounty program?',
        options: ['A pest control service', 'A program that pays hackers for finding vulnerabilities', 'A software development method', 'A type of antivirus'],
        correctAnswer: 'A program that pays hackers for finding vulnerabilities',
        explanation: 'Bug bounties incentivize security researchers to responsibly report vulnerabilities in exchange for rewards.',
      },
      {
        id: 'eh-8',
        question: 'What is the OWASP Top 10?',
        options: ['Top 10 programming languages', 'A list of the most critical web application security risks', 'Top 10 antivirus software', 'A list of hackers'],
        correctAnswer: 'A list of the most critical web application security risks',
        explanation: 'OWASP Top 10 is a widely-referenced document listing the most critical web application security vulnerabilities.',
      },
      {
        id: 'eh-9',
        question: 'What should an ethical hacker do after finding a vulnerability?',
        options: ['Exploit it for fun', 'Document and report it responsibly', 'Share it publicly immediately', 'Ignore it'],
        correctAnswer: 'Document and report it responsibly',
        explanation: 'Responsible disclosure means documenting findings and reporting to the organization so they can fix it before it\'s exploited.',
      },
    ],
  },
];

/** Lookup a quiz by ID */
export function getQuizById(id: string): QuizDefinition | undefined {
  return QUIZZES.find(q => q.id === id);
}
