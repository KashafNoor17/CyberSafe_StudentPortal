 import { useState, useEffect } from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import { 
   MessageSquare, Shield, BookOpen, HelpCircle, Link as LinkIcon, 
  Trophy, Plus, TrendingUp, Clock, Search
 } from 'lucide-react';
 import { Header } from '@/components/Header';
 import { Footer } from '@/components/Footer';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Badge } from '@/components/ui/badge';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { formatDistanceToNow } from 'date-fns';
 import { T } from '@/components/T';
 
 interface Category {
   id: string;
   name: string;
   description: string;
   icon: string;
   order_index: number;
   post_count?: number;
 }
 
 interface RecentPost {
   id: string;
   title: string;
   created_at: string;
   category_id: string;
   author_name: string;
   reply_count: number;
 }
 
 const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
   Shield,
   BookOpen,
   HelpCircle,
   Link: LinkIcon,
   Trophy,
   MessageSquare,
 };
 
 export default function Community() {
   const { user } = useAuth();
   const navigate = useNavigate();
   const [categories, setCategories] = useState<Category[]>([]);
   const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     fetchData();
   }, [user]);
 
   const fetchData = async () => {
     try {
       const { data: categoriesData } = await supabase
         .from('forum_categories')
         .select('*')
         .order('order_index');
 
       if (categoriesData) {
         const categoriesWithCounts = await Promise.all(
           categoriesData.map(async (cat) => {
             const { count } = await supabase
               .from('forum_posts')
               .select('*', { count: 'exact', head: true })
               .eq('category_id', cat.id);
             return { ...cat, post_count: count || 0 };
           })
         );
         setCategories(categoriesWithCounts);
       }
 
      const { data: postsData } = await supabase
         .from('forum_posts')
        .select('id, title, created_at, category_id, user_id')
         .order('created_at', { ascending: false })
         .limit(5);
 
       if (postsData) {
         const postsWithReplies = await Promise.all(
           postsData.map(async (post: any) => {
            const { data: authorData } = await supabase
              .from('profiles_public')
              .select('name')
              .eq('user_id', post.user_id)
              .single();

             const { count } = await supabase
               .from('forum_replies')
               .select('*', { count: 'exact', head: true })
               .eq('post_id', post.id);
             return {
               id: post.id,
               title: post.title,
               created_at: post.created_at,
               category_id: post.category_id,
              author_name: authorData?.name || 'Anonymous',
               reply_count: count || 0,
             };
           })
         );
         setRecentPosts(postsWithReplies);
       }
     } catch (error) {
       if (import.meta.env.DEV) {
         console.error('Error fetching community data:', error);
       }
     } finally {
       setLoading(false);
     }
   };
 
   const handleCreatePost = () => {
     if (!user) {
       navigate('/auth?mode=login');
       return;
     }
     navigate('/community/new-post');
   };
 
   if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen flex flex-col bg-background">
       <Header />
 
       <main className="flex-1 container mx-auto px-4 py-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
             <h1 className="text-3xl font-bold"><T>CyberSafe Community</T></h1>
             <p className="text-muted-foreground">
               <T>Connect, learn, and share with fellow cybersecurity enthusiasts</T>
             </p>
           </div>
           <div className="flex items-center gap-3">
             <Button onClick={handleCreatePost}>
               <Plus className="mr-2 h-4 w-4" />
               <T>Create Post</T>
             </Button>
           </div>
         </div>
 
         <div className="relative mb-8">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Search discussions..."
             className="pl-10"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
         </div>
 
         <div className="grid lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
             <h2 className="text-xl font-semibold mb-4"><T>Categories</T></h2>
             <div className="grid sm:grid-cols-2 gap-4">
               {categories.map((category) => {
                 const IconComponent = iconMap[category.icon] || MessageSquare;
                 return (
                   <Link key={category.id} to={`/community/category/${category.id}`}>
                     <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                       <CardHeader className="pb-2">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                             <IconComponent className="h-5 w-5 text-primary" />
                           </div>
                           <div className="flex-1">
                             <CardTitle className="text-lg">{category.name}</CardTitle>
                             <Badge variant="secondary" className="mt-1">
                               {category.post_count} <T>posts</T>
                             </Badge>
                           </div>
                         </div>
                       </CardHeader>
                       <CardContent>
                         <CardDescription>{category.description}</CardDescription>
                       </CardContent>
                     </Card>
                   </Link>
                 );
               })}
             </div>
 
             <Card className="mt-6 bg-primary/5 border-primary/20">
               <CardContent className="py-4">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <Shield className="h-5 w-5 text-primary" />
                     <span className="font-medium"><T>Community Guidelines</T></span>
                   </div>
                   <Button variant="link" asChild>
                     <Link to="/community/guidelines"><T>Read Guidelines</T> →</Link>
                   </Button>
                 </div>
               </CardContent>
             </Card>
           </div>
 
           <div className="space-y-6">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-lg">
                   <TrendingUp className="h-5 w-5" />
                   <T>Recent Discussions</T>
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 {recentPosts.length === 0 ? (
                   <p className="text-muted-foreground text-sm"><T>No discussions yet. Be the first to post!</T></p>
                 ) : (
                   recentPosts.map((post) => (
                     <Link key={post.id} to={`/community/post/${post.id}`} className="block">
                       <div className="group">
                         <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                           {post.title}
                         </h4>
                         <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                           <span>{post.author_name}</span>
                           <span>•</span>
                           <span className="flex items-center gap-1">
                             <MessageSquare className="h-3 w-3" />
                             {post.reply_count}
                           </span>
                           <span>•</span>
                           <span className="flex items-center gap-1">
                             <Clock className="h-3 w-3" />
                             {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                           </span>
                         </div>
                       </div>
                     </Link>
                   ))
                 )}
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader>
                 <CardTitle className="text-lg"><T>Community Stats</T></CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="text-center p-3 bg-muted/50 rounded-lg">
                     <p className="text-2xl font-bold text-primary">
                       {categories.reduce((acc, cat) => acc + (cat.post_count || 0), 0)}
                     </p>
                     <p className="text-xs text-muted-foreground"><T>Total Posts</T></p>
                   </div>
                   <div className="text-center p-3 bg-muted/50 rounded-lg">
                     <p className="text-2xl font-bold text-primary">{categories.length}</p>
                     <p className="text-xs text-muted-foreground"><T>Categories</T></p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         </div>
       </main>
 
       <Footer />
     </div>
   );
 }
