import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Trash2, Pin, Lock, AlertTriangle, Eye, EyeOff, CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  is_pinned: boolean;
  is_closed: boolean;
  created_at: string;
  user_name?: string;
  reply_count?: number;
}

interface ForumReply {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at: string;
  user_name?: string;
  post_title?: string;
}

export function CommunityModeration() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch posts
      const { data: postsData } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch profiles for user names
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name');

      // Fetch reply counts
      const { data: repliesData } = await supabase
        .from('forum_replies')
        .select('post_id');

      if (postsData) {
        const postsWithDetails = postsData.map(post => {
          const profile = profilesData?.find(p => p.user_id === post.user_id);
          const replyCount = repliesData?.filter(r => r.post_id === post.id).length || 0;
          return {
            ...post,
            user_name: profile?.name || 'Unknown',
            reply_count: replyCount
          };
        });
        setPosts(postsWithDetails);
      }

      // Fetch recent replies
      const { data: recentReplies } = await supabase
        .from('forum_replies')
        .select('*, forum_posts(title)')
        .order('created_at', { ascending: false })
        .limit(30);

      if (recentReplies) {
        const repliesWithDetails = recentReplies.map(reply => {
          const profile = profilesData?.find(p => p.user_id === reply.user_id);
          return {
            ...reply,
            user_name: profile?.name || 'Unknown',
            post_title: (reply as any).forum_posts?.title || 'Unknown Post'
          };
        });
        setReplies(repliesWithDetails);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async (postId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_pinned: !currentPinned })
        .eq('id', postId);

      if (error) throw error;
      toast({ title: currentPinned ? 'Post unpinned' : 'Post pinned' });
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error updating post' });
    }
  };

  const handleToggleClosed = async (postId: string, currentClosed: boolean) => {
    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_closed: !currentClosed })
        .eq('id', postId);

      if (error) throw error;
      toast({ title: currentClosed ? 'Discussion reopened' : 'Discussion closed' });
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error updating post' });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this post and all its replies?')) return;

    try {
      await supabase.from('forum_replies').delete().eq('post_id', postId);
      await supabase.from('forum_votes').delete().eq('post_id', postId);
      const { error } = await supabase.from('forum_posts').delete().eq('id', postId);

      if (error) throw error;
      toast({ title: 'Post deleted' });
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error deleting post' });
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Delete this reply?')) return;

    try {
      await supabase.from('forum_votes').delete().eq('reply_id', replyId);
      const { error } = await supabase.from('forum_replies').delete().eq('id', replyId);

      if (error) throw error;
      toast({ title: 'Reply deleted' });
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error deleting reply' });
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Community Moderation
        </CardTitle>
        <CardDescription>Manage forum posts and replies</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="posts">
          <TabsList className="mb-4">
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="replies">Recent Replies ({replies.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {posts.map((post) => (
                <div key={post.id} className="flex items-start justify-between p-4 rounded-lg border border-border/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{post.title}</span>
                      {post.is_pinned && <Badge variant="secondary"><Pin className="h-3 w-3" /></Badge>}
                      {post.is_closed && <Badge variant="outline"><Lock className="h-3 w-3" /></Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{post.content}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>by {post.user_name}</span>
                      <span>{post.reply_count} replies</span>
                      <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePin(post.id, post.is_pinned)}
                      title={post.is_pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className={`h-4 w-4 ${post.is_pinned ? 'text-primary' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleClosed(post.id, post.is_closed)}
                      title={post.is_closed ? 'Reopen' : 'Close'}
                    >
                      <Lock className={`h-4 w-4 ${post.is_closed ? 'text-warning' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeletePost(post.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="replies">
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {replies.map((reply) => (
                <div key={reply.id} className="flex items-start justify-between p-4 rounded-lg border border-border/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">
                      On: <span className="text-foreground">{reply.post_title}</span>
                    </p>
                    <p className="text-sm line-clamp-2">{reply.content}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>by {reply.user_name}</span>
                      <span>{formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive ml-2"
                    onClick={() => handleDeleteReply(reply.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
