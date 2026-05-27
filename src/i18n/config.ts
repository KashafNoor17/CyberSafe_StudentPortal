import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ar from './locales/ar.json';

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRtl: boolean;
}

export const supportedLanguages: LanguageConfig[] = [
  // Priority languages
  { code: 'en', name: 'English (US)', nativeName: 'English', flag: '🇺🇸', isRtl: false },
  
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', isRtl: true },
  { code: 'ur-roman', name: 'Roman English (Urdu)', nativeName: 'Roman Urdu', flag: '🇵🇰', isRtl: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', isRtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRtl: true },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', isRtl: false },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', isRtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', isRtl: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', isRtl: false },
  // European languages
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isRtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', isRtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isRtl: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', isRtl: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', isRtl: false },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', isRtl: false },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', isRtl: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', isRtl: false },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', isRtl: false },
  // South/Southeast Asian
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', isRtl: false },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', isRtl: false },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', isRtl: false },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', isRtl: false },
];

export type LanguageCode = string;

/** Maps i18n language codes to LibreTranslate / MyMemory target codes */
export const TRANSLATE_CODE_MAP: Record<string, string> = {
  // English variants → no translation needed (handled by hook)
  fr: 'fr',
  de: 'de',
  es: 'es',
  ar: 'ar',
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  ja: 'ja',
  ko: 'ko',
  hi: 'hi',
  ur: 'ur',
  'ur-roman': 'ur',
  ru: 'ru',
  pt: 'pt',
  it: 'it',
  nl: 'nl',
  pl: 'pl',
  tr: 'tr',
  vi: 'vi',
  id: 'id',
  bn: 'bn',
  th: 'th',
};

export const getLanguageConfig = (code: string): LanguageConfig =>
  supportedLanguages.find((l) => l.code === code) ?? supportedLanguages[0];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      ar: { translation: ar },
      // Languages without full translations fall back to English
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

// Set dir attribute on language change
i18n.on('languageChanged', (lng) => {
  const config = getLanguageConfig(lng);
  document.documentElement.dir = config.isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial dir
const initialConfig = getLanguageConfig(i18n.language);
document.documentElement.dir = initialConfig.isRtl ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

export default i18n;
