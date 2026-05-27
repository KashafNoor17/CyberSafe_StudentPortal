import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

/**
 * Hook providing locale-aware formatting for dates, numbers, and currencies.
 * Uses Intl APIs with the current i18n language as locale.
 */
export function useLocaleFormat() {
  const { i18n } = useTranslation();
  const locale = i18n.language || 'en';

  return useMemo(() => ({
    /** Format a date (e.g. "May 15, 2024") */
    formatDate(date: Date | string) {
      const d = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(d);
    },

    /** Format date + time (e.g. "May 15, 2024, 3:00 PM") */
    formatDateTime(date: Date | string) {
      const d = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    },

    /** Format a number with locale separators */
    formatNumber(n: number) {
      return new Intl.NumberFormat(locale).format(n);
    },

    /** Format currency */
    formatCurrency(amount: number, currency = 'USD') {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(amount);
    },

    /** Format percentage (input 0-100) */
    formatPercentage(value: number) {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(value / 100);
    },

    /** Relative time (e.g. "2 hours ago") */
    formatRelativeTime(date: Date | string) {
      const d = typeof date === 'string' ? new Date(date) : date;
      const diff = Date.now() - d.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      if (days > 0) return rtf.format(-days, 'day');
      if (hours > 0) return rtf.format(-hours, 'hour');
      if (minutes > 0) return rtf.format(-minutes, 'minute');
      return rtf.format(-seconds, 'second');
    },

    locale,
  }), [locale]);
}
