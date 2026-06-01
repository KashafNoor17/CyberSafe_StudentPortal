import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (data) {
        setPosts(data);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching posts:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    return post.title.toLowerCase().includes(search.toLowerCase()) ||
           post.excerpt?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold font-display mb-4">
            <span className="cyber-gradient-text">CyberSafe</span> Blog
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Learn, explore, and stay updated on cybersecurity. Tutorials, safety tips, and guides for students.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="card-cyber text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No articles found. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <Card className="card-cyber h-full group">
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                        Read more <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}