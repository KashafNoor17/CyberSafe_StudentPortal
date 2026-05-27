import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TRANSLATE_CODE_MAP } from '@/i18n/config';

function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function getCached(lang: string, text: string): string | null {
  try {
    return sessionStorage.getItem(`translate_${lang}_${hashText(text)}`);
  } catch {
    return null;
  }
}

function setCache(lang: string, text: string, translated: string) {
  try {
    sessionStorage.setItem(`translate_${lang}_${hashText(text)}`, translated);
  } catch { /* quota exceeded — ignore */ }
}

async function callLibreTranslate(text: string, target: string): Promise<string> {
  const res = await fetch('https://libretranslate.com/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: 'en', target, format: 'text' }),
  });
  if (!res.ok) throw new Error(`LibreTranslate ${res.status}`);
  const data = await res.json();
  if (data?.translatedText) return data.translatedText;
  throw new Error('No translatedText in response');
}

async function callMyMemory(text: string, target: string): Promise<string> {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${target}`
  );
  if (!res.ok) throw new Error(`MyMemory ${res.status}`);
  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  if (translated && typeof translated === 'string' && !translated.startsWith('MYMEMORY WARNING')) {
    return translated;
  }
  throw new Error('MyMemory failed');
}

export function useTranslate(text: string) {
  const { i18n } = useTranslation();
  const langRaw = i18n.language;
  const targetCode = TRANSLATE_CODE_MAP[langRaw] ?? TRANSLATE_CODE_MAP[langRaw.split('-')[0]] ?? null;

  const isEnglish = !targetCode;

  const [state, setState] = useState<{ translated: string; isLoading: boolean; error: string | null }>(() => {
    if (isEnglish || !text.trim()) return { translated: text, isLoading: false, error: null };
    const cached = getCached(targetCode, text);
    if (cached) return { translated: cached, isLoading: false, error: null };
    return { translated: text, isLoading: true, error: null };
  });

  useEffect(() => {
    if (isEnglish || !text.trim()) {
      setState({ translated: text, isLoading: false, error: null });
      return;
    }

    const cached = getCached(targetCode, text);
    if (cached) {
      setState({ translated: cached, isLoading: false, error: null });
      return;
    }

    let cancelled = false;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    (async () => {
      try {
        const result = await callLibreTranslate(text, targetCode);
        if (!cancelled) {
          setCache(targetCode, text, result);
          setState({ translated: result, isLoading: false, error: null });
        }
      } catch {
        // Fallback to MyMemory
        try {
          const result = await callMyMemory(text, targetCode);
          if (!cancelled) {
            setCache(targetCode, text, result);
            setState({ translated: result, isLoading: false, error: null });
          }
        } catch {
          if (!cancelled) {
            setState({ translated: text, isLoading: false, error: 'Translation unavailable' });
          }
        }
      }
    })();

    return () => { cancelled = true; };
  }, [text, targetCode, isEnglish]);

  return state;
}
