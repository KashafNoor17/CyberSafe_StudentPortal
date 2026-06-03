import { useState, useCallback, useEffect } from 'react';
import { Search, BookOpen, FileText, Users, MessageSquare, ArrowRight, Sparkles, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  type: 'module' | 'blog' | 'forum' | 'tip';
  title: string;
  snippet: string;
  url: string;
  icon: typeof BookOpen;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onOpenChange]);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);

    try {
      const term = `%${q}%`;

      const [modulesRes, blogsRes, forumRes, tipsRes] = await Promise.all([
        supabase.from('learning_modules').select('id, title, slug, description').ilike('title', term).limit(5),
        supabase.from('blog_posts').select('id, title, slug, excerpt').ilike('title', term).eq('is_published', true).limit(5),
        supabase.from('forum_posts').select('id, title').ilike('title', term).limit(5),
        supabase.from('weekly_tips').select('id, title, content').or(`title.ilike.${term},content.ilike.${term}`).limit(3),
      ]);

      const all: SearchResult[] = [
        ...(modulesRes.data || []).map(m => ({
          type: 'module' as const,
          title: m.title,
          snippet: m.description?.slice(0, 120) || '',
          url: `/modules/${m.slug}`,
          icon: BookOpen,
        })),
        ...(blogsRes.data || []).map(b => ({
          type: 'blog' as const,
          title: b.title,
          snippet: b.excerpt?.slice(0, 120) || '',
          url: `/blog/${b.slug}`,
          icon: FileText,
        })),
        ...(forumRes.data || []).map(f => ({
          type: 'forum' as const,
          title: f.title,
          snippet: '',
          url: `/community/forum/${f.id}`,
          icon: MessageSquare,
        })),
        ...(tipsRes.data || []).map(t => ({
          type: 'tip' as const,
          title: t.title || '',
          snippet: t.content?.slice(0, 120) || '',
          url: '/tips',
          icon: Sparkles,
        })),
      ];

      setResults(all);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const handleSelect = (url: string) => {
    onOpenChange(false);
    setQuery('');
    setResults([]);
    navigate(url);
  };

  const typeColors: Record<string, string> = {
    module: 'bg-primary/10 text-primary',
    blog: 'bg-blue-500/10 text-blue-500',
    forum: 'bg-green-500/10 text-green-500',
    tip: 'bg-yellow-500/10 text-yellow-600',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Search CyberSafe</DialogTitle>
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search modules, blog, community..."
            className="border-0 focus-visible:ring-0 h-12 text-sm"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-flex text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Esc
          </kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No results for "{query}"</p>
              <p className="text-xs text-muted-foreground mt-1">Try different keywords</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((r, i) => (
                <button
                  key={`${r.type}-${i}`}
                  className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                  onClick={() => handleSelect(r.url)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${typeColors[r.type] || ''}`}>
                    <r.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    {r.snippet && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{r.snippet}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 mt-1">{r.type}</Badge>
                </button>
              ))}
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="p-8 text-center">
              <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Search across modules, blog posts, forums, and tips</p>
              <p className="text-xs text-muted-foreground mt-1">
                <kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">⌘K</kbd> to open anytime
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
