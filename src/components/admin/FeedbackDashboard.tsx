import { useEffect, useState } from 'react';
import { Bug, Lightbulb, MessageCircle, Star, Download, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedbackItem {
  id: string;
  user_id: string | null;
  category: string;
  feedback_type: string;
  message: string;
  rating: number | null;
  email: string | null;
  status: string;
  priority: string;
  admin_notes: string | null;
  created_at: string;
}

interface SurveyItem {
  id: string;
  user_id: string;
  module_id: string;
  rating: number;
  clarity: string | null;
  most_helpful: string | null;
  improvement: string | null;
  would_recommend: boolean | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-primary/10 text-primary border-primary/20',
  in_progress: 'bg-warning/10 text-warning border-warning/20',
  fixed: 'bg-success/10 text-success border-success/20',
  wont_fix: 'bg-muted text-muted-foreground border-border',
};

const CATEGORY_ICONS: Record<string, typeof Bug> = {
  bug: Bug,
  feature: Lightbulb,
  content: MessageCircle,
  usability: MessageCircle,
  general: MessageCircle,
};

export function FeedbackDashboard() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [feedbackRes, surveyRes] = await Promise.all([
      supabase.from('feedback' as any).select('*').order('created_at', { ascending: false }),
      supabase.from('module_surveys' as any).select('*').order('created_at', { ascending: false }),
    ]);
    setFeedback((feedbackRes.data as any) || []);
    setSurveys((surveyRes.data as any) || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('feedback' as any).update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error updating status' });
      return;
    }
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    toast({ title: `Status updated to ${status}` });
  };

  const updatePriority = async (id: string, priority: string) => {
    const { error } = await supabase.from('feedback' as any).update({ priority, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return;
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, priority } : f));
  };

  const exportCSV = () => {
    const headers = ['ID', 'Category', 'Message', 'Rating', 'Status', 'Priority', 'Date'];
    const rows = filtered.map(f => [f.id, f.category, `"${f.message.replace(/"/g, '""')}"`, f.rating ?? '', f.status, f.priority, new Date(f.created_at).toLocaleDateString()]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedback-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = feedback.filter(f => {
    if (filterCategory !== 'all' && f.category !== filterCategory) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    if (searchTerm && !f.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const avgRating = feedback.filter(f => f.rating).reduce((acc, f) => acc + (f.rating || 0), 0) / (feedback.filter(f => f.rating).length || 1);
  const bugCount = feedback.filter(f => f.category === 'bug').length;
  const featureCount = feedback.filter(f => f.category === 'feature').length;
  const surveyAvgRating = surveys.reduce((acc, s) => acc + s.rating, 0) / (surveys.length || 1);

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading feedback...</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{feedback.length}</p>
            <p className="text-sm text-muted-foreground">Total Feedback</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{bugCount}</p>
            <p className="text-sm text-muted-foreground">Bug Reports</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{featureCount}</p>
            <p className="text-sm text-muted-foreground">Feature Requests</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-5 w-5 fill-warning text-warning" />
              <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
            </div>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feedback">
        <TabsList>
          <TabsTrigger value="feedback">All Feedback</TabsTrigger>
          <TabsTrigger value="surveys">Module Surveys</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search feedback..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px]"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="bug">Bugs</SelectItem>
                <SelectItem value="feature">Features</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="usability">Usability</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="wont_fix">Won't Fix</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No feedback found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((f) => {
                const Icon = CATEGORY_ICONS[f.category] || MessageCircle;
                return (
                  <Card key={f.id} className="border-border/50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="outline" className={STATUS_COLORS[f.status] || ''}>{f.status.replace('_', ' ')}</Badge>
                            <Badge variant="secondary">{f.category}</Badge>
                            {f.rating && (
                              <span className="flex items-center gap-0.5 text-sm">
                                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                {f.rating}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">{new Date(f.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm">{f.message}</p>
                          <div className="flex gap-2 mt-2">
                            <Select value={f.status} onValueChange={(v) => updateStatus(f.id, v)}>
                              <SelectTrigger className="h-7 text-xs w-[110px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="fixed">Fixed</SelectItem>
                                <SelectItem value="wont_fix">Won't Fix</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={f.priority} onValueChange={(v) => updatePriority(f.id, v)}>
                              <SelectTrigger className="h-7 text-xs w-[100px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="surveys" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Module Survey Results</CardTitle>
              <CardDescription>Average module rating: {surveyAvgRating.toFixed(1)} / 5 ({surveys.length} responses)</CardDescription>
            </CardHeader>
            <CardContent>
              {surveys.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No surveys yet.</p>
              ) : (
                <div className="space-y-3">
                  {surveys.map((s) => (
                    <div key={s.id} className="border border-border/50 rounded-lg p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className={`h-4 w-4 ${i <= s.rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                        {s.clarity && <Badge variant="secondary" className="text-xs">{s.clarity}</Badge>}
                        {s.would_recommend !== null && (
                          <Badge variant={s.would_recommend ? 'default' : 'destructive'} className="text-xs">
                            {s.would_recommend ? 'Recommends' : 'Does not recommend'}
                          </Badge>
                        )}
                      </div>
                      {s.most_helpful && <p className="text-sm"><span className="font-medium">Helpful:</span> {s.most_helpful}</p>}
                      {s.improvement && <p className="text-sm"><span className="font-medium">Improve:</span> {s.improvement}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
