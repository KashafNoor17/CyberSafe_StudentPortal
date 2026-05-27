import { useEffect, useState } from 'react';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  user_id: string;
}

export default function Reviews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkUserReview();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (data) {
        setReviews(data);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching reviews:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    setHasSubmitted(!!data);
  };

  const handleSubmit = async () => {
    if (!user || !reviewText.trim() || submitting) return;

    // Client-side validation
    if (reviewText.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: 'Review Too Short',
        description: 'Please write at least 10 characters.',
      });
      return;
    }

    if (reviewText.length > 500) {
      toast({
        variant: 'destructive',
        title: 'Review Too Long',
        description: 'Please keep your review under 500 characters.',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Use secure RPC function instead of direct insert
      const { data, error } = await supabase.rpc('submit_review', {
        p_rating: rating,
        p_review_text: reviewText.trim()
      });

      if (error) throw error;
      
      const result = data as { success: boolean; message?: string; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit review');
      }

      // Check for new badges (Community Voice)
      await supabase.rpc('check_and_award_badges');

      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your feedback. Your review is pending approval.',
      });

      setReviewText('');
      setHasSubmitted(true);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error submitting review:', error);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit review. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold font-display mb-4">
            <span className="cyber-gradient-text">Student</span> Reviews
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            See what our students are saying about CyberSafe Student Portal.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="card-cyber animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">{averageRating}</div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${star <= Math.round(Number(averageRating)) ? 'text-warning fill-warning' : 'text-muted'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
          
          <Card className="card-cyber animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-secondary mb-2">{reviews.length}</div>
              <MessageSquare className="h-5 w-5 mx-auto mb-2 text-secondary" />
              <p className="text-sm text-muted-foreground">Total Reviews</p>
            </CardContent>
          </Card>

          <Card className="card-cyber animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-accent mb-2">
                {reviews.filter(r => r.rating >= 4).length}
              </div>
              <Star className="h-5 w-5 mx-auto mb-2 text-accent fill-accent" />
              <p className="text-sm text-muted-foreground">5-Star Reviews</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Submit Review */}
          <div className="lg:col-span-1">
            <Card className="card-cyber sticky top-24 animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <CardHeader>
                <CardTitle className="text-lg">Share Your Experience</CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <p className="text-muted-foreground text-sm">
                    Please <a href="/auth?mode=login" className="text-primary hover:underline">log in</a> to submit a review.
                  </p>
                ) : hasSubmitted ? (
                  <p className="text-muted-foreground text-sm">
                    Thank you! You've already submitted a review.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star 
                              className={`h-8 w-8 transition-colors ${
                                star <= rating ? 'text-warning fill-warning' : 'text-muted hover:text-warning'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Review</label>
                      <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience with CyberSafe..."
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {reviewText.length}/500 characters
                      </p>
                    </div>

                    <Button 
                      onClick={handleSubmit}
                      disabled={!reviewText.trim() || submitting}
                      className="w-full cyber-gradient"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <Card className="card-cyber text-center py-12">
                <CardContent>
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <Card 
                    key={review.id} 
                    className="card-cyber animate-fade-in"
                    style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`h-4 w-4 ${star <= review.rating ? 'text-warning fill-warning' : 'text-muted'}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-foreground">{review.review_text}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}