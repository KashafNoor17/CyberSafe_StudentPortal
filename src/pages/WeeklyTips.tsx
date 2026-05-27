import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Search, ThumbsUp, Shield, Wifi, Lock, Globe, Terminal, Heart, ChevronRight, Sparkles, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { T } from '@/components/T';

interface Tip {
  id: string;
  tip_text: string;
  headline: string | null;
  detailed_text: string | null;
  why_it_matters: string | null;
  action_step: string | null;
  category: string;
  risk_level: string;
  difficulty: string | null;
  tags: string[] | null;
  helpful_count: number;
  viewed_count: number;
  week_number: number;
  year: number;
}

const categories = [
  { key: 'all', label: 'All Tips', icon: Sparkles },
  { key: 'passwords', label: 'Passwords', icon: Lock },
  { key: 'phishing', label: 'Phishing', icon: Shield },
  { key: 'social-media', label: 'Social Media', icon: Globe },
  { key: 'network', label: 'Network', icon: Wifi },
  { key: 'general', label: 'General', icon: Heart },
  { key: 'ctf', label: 'CTF Tools', icon: Terminal },
];

const difficultyColors: Record<string, string> = {
  beginner: 'bg-success/10 text-success border-success/30',
  intermediate: 'bg-warning/10 text-warning border-warning/30',
  advanced: 'bg-destructive/10 text-destructive border-destructive/30',
};

const riskColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
};

export default function WeeklyTips() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [helpfulTips, setHelpfulTips] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTips();
      fetchHelpfulHistory();
    }
  }, [user]);

  const fetchTips = async () => {
    try {
      const { data } = await supabase
        .from('weekly_tips')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setTips(data as Tip[]);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHelpfulHistory = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('user_tip_history')
        .select('tip_id')
        .eq('user_id', user.id)
        .eq('marked_helpful', true);
      if (data) setHelpfulTips(new Set(data.map(d => d.tip_id)));
    } catch {}
  };

  const handleMarkHelpful = async (tipId: string) => {
    if (!user) return;
    const alreadyHelpful = helpfulTips.has(tipId);

    try {
      const { error } = await supabase
        .from('user_tip_history')
        .upsert({
          user_id: user.id,
          tip_id: tipId,
          marked_helpful: !alreadyHelpful,
        }, { onConflict: 'user_id,tip_id' });

      if (error) throw error;

      // Update local helpful_count
      await supabase
        .from('weekly_tips')
        .update({ helpful_count: tips.find(t => t.id === tipId)!.helpful_count + (alreadyHelpful ? -1 : 1) })
        .eq('id', tipId);

      setHelpfulTips(prev => {
        const next = new Set(prev);
        if (alreadyHelpful) next.delete(tipId);
        else next.add(tipId);
        return next;
      });

      setTips(prev => prev.map(t => 
        t.id === tipId ? { ...t, helpful_count: t.helpful_count + (alreadyHelpful ? -1 : 1) } : t
      ));

      toast({ title: alreadyHelpful ? 'Removed from helpful' : 'Marked as helpful!' });
    } catch {
      toast({ variant: 'destructive', title: 'Error updating tip' });
    }
  };

  // Daily tip: deterministic based on day of year
  const getDailyTip = useCallback(() => {
    if (tips.length === 0) return null;
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    return tips[dayOfYear % tips.length];
  }, [tips]);

  const dailyTip = getDailyTip();

  const filteredTips = tips.filter(tip => {
    const matchesCategory = activeCategory === 'all' || tip.category === activeCategory;
    const matchesSearch = !searchQuery || 
      (tip.headline || tip.tip_text).toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.detailed_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground"><T>Loading tips...</T></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h1 className="text-3xl font-bold"><T>Security Tips</T></h1>
              <p className="text-muted-foreground">{tips.length} <T>expert tips across</T> {categories.length - 1} <T>categories</T></p>
            </div>
          </div>
        </div>

        {/* Daily Tip Hero */}
        {dailyTip && (
          <Card className="mb-8 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider"><T>Tip of the Day</T></span>
                {dailyTip.difficulty && (
                  <Badge variant="outline" className={`text-[10px] ${difficultyColors[dailyTip.difficulty] || ''}`}>
                    <T>{dailyTip.difficulty}</T>
                  </Badge>
                )}
                <Badge variant="outline" className={`text-[10px] ${riskColors[dailyTip.risk_level] || ''}`}>
                  <T>{dailyTip.risk_level}</T> <T>risk</T>
                </Badge>
              </div>
              <h2 className="text-xl font-bold mb-3"><T>{dailyTip.headline || dailyTip.tip_text}</T></h2>
              {dailyTip.detailed_text && (
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed"><T>{dailyTip.detailed_text}</T></p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dailyTip.why_it_matters && (
                  <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
                    <p className="text-xs font-semibold text-warning mb-1">💡 <T>Why It Matters</T></p>
                    <p className="text-xs text-muted-foreground"><T>{dailyTip.why_it_matters}</T></p>
                  </div>
                )}
                {dailyTip.action_step && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs font-semibold text-primary mb-1">🎯 <T>Try This</T></p>
                    <p className="text-xs text-muted-foreground"><T>{dailyTip.action_step}</T></p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant={helpfulTips.has(dailyTip.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMarkHelpful(dailyTip.id)}
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  <T>Helpful</T> {dailyTip.helpful_count > 0 && `(${dailyTip.helpful_count})`}
                </Button>
                {dailyTip.tags && dailyTip.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">#{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tips by keyword or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => {
            const Icon = cat.icon;
            const count = cat.key === 'all' ? tips.length : tips.filter(t => t.category === cat.key).length;
            return (
              <Button
                key={cat.key}
                variant={activeCategory === cat.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.key)}
                className="gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                <T>{cat.label}</T>
                <span className="text-[10px] opacity-70">({count})</span>
              </Button>
            );
          })}
        </div>

        {/* Tips Grid */}
        {filteredTips.length > 0 ? (
          <div className="grid gap-4">
            {filteredTips.map((tip) => {
              const isExpanded = expandedTip === tip.id;
              return (
                <Card 
                  key={tip.id}
                  className={`cursor-pointer transition-all hover:border-primary/40 ${isExpanded ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
                  onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Lightbulb className="h-5 w-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {tip.difficulty && (
                            <Badge variant="outline" className={`text-[10px] ${difficultyColors[tip.difficulty] || ''}`}>
                              <T>{tip.difficulty}</T>
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-[10px] ${riskColors[tip.risk_level] || ''}`}>
                            <T>{tip.risk_level}</T>
                          </Badge>
                          <span className="text-[10px] text-muted-foreground capitalize">{tip.category.replace('-', ' ')}</span>
                        </div>
                        <h3 className="font-semibold text-sm mb-1"><T>{tip.headline || tip.tip_text}</T></h3>
                        {!isExpanded && (
                          <p className="text-xs text-muted-foreground line-clamp-1"><T>{tip.tip_text}</T></p>
                        )}

                        {isExpanded && (
                          <div className="mt-3 space-y-3 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                            {tip.detailed_text && (
                              <p className="text-sm text-muted-foreground leading-relaxed"><T>{tip.detailed_text}</T></p>
                            )}
                            {tip.why_it_matters && (
                              <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
                                <p className="text-xs font-semibold text-warning mb-1"><T>Why It Matters</T></p>
                                <p className="text-xs text-muted-foreground"><T>{tip.why_it_matters}</T></p>
                              </div>
                            )}
                            {tip.action_step && (
                              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                                <p className="text-xs font-semibold text-primary mb-1">🎯 <T>Try This</T></p>
                                <p className="text-xs text-muted-foreground"><T>{tip.action_step}</T></p>
                              </div>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                variant={helpfulTips.has(tip.id) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleMarkHelpful(tip.id)}
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                <T>Helpful</T> {tip.helpful_count > 0 && `(${tip.helpful_count})`}
                              </Button>
                              {tip.tags && tip.tags.slice(0, 4).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-[10px]">#{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 mt-1 ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground"><T>No tips found matching your criteria.</T></p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                <T>Clear Filters</T>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
