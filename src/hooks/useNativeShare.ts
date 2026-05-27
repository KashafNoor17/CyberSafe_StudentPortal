import { useCallback } from 'react';
import { useNativePlatform } from './useNativePlatform';

interface ShareData {
  title: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}

/**
 * Native share hook using Capacitor Share plugin on native,
 * Web Share API on browsers, clipboard fallback otherwise.
 */
export function useNativeShare() {
  const { isNative } = useNativePlatform();

  const share = useCallback(async (data: ShareData): Promise<{ shared: boolean; copied: boolean }> => {
    const shareUrl = data.url || window.location.href;

    // Native: use Capacitor Share plugin
    if (isNative) {
      try {
        const cap = (window as any).Capacitor;
        if (cap?.Plugins?.Share) {
          await cap.Plugins.Share.share({
            title: data.title,
            text: data.text || '',
            url: shareUrl,
            dialogTitle: data.dialogTitle || 'Share',
          });
          return { shared: true, copied: false };
        }
      } catch (e) {
        if ((e as Error).message?.includes('cancel')) return { shared: false, copied: false };
      }
    }

    // Web Share API
    if (navigator.share) {
      try {
        await navigator.share({ title: data.title, text: data.text, url: shareUrl });
        return { shared: true, copied: false };
      } catch (e) {
        if ((e as Error).name === 'AbortError') return { shared: false, copied: false };
      }
    }

    // Fallback: clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      return { shared: false, copied: true };
    } catch {
      return { shared: false, copied: false };
    }
  }, [isNative]);

  const shareModule = useCallback((moduleId: string, title: string) => {
    return share({
      title: `CyberSafe: ${title}`,
      text: `Check out this cybersecurity module on CyberSafe!`,
      url: `${window.location.origin}/modules/${moduleId}`,
    });
  }, [share]);

  const shareCertificate = useCallback((certId: string, studentName: string) => {
    return share({
      title: `${studentName}'s CyberSafe Certificate`,
      text: `I earned my Cybersecurity Fundamentals certificate from CyberSafe!`,
      url: `${window.location.origin}/verify/${certId}`,
    });
  }, [share]);

  const shareCTFChallenge = useCallback((challengeId: string, title: string) => {
    return share({
      title: `CTF Challenge: ${title}`,
      text: `Try this CTF challenge on CyberSafe!`,
      url: `${window.location.origin}/ctf/challenge/${challengeId}`,
    });
  }, [share]);

  const shareAchievement = useCallback((badgeName: string) => {
    return share({
      title: `Achievement Unlocked: ${badgeName}`,
      text: `I just earned the "${badgeName}" badge on CyberSafe! 🏆`,
      url: `${window.location.origin}/badges`,
    });
  }, [share]);

  const shareReferral = useCallback((code: string) => {
    return share({
      title: 'Join CyberSafe',
      text: `Learn cybersecurity with me on CyberSafe! Use my referral code: ${code}`,
      url: `${window.location.origin}/referrals?ref=${code}`,
    });
  }, [share]);

  const shareProfile = useCallback((userId: string, displayName: string) => {
    return share({
      title: `${displayName} on CyberSafe`,
      text: `Check out ${displayName}'s profile on CyberSafe`,
      url: `${window.location.origin}/profile/${userId}`,
    });
  }, [share]);

  return {
    share,
    shareModule,
    shareCertificate,
    shareCTFChallenge,
    shareAchievement,
    shareReferral,
    shareProfile,
  };
}
