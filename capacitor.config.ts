import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f8172b8adce74f819ee6f01fa9dc0397',
  appName: 'cybersafe-edu',
  webDir: 'dist',
  server: {
    url: 'https://f8172b8a-dce7-4f81-9ee6-f01fa9dc0397.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#0d1117',
      showSpinner: true,
      spinnerColor: '#2b6f9e',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0d1117',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  // Deep linking configuration
  // iOS: Add associated domains in Xcode (applinks:cybersafe-edu.lovable.app)
  // Android: intent filters auto-configured via capacitor.config.ts
};

export default config;
