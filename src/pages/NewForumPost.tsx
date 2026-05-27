 import { useState, useEffect } from 'react';
 import { Link, useNavigate, useSearchParams } from 'react-router-dom';
 import { ArrowLeft, Eye, EyeOff, X } from 'lucide-react';
 import { Header } from '@/components/Header';
 import { Footer } from '@/components/Footer';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Label } from '@/components/ui/label';
 import { Badge } from '@/components/ui/badge';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 
 interface Category {
   id: string;
   name: string;
 }
 
 export default function NewForumPost() {
   const { user, loading: authLoading } = useAuth();
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const { toast } = useToast();
   
   const [categories, setCategories] = useState<Category[]>([]);
   const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
   const [title, setTitle] = useState('');
   const [content, setContent] = useState('');
   const [tags, setTags] = useState<string[]>([]);
   const [tagInput, setTagInput] = useState('');
   const [showPreview, setShowPreview] = useState(false);
   const [submitting, setSubmitting] = useState(false);
 
   useEffect(() => {
     if (!authLoading && !user) {
       navigate('/auth?mode=login');
     }
   }, [user, authLoading, navigate]);
 
   useEffect(() => {
     fetchCategories();
   }, []);
 
   const fetchCategories = async () => {
     const { data } = await supabase
       .from('forum_categories')
       .select('id, name')
       .order('order_index');
     if (data) setCategories(data);
   };
 
   const handleAddTag = () => {
     const tag = tagInput.trim().toLowerCase();
     if (tag && !tags.includes(tag) && tags.length < 5) {
       setTags([...tags, tag]);
       setTagInput('');
     }
   };
 
   const handleRemoveTag = (tagToRemove: string) => {
     setTags(tags.filter((t) => t !== tagToRemove));
   };
 
   const handleSubmit = async () => {
     if (!user) return;
 
     if (!selectedCategory) {
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'Please select a category',
       });
       return;
     }
 
     if (!title.trim()) {
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'Please enter a title',
       });
       return;
     }
 
     if (title.trim().length < 10) {
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'Title must be at least 10 characters',
       });
       return;
     }
 
     if (!content.trim()) {
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'Please enter content',
       });
       return;
     }
 
     if (content.trim().length < 20) {
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'Content must be at least 20 characters',
       });
       return;
     }
 
     setSubmitting(true);
     try {
       const { data, error } = await supabase
         .from('forum_posts')
         .insert({
           user_id: user.id,
           category_id: selectedCategory,
           title: title.trim(),
           content: content.trim(),
           tags,
         })
         .select('id')
         .single();
 
       if (error) throw error;
 
       toast({
         title: 'Post created!',
         description: 'Your discussion has been published.',
       });
 
       navigate(`/community/post/${data.id}`);
     } catch (error) {
       if (import.meta.env.DEV) {
         console.error('Error creating post:', error);
       }
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'Failed to create post. Please try again.',
       });
     } finally {
       setSubmitting(false);
     }
   };
 
   if (authLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen flex flex-col bg-background">
       <Header />
 
       <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
         {/* Back Button */}
         <Button variant="ghost" className="mb-4" asChild>
           <Link to="/community">
             <ArrowLeft className="mr-2 h-4 w-4" />
             Back to Community
           </Link>
         </Button>
 
         <Card>
           <CardHeader>
             <div className="flex items-center justify-between">
               <CardTitle>Create New Post</CardTitle>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setShowPreview(!showPreview)}
               >
                 {showPreview ? (
                   <>
                     <EyeOff className="mr-2 h-4 w-4" />
                     Edit
                   </>
                 ) : (
                   <>
                     <Eye className="mr-2 h-4 w-4" />
                     Preview
                   </>
                 )}
               </Button>
             </div>
           </CardHeader>
           <CardContent>
             {showPreview ? (
               <div className="space-y-4">
                 <div>
                   <h2 className="text-xl font-bold">{title || 'Untitled'}</h2>
                   <p className="text-sm text-muted-foreground">
                     Category: {categories.find((c) => c.id === selectedCategory)?.name || 'None selected'}
                   </p>
                 </div>
                 <div className="prose prose-sm dark:prose-invert max-w-none">
                   <p className="whitespace-pre-wrap">{content || 'No content'}</p>
                 </div>
                 {tags.length > 0 && (
                   <div className="flex gap-1 flex-wrap">
                     {tags.map((tag) => (
                       <Badge key={tag} variant="outline">
                         {tag}
                       </Badge>
                     ))}
                   </div>
                 )}
               </div>
             ) : (
               <div className="space-y-6">
                 {/* Category */}
                 <div className="space-y-2">
                   <Label htmlFor="category">Category *</Label>
                   <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select a category" />
                     </SelectTrigger>
                     <SelectContent>
                       {categories.map((cat) => (
                         <SelectItem key={cat.id} value={cat.id}>
                           {cat.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
 
                 {/* Title */}
                 <div className="space-y-2">
                   <Label htmlFor="title">Title *</Label>
                   <Input
                     id="title"
                     placeholder="Enter a descriptive title"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     maxLength={200}
                   />
                   <p className="text-xs text-muted-foreground">{title.length}/200 characters</p>
                 </div>
 
                 {/* Content */}
                 <div className="space-y-2">
                   <Label htmlFor="content">Content *</Label>
                   <Textarea
                     id="content"
                     placeholder="Describe your question or topic in detail..."
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     rows={8}
                     maxLength={5000}
                   />
                   <p className="text-xs text-muted-foreground">{content.length}/5000 characters</p>
                 </div>
 
                 {/* Tags */}
                 <div className="space-y-2">
                   <Label htmlFor="tags">Tags (optional)</Label>
                   <div className="flex gap-2">
                     <Input
                       id="tags"
                       placeholder="Add a tag"
                       value={tagInput}
                       onChange={(e) => setTagInput(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') {
                           e.preventDefault();
                           handleAddTag();
                         }
                       }}
                       maxLength={20}
                     />
                     <Button type="button" variant="outline" onClick={handleAddTag}>
                       Add
                     </Button>
                   </div>
                   {tags.length > 0 && (
                     <div className="flex gap-1 flex-wrap mt-2">
                       {tags.map((tag) => (
                         <Badge key={tag} variant="secondary" className="gap-1">
                           {tag}
                           <button
                             type="button"
                             onClick={() => handleRemoveTag(tag)}
                             className="hover:text-destructive"
                           >
                             <X className="h-3 w-3" />
                           </button>
                         </Badge>
                       ))}
                     </div>
                   )}
                   <p className="text-xs text-muted-foreground">{tags.length}/5 tags</p>
                 </div>
 
                 {/* Community Guidelines */}
                 <div className="bg-muted/50 p-4 rounded-lg">
                   <p className="text-sm text-muted-foreground">
                     By posting, you agree to our{' '}
                     <Link to="/community/guidelines" className="text-primary hover:underline">
                       Community Guidelines
                     </Link>
                   </p>
                 </div>
               </div>
             )}
 
             {/* Submit Button */}
             <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
               <Button variant="outline" asChild>
                 <Link to="/community">Cancel</Link>
               </Button>
               <Button onClick={handleSubmit} disabled={submitting}>
                 {submitting ? 'Publishing...' : 'Publish Post'}
               </Button>
             </div>
           </CardContent>
         </Card>
       </main>
 
       <Footer />
     </div>
   );
 }