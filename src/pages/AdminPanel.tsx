import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, BookOpen, HelpCircle, Lightbulb, BarChart3, MessageSquare, FileText,
  Plus, Trash2, Edit, RefreshCw, ArrowLeft, Search, Eye, EyeOff, Check, X,
  LayoutDashboard, Shield, Award, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import {
  AdminStats,
  ActivityChart,
  RecentActivity,
  UserManagement,
  CommunityModeration,
  CertificateManagement,
  AnalyticsDashboard,
  AuditLog,
  CourseEffectiveness,
  LiveDashboard,
} from '@/components/admin';
import { FeedbackDashboard } from '@/components/admin/FeedbackDashboard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { QuickActions } from '@/components/admin/QuickActions';
import { AdminNotifications } from '@/components/admin/AdminNotifications';
import { AIAnalyticsDashboard } from '@/components/admin/AIAnalyticsDashboard';
import { GamificationAnalytics } from '@/components/admin/GamificationAnalytics';
import { SecurityAnalytics } from '@/components/admin/SecurityAnalytics';

interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  total_points: number;
  level: string;
  created_at: string;
}

interface QuizResult {
  user_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  user_name?: string;
  user_email?: string;
}

interface Tip {
  id: string;
  tip_text: string;
  week_number: number;
  year: number;
  category: string;
  risk_level: string;
  is_banner: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  is_published: boolean;
  views: number;
  created_at: string;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  is_hidden: boolean;
  created_at: string;
  user_name?: string;
}

interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  order_index: number;
}

interface Activity {
  id: string;
  type: 'signup' | 'completion' | 'certificate' | 'forum_post' | 'review';
  message: string;
  timestamp: string;
}

export default function AdminPanel() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [newTipOpen, setNewTipOpen] = useState(false);
  const [newBlogOpen, setNewBlogOpen] = useState(false);
  const [newModuleOpen, setNewModuleOpen] = useState(false);
  
  // Form states
  const [tipForm, setTipForm] = useState({
    tip_text: '',
    headline: '',
    detailed_text: '',
    why_it_matters: '',
    action_step: '',
    week_number: '',
    year: new Date().getFullYear().toString(),
    category: 'general',
    risk_level: 'medium',
    difficulty: 'beginner',
    is_banner: false,
  });

  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'general',
    is_published: false,
  });

  const [moduleForm, setModuleForm] = useState({
    title: '',
    slug: '',
    description: '',
    order_index: '0',
  });

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalModules: 0,
    modulesCompleted: 0,
    certificatesIssued: 0,
    avgQuizScore: 0,
    totalTips: 0,
    totalBlogs: 0,
    pendingReviews: 0,
    forumPosts: 0
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    try {
      const [
        profilesRes, resultsRes, tipsRes, blogsRes, reviewsRes,
        modulesRes, completionsRes, certificatesRes, forumPostsRes
      ] = await Promise.all([
        supabase.from('profiles').select('id, user_id, name, email, total_points, level, created_at').order('created_at', { ascending: false }),
        supabase.from('quiz_results').select('user_id, score, total_questions, completed_at').order('completed_at', { ascending: false }).limit(50),
        supabase.from('weekly_tips').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('id, title, slug, excerpt, category, is_published, views, created_at').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('learning_modules').select('id, title, slug, description, order_index').order('order_index'),
        supabase.from('module_completions').select('id'),
        supabase.from('certificates').select('id'),
        supabase.from('forum_posts').select('id, title, user_id, created_at').order('created_at', { ascending: false }).limit(10)
      ]);

      const profilesData = profilesRes.data || [];
      setUsers(profilesData);

      if (resultsRes.data) {
        const resultsWithUsers = resultsRes.data.map((result) => {
          const profile = profilesData.find(p => p.user_id === result.user_id);
          return { ...result, user_name: profile?.name || 'Unknown', user_email: profile?.email || '' };
        });
        setQuizResults(resultsWithUsers);
      }

      if (tipsRes.data) {
        const mappedTips = tipsRes.data.map((tip: any) => ({
          ...tip,
          tip_text: tip.content || '',
          headline: tip.title || '',
          week_number: 1,
          year: new Date().getFullYear(),
          risk_level: 'medium',
          is_banner: false,
        }));
        setTips(mappedTips);
      } else {
        setTips([]);
      }
      setBlogs(blogsRes.data || []);
      setModules(modulesRes.data || []);

      if (reviewsRes.data) {
        const reviewsWithUsers = reviewsRes.data.map((review) => {
          const profile = profilesData.find(p => p.user_id === review.user_id);
          return { ...review, user_name: profile?.name || 'Anonymous' };
        });
        setReviews(reviewsWithUsers);
      }

      const avgScore = resultsRes.data && resultsRes.data.length > 0 
        ? Math.round(resultsRes.data.reduce((acc, r) => acc + (r.score / r.total_questions) * 100, 0) / resultsRes.data.length)
        : 0;

      const today = new Date().toDateString();
      const activeToday = profilesData.filter(p => new Date(p.created_at).toDateString() === today).length;

      setStats({
        totalUsers: profilesData.length,
        activeToday,
        totalModules: modulesRes.data?.length || 0,
        modulesCompleted: completionsRes.data?.length || 0,
        certificatesIssued: certificatesRes.data?.length || 0,
        avgQuizScore: avgScore,
        totalTips: tipsRes.data?.length || 0,
        totalBlogs: blogsRes.data?.length || 0,
        pendingReviews: reviewsRes.data?.filter(r => !r.is_approved).length || 0,
        forumPosts: forumPostsRes.data?.length || 0
      });

      const activities: Activity[] = [];
      profilesData.slice(0, 3).forEach(p => {
        activities.push({ id: `signup-${p.id}`, type: 'signup', message: `${p.name} joined CyberSafe`, timestamp: p.created_at });
      });
      forumPostsRes.data?.slice(0, 3).forEach(post => {
        const profile = profilesData.find(p => p.user_id === post.user_id);
        activities.push({ id: `forum-${post.id}`, type: 'forum_post', message: `${profile?.name || 'User'} posted: "${post.title.slice(0, 40)}..."`, timestamp: post.created_at });
      });
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 10));

    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const handleAddTip = async () => {
    if (!tipForm.tip_text || !tipForm.week_number) return;
    try {
      const { error } = await supabase.from('weekly_tips').insert([{
        title: tipForm.headline || tipForm.tip_text.slice(0, 80),
        content: tipForm.detailed_text || tipForm.tip_text,
        category: tipForm.category,
        published: true
      }]);
      if (error) throw error;
      toast({ title: 'Tip added successfully!' });
      setNewTipOpen(false);
      setTipForm({ tip_text: '', headline: '', detailed_text: '', why_it_matters: '', action_step: '', week_number: '', year: new Date().getFullYear().toString(), category: 'general', risk_level: 'medium', difficulty: 'beginner', is_banner: false });
      fetchData();
    } catch { toast({ variant: 'destructive', title: 'Error adding tip' }); }
  };

  const handleDeleteTip = async (tipId: string) => {
    if (!confirm('Are you sure you want to delete this tip?')) return;
    try {
      const { error } = await supabase.from('weekly_tips').delete().eq('id', tipId);
      if (error) throw error;
      toast({ title: 'Tip deleted successfully!' });
      fetchData();
    } catch { toast({ variant: 'destructive', title: 'Error deleting tip' }); }
  };

  const handleAddBlog = async () => {
    if (!blogForm.title || !blogForm.slug || !blogForm.content) return;
    try {
      const { error } = await supabase.from('blog_posts').insert([{
        title: blogForm.title, slug: blogForm.slug, excerpt: blogForm.excerpt,
        content: blogForm.content, category: blogForm.category,
        is_published: blogForm.is_published, author_id: user!.id,
      }]);
      if (error) throw error;
      toast({ title: 'Blog post created!' });
      setNewBlogOpen(false);
      setBlogForm({ title: '', slug: '', excerpt: '', content: '', category: 'general', is_published: false });
      fetchData();
    } catch { toast({ variant: 'destructive', title: 'Error creating blog' }); }
  };

  const handleToggleBlogPublish = async (blogId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('blog_posts').update({ is_published: !currentStatus }).eq('id', blogId);
      if (error) throw error;
      toast({ title: `Blog ${!currentStatus ? 'published' : 'unpublished'}!` });
      fetchData();
    } catch { toast({ variant: 'destructive', title: 'Error updating blog' }); }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', blogId);
      if (error) throw error;
      toast({ title: 'Blog deleted!' });
      fetchData();
    } catch { toast({ variant: 'destructive', title: 'Error deleting blog' }); }
  };

  const handleApproveReview = async (reviewId: string, approve: boolean) => {
    try {
      const { error } = await supabase.from('reviews').update({ is_approved: approve }).eq('id', reviewId);
      if (error) throw error;
      toast({ title: `Review ${approve ? 'approved' : 'rejected'}!` });
      fetchData();
    } catch { toast({ variant: 'destructive', title: 'Error updating review' }); }
  };

  const handleToggleReviewVisibility = async (reviewId: string, currentHidden: boolean) => {
    try {
      const { error } = await supabase.from('reviews').update({ is_hidden: !currentHidden }).eq('id', reviewId);
      if (error) throw error;
      toast({ title: `Review ${!currentHidden ? 'hidden' : 'visible'}!` });
      fetchData();
    } catch { toast({ variant: 'destructive', title: 'Error updating review' }); }
  };

  const handleAddModule = async () => {
    if (!moduleForm.title || !moduleForm.slug) return;
    try {
      const { error } = await supabase.from('learning_modules').insert([{
        title: moduleForm.title, slug: moduleForm.slug,
        description: moduleForm.description, order_index: parseInt(moduleForm.order_index) || 0, content: {},
      }]);
      if (error) throw error;
      toast({ title: 'Module created!' });
      setNewModuleOpen(false);
      setModuleForm({ title: '', slug: '', description: '', order_index: '0' });
      fetchData();
    } catch { toast({ variant: 'destructive', title: 'Error creating module' }); }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? This will also delete all related completions.')) return;
    try {
      await supabase.from('module_completions').delete().eq('module_id', moduleId);
      const { error } = await supabase.from('learning_modules').delete().eq('id', moduleId);
      if (error) throw error;
      toast({ title: 'Module deleted!' });
      fetchData();
    } catch { toast({ variant: 'destructive', title: 'Error deleting module' }); }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <QuickActions onRefresh={fetchData} />
            <AdminStats stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActivityChart data={[]} />
              </div>
              <div>
                <RecentActivity activities={recentActivities} />
              </div>
            </div>
          </div>
        );

      case 'users':
        return <UserManagement users={users} onRefresh={fetchData} />;

      case 'content':
        return (
          <Tabs defaultValue="modules" className="space-y-6">
            <TabsList>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="tips">Weekly Tips</TabsTrigger>
              <TabsTrigger value="blogs">Blog Posts</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="modules">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Learning Modules</CardTitle>
                      <CardDescription>Manage course modules</CardDescription>
                    </div>
                    <Dialog open={newModuleOpen} onOpenChange={setNewModuleOpen}>
                      <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />Add Module</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Module</DialogTitle>
                          <DialogDescription>Create a new learning module</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={moduleForm.title} onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})} placeholder="Module title" />
                          </div>
                          <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input value={moduleForm.slug} onChange={(e) => setModuleForm({...moduleForm, slug: e.target.value})} placeholder="module-slug" />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={moduleForm.description} onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})} placeholder="Module description" />
                          </div>
                          <div className="space-y-2">
                            <Label>Order Index</Label>
                            <Input type="number" value={moduleForm.order_index} onChange={(e) => setModuleForm({...moduleForm, order_index: e.target.value})} />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNewModuleOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddModule}>Create Module</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {modules.map((module) => (
                      <div key={module.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                        <div>
                          <p className="font-medium">{module.title}</p>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Order: {module.order_index}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteModule(module.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Weekly Tips</CardTitle>
                      <CardDescription>Manage security tips</CardDescription>
                    </div>
                    <Dialog open={newTipOpen} onOpenChange={setNewTipOpen}>
                      <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />Add Tip</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Tip</DialogTitle>
                          <DialogDescription>Create a new weekly security tip</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Tip Text</Label>
                            <Textarea value={tipForm.tip_text} onChange={(e) => setTipForm({...tipForm, tip_text: e.target.value})} placeholder="Enter your security tip..." />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Week Number</Label>
                              <Input type="number" min="1" max="52" value={tipForm.week_number} onChange={(e) => setTipForm({...tipForm, week_number: e.target.value})} placeholder="1-52" />
                            </div>
                            <div className="space-y-2">
                              <Label>Year</Label>
                              <Input type="number" value={tipForm.year} onChange={(e) => setTipForm({...tipForm, year: e.target.value})} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Category</Label>
                              <Select value={tipForm.category} onValueChange={(v) => setTipForm({...tipForm, category: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">General</SelectItem>
                                  <SelectItem value="phishing">Phishing</SelectItem>
                                  <SelectItem value="passwords">Passwords</SelectItem>
                                  <SelectItem value="privacy">Privacy</SelectItem>
                                  <SelectItem value="malware">Malware</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Risk Level</Label>
                              <Select value={tipForm.risk_level} onValueChange={(v) => setTipForm({...tipForm, risk_level: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={tipForm.is_banner} onCheckedChange={(c) => setTipForm({...tipForm, is_banner: c})} />
                            <Label>Show as banner</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNewTipOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddTip}>Add Tip</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {tips.map((tip) => (
                      <div key={tip.id} className="flex items-start justify-between p-4 rounded-lg border border-border/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">Week {tip.week_number}, {tip.year}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${tip.risk_level === 'critical' ? 'bg-destructive/20 text-destructive' : tip.risk_level === 'high' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'}`}>
                              {tip.risk_level}
                            </span>
                            {tip.is_banner && <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">Banner</span>}
                          </div>
                          <p className="text-sm">{tip.tip_text}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteTip(tip.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blogs">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Blog Posts</CardTitle>
                      <CardDescription>Manage blog content</CardDescription>
                    </div>
                    <Dialog open={newBlogOpen} onOpenChange={setNewBlogOpen}>
                      <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />Add Post</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create Blog Post</DialogTitle>
                          <DialogDescription>Write a new blog article</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input value={blogForm.title} onChange={(e) => setBlogForm({...blogForm, title: e.target.value})} placeholder="Post title" />
                            </div>
                            <div className="space-y-2">
                              <Label>Slug</Label>
                              <Input value={blogForm.slug} onChange={(e) => setBlogForm({...blogForm, slug: e.target.value})} placeholder="post-slug" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Excerpt</Label>
                            <Input value={blogForm.excerpt} onChange={(e) => setBlogForm({...blogForm, excerpt: e.target.value})} placeholder="Short description" />
                          </div>
                          <div className="space-y-2">
                            <Label>Content (Markdown)</Label>
                            <Textarea className="min-h-[200px]" value={blogForm.content} onChange={(e) => setBlogForm({...blogForm, content: e.target.value})} placeholder="Write your post content..." />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="space-y-2 flex-1">
                              <Label>Category</Label>
                              <Select value={blogForm.category} onValueChange={(v) => setBlogForm({...blogForm, category: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">General</SelectItem>
                                  <SelectItem value="news">News</SelectItem>
                                  <SelectItem value="tutorial">Tutorial</SelectItem>
                                  <SelectItem value="security">Security</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                              <Switch checked={blogForm.is_published} onCheckedChange={(c) => setBlogForm({...blogForm, is_published: c})} />
                              <Label>Publish immediately</Label>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNewBlogOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddBlog}>Create Post</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {blogs.map((blog) => (
                      <div key={blog.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{blog.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded ${blog.is_published ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                              {blog.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{blog.excerpt}</p>
                          <p className="text-xs text-muted-foreground mt-1">{blog.views || 0} views</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleToggleBlogPublish(blog.id, blog.is_published)}>
                            {blog.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteBlog(blog.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>User Reviews</CardTitle>
                  <CardDescription>Manage platform reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 rounded-lg border border-border/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.user_name}</span>
                              <span className="text-warning">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${review.is_approved ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                                {review.is_approved ? 'Approved' : 'Pending'}
                              </span>
                            </div>
                            <p className="text-sm">{review.review_text}</p>
                          </div>
                          <div className="flex gap-1">
                            {!review.is_approved && (
                              <>
                                <Button variant="ghost" size="icon" className="text-success" onClick={() => handleApproveReview(review.id, true)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleApproveReview(review.id, false)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleToggleReviewVisibility(review.id, review.is_hidden)}>
                              {review.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        );

      case 'analytics':
        return (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="live">Live</TabsTrigger>
              <TabsTrigger value="courses">Course Effectiveness</TabsTrigger>
              <TabsTrigger value="ai">AI Usage</TabsTrigger>
              <TabsTrigger value="gamification">Gamification</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="overview"><AnalyticsDashboard /></TabsContent>
            <TabsContent value="live"><LiveDashboard /></TabsContent>
            <TabsContent value="courses"><CourseEffectiveness /></TabsContent>
            <TabsContent value="ai"><AIAnalyticsDashboard /></TabsContent>
            <TabsContent value="gamification"><GamificationAnalytics /></TabsContent>
            <TabsContent value="security"><SecurityAnalytics /></TabsContent>
          </Tabs>
        );

      case 'moderation':
        return <CommunityModeration />;

      case 'certificates':
        return <CertificateManagement />;

      case 'audit':
        return <AuditLog />;

      case 'feedback':
        return <FeedbackDashboard />;

      default:
        return null;
    }
  };

  const sectionTitles: Record<string, { title: string; description: string }> = {
    overview: { title: 'Dashboard Overview', description: 'Platform summary and quick actions' },
    users: { title: 'User Management', description: 'View and manage user accounts' },
    content: { title: 'Content Management', description: 'Manage modules, tips, blogs, and reviews' },
    analytics: { title: 'Analytics', description: 'Platform metrics and insights' },
    moderation: { title: 'Community Moderation', description: 'Moderate forum posts and replies' },
    certificates: { title: 'Certificate Management', description: 'View and manage certificates' },
    audit: { title: 'Audit Log', description: 'Track system and admin activities' },
    feedback: { title: 'Feedback', description: 'Manage user feedback and surveys' },
  };

  const currentSection = sectionTitles[activeTab] || sectionTitles.overview;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Admin Header */}
          <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden sm:block">
                <h1 className="text-sm font-semibold">{currentSection.title}</h1>
                <p className="text-xs text-muted-foreground">{currentSection.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AdminNotifications />
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Site</span>
                </Button>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
