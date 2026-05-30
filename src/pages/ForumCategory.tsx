 import { useState, useEffect } from 'react';
 import { Link, useParams, useNavigate } from 'react-router-dom';
 import { 
   ArrowLeft, MessageSquare, ThumbsUp, Clock, User, Plus,
   Pin, Lock, CheckCircle, Search, ChevronLeft, ChevronRight
 } from 'lucide-react';
 import { Header } from '@/components/Header';
 import { Footer } from '@/components/Footer';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Badge } from '@/components/ui/badge';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { formatDistanceToNow } from 'date-fns';
 
 interface Category {
   id: string;
   name: string;
   description: string;
 }
 
 interface Post {
   id: string;
   title: string;
   content: string;
   created_at: string;
   is_pinned: boolean;
   is_closed: boolean;
   is_solution_found: boolean;
   tags: string[];
   author_name: string;
   reply_count: number;
   vote_count: number;
 }
 
 const POSTS_PER_PAGE = 10;
 
 export default function ForumCategory() {
   const { id } = useParams<{ id: string }>();
   const { user } = useAuth();
   const navigate = useNavigate();
   const [category, setCategory] = useState<Category | null>(null);
   const [posts, setPosts] = useState<Post[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [sortBy, setSortBy] = useState('newest');
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPosts, setTotalPosts] = useState(0);
 
   useEffect(() => {
     if (id) {
       fetchCategory();
       fetchPosts();
     }
   }, [id, sortBy, currentPage]);
 
   const fetchCategory = async () => {
     const { data } = await supabase
       .from('forum_categories')
       .select('*')
       .eq('id', id)
       .single();
     if (data) setCategory(data);
   };
 
   const fetchPosts = async () => {
     setLoading(true);
     try {
       // Get total count
       const { count } = await supabase
         .from('forum_posts')
         .select('*', { count: 'exact', head: true })
         .eq('category_id', id);
       setTotalPosts(count || 0);
 
       // Build query based on sort
       let query = supabase
         .from('forum_posts')
        .select('id, title, content, created_at, is_pinned, is_closed, is_solution_found, tags, user_id')
         .eq('category_id', id);
 
       // Apply sorting
       if (sortBy === 'newest') {
         query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
       } else if (sortBy === 'oldest') {
         query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: true });
       }
 
       // Apply pagination
       const from = (currentPage - 1) * POSTS_PER_PAGE;
       query = query.range(from, from + POSTS_PER_PAGE - 1);
 
       const { data } = await query;
 
       if (data) {
         // Fetch reply counts and vote counts
         const postsWithCounts = await Promise.all(
           data.map(async (post: any) => {
             // Fetch author name from public profiles view
             const { data: authorData } = await supabase
               .from('profiles_public')
               .select('name')
               .eq('user_id', post.user_id)
               .single();

             const [{ count: replyCount }, { data: votes }] = await Promise.all([
               supabase
                 .from('forum_replies')
                 .select('*', { count: 'exact', head: true })
                 .eq('post_id', post.id),
               supabase
                 .from('forum_votes')
                 .select('vote_type')
                 .eq('post_id', post.id),
             ]);
 
             const voteCount = votes?.reduce((acc, v) => acc + (v.vote_type === 'up' ? 1 : -1), 0) || 0;
 
             return {
               id: post.id,
               title: post.title,
               content: post.content,
               created_at: post.created_at,
               is_pinned: post.is_pinned,
               is_closed: post.is_closed,
               is_solution_found: post.is_solution_found,
               tags: post.tags || [],
              author_name: authorData?.name || 'Anonymous',
               reply_count: replyCount || 0,
               vote_count: voteCount,
             };
           })
         );
 
         // Sort by votes if needed
         if (sortBy === 'most_upvoted') {
           postsWithCounts.sort((a, b) => {
             if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
             return b.vote_count - a.vote_count;
           });
         } else if (sortBy === 'most_replies') {
           postsWithCounts.sort((a, b) => {
             if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
             return b.reply_count - a.reply_count;
           });
         }
 
         setPosts(postsWithCounts);
       }
     } catch (error) {
       if (import.meta.env.DEV) {
         console.error('Error fetching posts:', error);
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
     navigate(`/community/new-post?category=${id}`);
   };
 
   const filteredPosts = searchQuery
     ? posts.filter(
         (p) =>
           p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.content.toLowerCase().includes(searchQuery.toLowerCase())
       )
     : posts;
 
   const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
 
   if (loading && !category) {
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
         {/* Back Button */}
         <Button variant="ghost" className="mb-4" asChild>
           <Link to="/community">
             <ArrowLeft className="mr-2 h-4 w-4" />
             Back to Community
           </Link>
         </Button>
 
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
           <div>
             <h1 className="text-2xl font-bold">{category?.name}</h1>
             <p className="text-muted-foreground">{category?.description}</p>
           </div>
           <Button onClick={handleCreatePost}>
             <Plus className="mr-2 h-4 w-4" />
             New Post
           </Button>
         </div>
 
         {/* Filters */}
         <div className="flex flex-col sm:flex-row gap-4 mb-6">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Search in category..."
               className="pl-10"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <Select value={sortBy} onValueChange={setSortBy}>
             <SelectTrigger className="w-[180px]">
               <SelectValue placeholder="Sort by" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="newest">Newest</SelectItem>
               <SelectItem value="oldest">Oldest</SelectItem>
               <SelectItem value="most_replies">Most Replies</SelectItem>
               <SelectItem value="most_upvoted">Most Upvoted</SelectItem>
             </SelectContent>
           </Select>
         </div>
 
         {/* Posts List */}
         <div className="space-y-4">
           {loading ? (
             <div className="text-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
             </div>
           ) : filteredPosts.length === 0 ? (
             <Card>
               <CardContent className="py-12 text-center">
                 <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                 <h3 className="font-semibold mb-2">No posts yet</h3>
                 <p className="text-muted-foreground mb-4">Be the first to start a discussion!</p>
                 <Button onClick={handleCreatePost}>Create First Post</Button>
               </CardContent>
             </Card>
           ) : (
             filteredPosts.map((post) => (
               <Link key={post.id} to={`/community/post/${post.id}`}>
                 <Card className="hover:border-primary/50 transition-colors">
                   <CardContent className="py-4">
                     <div className="flex items-start gap-4">
                       {/* Vote Count */}
                       <div className="hidden sm:flex flex-col items-center text-center min-w-[60px]">
                         <span className={`text-lg font-bold ${post.vote_count > 0 ? 'text-success' : post.vote_count < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                           {post.vote_count}
                         </span>
                         <span className="text-xs text-muted-foreground">votes</span>
                       </div>
 
                       {/* Content */}
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 flex-wrap mb-1">
                           {post.is_pinned && (
                             <Badge variant="secondary" className="gap-1">
                               <Pin className="h-3 w-3" /> Pinned
                             </Badge>
                           )}
                           {post.is_closed && (
                             <Badge variant="outline" className="gap-1">
                               <Lock className="h-3 w-3" /> Closed
                             </Badge>
                           )}
                           {post.is_solution_found && (
                             <Badge className="gap-1 bg-success">
                               <CheckCircle className="h-3 w-3" /> Solved
                             </Badge>
                           )}
                         </div>
                         <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                           {post.title}
                         </h3>
                         <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                           {post.content}
                         </p>
                         <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                           <span className="flex items-center gap-1">
                             <User className="h-3 w-3" />
                             {post.author_name}
                           </span>
                           <span className="flex items-center gap-1">
                             <MessageSquare className="h-3 w-3" />
                             {post.reply_count} replies
                           </span>
                           <span className="flex items-center gap-1">
                             <Clock className="h-3 w-3" />
                             {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                           </span>
                           <span className="sm:hidden flex items-center gap-1">
                             <ThumbsUp className="h-3 w-3" />
                             {post.vote_count}
                           </span>
                         </div>
                         {post.tags.length > 0 && (
                           <div className="flex gap-1 mt-2 flex-wrap">
                             {post.tags.slice(0, 3).map((tag) => (
                               <Badge key={tag} variant="outline" className="text-xs">
                                 {tag}
                               </Badge>
                             ))}
                           </div>
                         )}
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </Link>
             ))
           )}
         </div>
 
         {/* Pagination */}
         {totalPages > 1 && (
           <div className="flex items-center justify-center gap-2 mt-8">
             <Button
               variant="outline"
               size="icon"
               disabled={currentPage === 1}
               onClick={() => setCurrentPage((p) => p - 1)}
             >
               <ChevronLeft className="h-4 w-4" />
             </Button>
             <span className="text-sm text-muted-foreground">
               Page {currentPage} of {totalPages}
             </span>
             <Button
               variant="outline"
               size="icon"
               disabled={currentPage === totalPages}
               onClick={() => setCurrentPage((p) => p + 1)}
             >
               <ChevronRight className="h-4 w-4" />
             </Button>
           </div>
         )}
       </main>
 
       <Footer />
     </div>
   );
 }