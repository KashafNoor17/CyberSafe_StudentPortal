import { useState, useEffect, useCallback } from 'react';

type Platform = 'web' | 'ios' | 'android' | 'pwa';

function detectPlatform(): Platform {
  if ((window as any).Capacitor?.isNativePlatform?.()) {
    const p = (window as any).Capacitor.getPlatform?.();
    if (p === 'ios') return 'ios';
    if (p === 'android') return 'android';
  }
  if (window.matchMedia('(display-mode: standalone)').matches) return 'pwa';
  return 'web';
}

export function useNativePlatform() {
  const [platform, setPlatform] = useState<Platform>(detectPlatform);
  const isNative = platform === 'ios' || platform === 'android';
  const isPWA = platform === 'pwa';
  const isMobileApp = isNative || isPWA;

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = () => setPlatform(detectPlatform());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const triggerHaptic = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!isNative) {
      if (navigator.vibrate) {
        navigator.vibrate(style === 'light' ? 10 : style === 'medium' ? 20 : 30);
      }
      return;
    }
    try {
      const cap = (window as any).Capacitor;
      if (cap?.Plugins?.Haptics) {
        const styleMap: Record<string, string> = { light: 'LIGHT', medium: 'MEDIUM', heavy: 'HEAVY' };
        await cap.Plugins.Haptics.impact({ style: styleMap[style] });
      }
    } catch { /* not available */ }
  }, [isNative]);

  return { platform, isNative, isPWA, isMobileApp, triggerHaptic };
}
