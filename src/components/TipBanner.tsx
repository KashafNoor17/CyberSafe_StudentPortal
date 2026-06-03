import { useState, useEffect } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Tip {
  id: string;
  tip_text: string;
  headline: string | null;
  category: string;
  risk_level: string;
}

export function TipBanner() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBannerTips();
  }, []);

  const fetchBannerTips = async () => {
    try {
      const { data } = await supabase
        .from('weekly_tips')
        .select('id, title, content, category')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        const mappedData = data.map((item: any) => ({
          id: item.id,
          tip_text: item.content || '',
          headline: item.title || '',
          category: item.category || 'general',
          risk_level: 'medium',
        }));
        setTips(mappedData);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching banner tips:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tips.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [tips.length]);

  if (loading || tips.length === 0 || !isVisible) return null;

  const currentTip = tips[currentIndex];

  const riskColors: Record<string, string> = {
    low: 'bg-success/10 border-success/30 text-success',
    medium: 'bg-warning/10 border-warning/30 text-warning',
    high: 'bg-destructive/10 border-destructive/30 text-destructive',
  };

  return (
    <div className="relative bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-b border-border overflow-hidden">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/tips" className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  Tip of the Day
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${riskColors[currentTip.risk_level] || riskColors.medium}`}>
                  {currentTip.risk_level?.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-foreground truncate animate-fade-in font-medium" key={currentTip.id}>
                {currentTip.headline || currentTip.tip_text}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {tips.length > 1 && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground min-w-[40px] text-center">
                  {currentIndex + 1}/{tips.length}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % tips.length)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 ml-2" onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
