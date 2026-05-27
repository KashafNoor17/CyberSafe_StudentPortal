import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Eye, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  created_at: string;
  views: number;
  featured_image: string | null;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error || !data) {
        navigate('/blog');
        return;
      }

      setPost(data);

      // Increment views
      await supabase
        .from('blog_posts')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching post:', error);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <Link 
          to="/blog"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <article className="animate-fade-in">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views} views
              </div>
            </div>

            {post.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img 
                src={post.featured_image} 
                alt={post.title}
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          )}

          {/* Content */}
          <Card className="card-cyber">
            <CardContent className="pt-8 prose prose-invert max-w-none">
              <div 
                className="text-foreground leading-relaxed whitespace-pre-wrap"
                style={{ 
                  fontSize: '1.05rem',
                  lineHeight: '1.8'
                }}
              >
                {post.content}
              </div>
            </CardContent>
          </Card>
        </article>
      </main>

      <Footer />
    </div>
  );
}
