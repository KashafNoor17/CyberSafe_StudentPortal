-- Insert Module 3: Social Media Privacy & Safety
INSERT INTO learning_modules (title, slug, description, difficulty, estimated_minutes, order_index, content)
VALUES (
  'Social Media Privacy & Safety',
  'social-media-safety',
  'Learn to protect your privacy, recognize risks, and use social media securely.',
  'beginner',
  12,
  8,
  '{
    "sections": [
      {
        "title": "Why Social Media Privacy Matters",
        "content": "Your social media presence reveals more about you than you might realize. From your location and daily routines to your relationships and preferences, this information can be exploited by cybercriminals, stalkers, or even used against you in job applications. Protecting your privacy online is essential for both your digital and physical safety."
      },
      {
        "title": "Common Social Media Risks",
        "content": "Be aware of these threats: Oversharing location data can reveal your home address or when you''re away. Fake accounts and catfishing attempts try to build trust before scamming you. Phishing links disguised as viral content can steal your credentials. Poor privacy settings can expose your personal information to anyone. Third-party apps may harvest your data without your knowledge."
      },
      {
        "title": "Privacy Settings Walkthrough",
        "content": "Most platforms offer similar privacy controls: Set your profile to private so only approved followers see your content. Disable location sharing on posts. Enable tag review so you approve posts before they appear on your profile. Limit data sharing with third-party apps in your account settings. Control who can find you via email or phone number search. Regularly audit which apps have access to your account."
      }
    ]
  }'::jsonb
);