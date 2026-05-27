import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Loader2, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supportedLanguages, getLanguageConfig } from '@/i18n/config';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = getLanguageConfig(i18n.language);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = supportedLanguages.filter((lang) => {
    const q = search.toLowerCase();
    return lang.name.toLowerCase().includes(q) || lang.nativeName.toLowerCase().includes(q);
  });

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (!open) setSearch(''); }}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="min-h-[44px] min-w-[44px]"
          aria-label={t('language.switchLanguage')}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="text-lg" aria-hidden="true">{current.flag}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
        <div className="p-2 sticky top-0 bg-popover z-10">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        {filtered.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={`flex items-center gap-2 ${
              i18n.language === lang.code ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.nativeName}</span>
            {i18n.language === lang.code && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">No languages found</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
