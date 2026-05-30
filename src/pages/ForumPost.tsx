import { useState, useEffect, useCallback } from 'react';
 import { Link, useParams, useNavigate } from 'react-router-dom';
 import { 
   ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Clock, User,
   Pin, Lock, CheckCircle, Share2, Flag, Trash2, MoreVertical
 } from 'lucide-react';
 import { Header } from '@/components/Header';
 import { Footer } from '@/components/Footer';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader } from '@/components/ui/card';
 import { Textarea } from '@/components/ui/textarea';
 import { Badge } from '@/components/ui/badge';
 import { Avatar, AvatarFallback } from '@/components/ui/avatar';
 import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 import { formatDistanceToNow } from 'date-fns';
 
 interface Post {
   id: string;
   user_id: string;
   title: string;
   content: string;
   created_at: string;
   is_pinned: boolean;
   is_closed: boolean;
   is_solution_found: boolean;
   tags: string[];
   category_id: string;
   author_name: string;
 }
 
 interface Reply {
   id: string;
   user_id: string;
   content: string;
   created_at: string;
   is_solution: boolean;
   parent_reply_id: string | null;
   author_name: string;
   vote_count: number;
   user_vote: 'up' | 'down' | null;
 }
 
 export default function ForumPost() {
   const { id } = useParams<{ id: string }>();
   const { user, isAdmin } = useAuth();
   const navigate = useNavigate();
   const { toast } = useToast();
   const [post, setPost] = useState<Post | null>(null);
   const [replies, setReplies] = useState<Reply[]>([]);
   const [loading, setLoading] = useState(true);
   const [replyContent, setReplyContent] = useState('');
   const [submitting, setSubmitting] = useState(false);
   const [postVote, setPostVote] = useState<'up' | 'down' | null>(null);
   const [postVoteCount, setPostVoteCount] = useState(0);
 
   useEffect(() => {
     if (id) {
       fetchPost();
       fetchReplies();
     }
   }, [id, user]);
 
   const fetchPost = async () => {
     try {
      // Fetch post first
      const { data: postData } = await supabase
         .from('forum_posts')
        .select('*')
         .eq('id', id)
         .single();
 
      if (postData) {
        // Fetch author name from public profiles view
        const { data: authorData } = await supabase
          .from('profiles_public')
          .select('name')
          .eq('user_id', postData.user_id)
          .single();

         setPost({
          ...postData,
          author_name: authorData?.name || 'Anonymous',
         });
 
         // Fetch vote count and user's vote
         const { data: votes } = await supabase
           .from('forum_votes')
           .select('vote_type, user_id')
           .eq('post_id', id);
 
         const voteCount = votes?.reduce((acc, v) => acc + (v.vote_type === 'up' ? 1 : -1), 0) || 0;
         setPostVoteCount(voteCount);
 
         if (user) {
           const userVote = votes?.find((v) => v.user_id === user.id);
           setPostVote(userVote?.vote_type as 'up' | 'down' | null);
         }
       }
     } catch (error) {
       if (import.meta.env.DEV) {
         console.error('Error fetching post:', error);
       }
     }
   };
 
   const fetchReplies = async () => {
     setLoading(true);
     try {
      const { data: repliesData } = await supabase
         .from('forum_replies')
        .select('*')
         .eq('post_id', id)
         .order('created_at', { ascending: true });
 
      if (repliesData) {
         const repliesWithVotes = await Promise.all(
          repliesData.map(async (reply: any) => {
            // Fetch author name from public profiles view
            const { data: authorData } = await supabase
              .from('profiles_public')
              .select('name')
              .eq('user_id', reply.user_id)
              .single();

             const { data: votes } = await supabase
               .from('forum_votes')
               .select('vote_type, user_id')
               .eq('reply_id', reply.id);
 
             const voteCount = votes?.reduce((acc, v) => acc + (v.vote_type === 'up' ? 1 : -1), 0) || 0;
             const userVote = user ? votes?.find((v) => v.user_id === user.id)?.vote_type : null;
 
             return {
               id: reply.id,
               user_id: reply.user_id,
               content: reply.content,
               created_at: reply.created_at,
               is_solution: reply.is_solution,
               parent_reply_id: reply.parent_reply_id,
              author_name: authorData?.name || 'Anonymous',
               vote_count: voteCount,
               user_vote: userVote as 'up' | 'down' | null,
             };
           })
         );
         setReplies(repliesWithVotes);
       }
     } catch (error) {
       if (import.meta.env.DEV) {
         console.error('Error fetching replies:', error);
       }
     } finally {
       setLoading(false);
     }
   };
 
   const handleVote = async (type: 'up' | 'down', replyId?: string) => {
     if (!user) {
       navigate('/auth?mode=login');
       return;
     }
 
     try {
       const targetId = replyId ? { reply_id: replyId } : { post_id: id };
       const currentVote = replyId
         ? replies.find((r) => r.id === replyId)?.user_vote
         : postVote;
 
       if (currentVote === type) {
         // Remove vote
         await supabase
           .from('forum_votes')
           .delete()
           .eq('user_id', user.id)
           .match(targetId);
       } else {
         // Upsert vote
         await supabase.from('forum_votes').upsert(
           {
             user_id: user.id,
             ...targetId,
             vote_type: type,
           },
           { onConflict: replyId ? 'user_id,reply_id' : 'user_id,post_id' }
         );
       }
 
       // Refresh data
       if (replyId) {
         fetchReplies();
       } else {
         fetchPost();
       }
     } catch (error) {
       if (import.meta.env.DEV) {
         console.error('Error voting:', error);
       }
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'Failed to register vote',
       });
     }
   };
 
   const handleSubmitReply = async () => {
     if (!user) {
       navigate('/auth?mode=login');
       return;
     }
 
     if (!replyContent.trim()) {
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'Reply cannot be empty',
       });
       return;
     }
 
     setSubmitting(true);
     try {
       const { error } = await supabase.from('forum_replies').insert({
         post_id: id,
         user_id: user.id,
         content: replyContent.trim(),
       });
 
       if (error) throw error;
 
       setReplyContent('');
       fetchReplies();
       toast({
         title: 'Reply posted!',
         description: 'Your reply has been added to the discussion.',
       });
     } catch (error) {
       if (import.meta.env.DEV) {
         console.error('Error posting reply:', error);
       }
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'Failed to post reply',
       });
     } finally {
       setSubmitting(false);
     }
   };
 
    const handleMarkSolution = async (replyId: string) => {
      if (!user || post?.user_id !== user.id) return;

      try {
        // Call the secure RPC function to mark solution in a single transaction
        const { error } = await supabase.rpc('mark_reply_as_solution', {
          p_reply_id: replyId,
        });

        if (error) throw error;

        fetchPost();
        fetchReplies();
        toast({
          title: 'Solution marked!',
          description: 'This reply has been marked as the solution.',
        });
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error('Error marking solution:', error);
        }
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to mark reply as solution.',
        });
      }
    };
 
   const handleShare = () => {
     navigator.clipboard.writeText(window.location.href);
     toast({
       title: 'Link copied!',
       description: 'Post link has been copied to clipboard.',
     });
   };
 
   const handleDeletePost = async () => {
     if (!isAdmin) return;
 
     try {
       await supabase.from('forum_posts').delete().eq('id', id);
       navigate('/community');
       toast({
         title: 'Post deleted',
         description: 'The post has been removed.',
       });
     } catch (error) {
       if (import.meta.env.DEV) {
         console.error('Error deleting post:', error);
       }
     }
   };
 
   const handleTogglePin = async () => {
     if (!isAdmin || !post) return;
 
     try {
       await supabase
         .from('forum_posts')
         .update({ is_pinned: !post.is_pinned })
         .eq('id', id);
       fetchPost();
     } catch (error) {
       if (import.meta.env.DEV) {
         console.error('Error toggling pin:', error);
       }
     }
   };
 
   const handleToggleClose = async () => {
     if (!isAdmin || !post) return;
 
     try {
       await supabase
         .from('forum_posts')
         .update({ is_closed: !post.is_closed })
         .eq('id', id);
       fetchPost();
     } catch (error) {
       if (import.meta.env.DEV) {
         console.error('Error toggling close:', error);
       }
     }
   };
 
   if (loading && !post) {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
       </div>
     );
   }
 
   if (!post) {
     return (
       <div className="min-h-screen flex flex-col bg-background">
         <Header />
         <main className="flex-1 container mx-auto px-4 py-8 text-center">
           <h1 className="text-2xl font-bold mb-4">Post not found</h1>
           <Button asChild>
             <Link to="/community">Back to Community</Link>
           </Button>
         </main>
         <Footer />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen flex flex-col bg-background">
       <Header />
 
       <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
         {/* Back Button */}
         <Button variant="ghost" className="mb-4" asChild>
           <Link to={`/community/category/${post.category_id}`}>
             <ArrowLeft className="mr-2 h-4 w-4" />
             Back to Category
           </Link>
         </Button>
 
         {/* Post */}
         <Card className="mb-6">
           <CardHeader className="pb-3">
             <div className="flex items-start justify-between gap-4">
               <div className="flex-1">
                 <div className="flex items-center gap-2 flex-wrap mb-2">
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
                 <h1 className="text-2xl font-bold">{post.title}</h1>
               </div>
 
               {/* Admin Actions */}
               {isAdmin && (
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon">
                       <MoreVertical className="h-4 w-4" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={handleTogglePin}>
                       <Pin className="mr-2 h-4 w-4" />
                       {post.is_pinned ? 'Unpin' : 'Pin'} Post
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={handleToggleClose}>
                       <Lock className="mr-2 h-4 w-4" />
                       {post.is_closed ? 'Reopen' : 'Close'} Discussion
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={handleDeletePost} className="text-destructive">
                       <Trash2 className="mr-2 h-4 w-4" />
                       Delete Post
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               )}
             </div>
           </CardHeader>
           <CardContent>
             <div className="flex gap-4">
               {/* Voting */}
               <div className="flex flex-col items-center gap-1">
                 <Button
                   variant="ghost"
                   size="icon"
                   className={postVote === 'up' ? 'text-success' : ''}
                   onClick={() => handleVote('up')}
                 >
                   <ThumbsUp className="h-5 w-5" />
                 </Button>
                 <span className={`font-bold ${postVoteCount > 0 ? 'text-success' : postVoteCount < 0 ? 'text-destructive' : ''}`}>
                   {postVoteCount}
                 </span>
                 <Button
                   variant="ghost"
                   size="icon"
                   className={postVote === 'down' ? 'text-destructive' : ''}
                   onClick={() => handleVote('down')}
                 >
                   <ThumbsDown className="h-5 w-5" />
                 </Button>
               </div>
 
               {/* Content */}
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-4">
                   <Avatar className="h-8 w-8">
                     <AvatarFallback>{post.author_name[0]?.toUpperCase()}</AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="font-medium text-sm">{post.author_name}</p>
                     <p className="text-xs text-muted-foreground flex items-center gap-1">
                       <Clock className="h-3 w-3" />
                       {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                     </p>
                   </div>
                 </div>
 
                 <div className="prose prose-sm dark:prose-invert max-w-none">
                   <p className="whitespace-pre-wrap">{post.content}</p>
                 </div>
 
                 {post.tags.length > 0 && (
                   <div className="flex gap-1 mt-4 flex-wrap">
                     {post.tags.map((tag) => (
                       <Badge key={tag} variant="outline">
                         {tag}
                       </Badge>
                     ))}
                   </div>
                 )}
 
                 <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                   <Button variant="ghost" size="sm" onClick={handleShare}>
                     <Share2 className="mr-2 h-4 w-4" />
                     Share
                   </Button>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
 
         {/* Replies */}
         <div className="mb-6">
           <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
             <MessageSquare className="h-5 w-5" />
             {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
           </h2>
 
           <div className="space-y-4">
             {replies.map((reply) => (
               <Card key={reply.id} className={reply.is_solution ? 'border-success bg-success/5' : ''}>
                 <CardContent className="py-4">
                   <div className="flex gap-4">
                     {/* Voting */}
                     <div className="flex flex-col items-center gap-1">
                       <Button
                         variant="ghost"
                         size="icon"
                         className={`h-8 w-8 ${reply.user_vote === 'up' ? 'text-success' : ''}`}
                         onClick={() => handleVote('up', reply.id)}
                       >
                         <ThumbsUp className="h-4 w-4" />
                       </Button>
                       <span className={`text-sm font-bold ${reply.vote_count > 0 ? 'text-success' : reply.vote_count < 0 ? 'text-destructive' : ''}`}>
                         {reply.vote_count}
                       </span>
                       <Button
                         variant="ghost"
                         size="icon"
                         className={`h-8 w-8 ${reply.user_vote === 'down' ? 'text-destructive' : ''}`}
                         onClick={() => handleVote('down', reply.id)}
                       >
                         <ThumbsDown className="h-4 w-4" />
                       </Button>
                     </div>
 
                     {/* Content */}
                     <div className="flex-1">
                       {reply.is_solution && (
                         <Badge className="mb-2 bg-success">
                           <CheckCircle className="mr-1 h-3 w-3" /> Accepted Solution
                         </Badge>
                       )}
                       <div className="flex items-center gap-3 mb-3">
                         <Avatar className="h-6 w-6">
                           <AvatarFallback className="text-xs">{reply.author_name[0]?.toUpperCase()}</AvatarFallback>
                         </Avatar>
                         <p className="font-medium text-sm">{reply.author_name}</p>
                         <span className="text-xs text-muted-foreground">
                           {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                         </span>
                       </div>
                       <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
 
                       {/* Mark as solution button */}
                       {user && post.user_id === user.id && !reply.is_solution && (
                         <Button
                           variant="outline"
                           size="sm"
                           className="mt-3"
                           onClick={() => handleMarkSolution(reply.id)}
                         >
                           <CheckCircle className="mr-2 h-4 w-4" />
                           Mark as Solution
                         </Button>
                       )}
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         </div>
 
         {/* Reply Form */}
         {!post.is_closed ? (
           <Card>
             <CardContent className="py-4">
               <h3 className="font-semibold mb-3">Add a Reply</h3>
               {user ? (
                 <>
                   <Textarea
                     placeholder="Write your reply..."
                     value={replyContent}
                     onChange={(e) => setReplyContent(e.target.value)}
                     rows={4}
                     className="mb-3"
                   />
                   <Button onClick={handleSubmitReply} disabled={submitting}>
                     {submitting ? 'Posting...' : 'Post Reply'}
                   </Button>
                 </>
               ) : (
                 <div className="text-center py-4">
                   <p className="text-muted-foreground mb-3">Sign in to join the discussion</p>
                   <Button asChild>
                     <Link to="/auth?mode=login">Sign In</Link>
                   </Button>
                 </div>
               )}
             </CardContent>
           </Card>
         ) : (
           <Card className="bg-muted/50">
             <CardContent className="py-4 text-center">
               <Lock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
               <p className="text-muted-foreground">This discussion has been closed</p>
             </CardContent>
           </Card>
         )}
       </main>
 
       <Footer />
     </div>
   );
 }