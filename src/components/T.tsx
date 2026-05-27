import { memo } from 'react';
import { useTranslate } from '@/hooks/useTranslate';

interface TProps {
  children: string | number;
  fallback?: string;
}

function shouldSkipTranslation(text: string): boolean {
  if (text.trim().length < 2) return true;
  if (/<|>/.test(text)) return true;
  if (/^[\d.,:%\s+-]+$/.test(text)) return true;
  return false;
}

/**
 * Auto-translating text component.
 * Wraps a hardcoded English string and translates it using
 * LibreTranslate (primary) with MyMemory fallback.
 *
 * Usage: <T>Hello World</T>
 */
export const T = memo(function T({ children, fallback }: TProps) {
  const text = String(children);
  const skip = shouldSkipTranslation(text);
  const { translated, isLoading } = useTranslate(skip ? '' : text);

  if (skip) {
    return <span>{text}</span>;
  }

  if (isLoading) {
    return <span className="opacity-60 animate-pulse transition-opacity duration-300">{fallback ?? text}</span>;
  }

  return <span className="transition-opacity duration-300">{translated}</span>;
});
