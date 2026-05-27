 import { Link } from 'react-router-dom';
 import { ArrowLeft, Shield, Heart, MessageSquare, AlertTriangle, Ban } from 'lucide-react';
 import { Header } from '@/components/Header';
 import { Footer } from '@/components/Footer';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 
 export default function CommunityGuidelines() {
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
 
         <div className="text-center mb-8">
           <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
             <Shield className="h-8 w-8 text-primary" />
           </div>
           <h1 className="text-3xl font-bold mb-2">Community Guidelines</h1>
           <p className="text-muted-foreground">
             Our community thrives when everyone feels safe and respected
           </p>
         </div>
 
         <div className="space-y-6">
           {/* Be Respectful */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-3">
                 <Heart className="h-5 w-5 text-primary" />
                 Be Respectful
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3 text-muted-foreground">
               <p>
                 Treat everyone with respect. We're all here to learn and grow together in
                 cybersecurity knowledge.
               </p>
               <ul className="list-disc list-inside space-y-1">
                 <li>Be patient with beginners - we all started somewhere</li>
                 <li>Disagree constructively - attack ideas, not people</li>
                 <li>Acknowledge different experience levels and perspectives</li>
                 <li>Use welcoming and inclusive language</li>
               </ul>
             </CardContent>
           </Card>
 
           {/* Stay On Topic */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-3">
                 <MessageSquare className="h-5 w-5 text-primary" />
                 Stay On Topic
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3 text-muted-foreground">
               <p>
                 Help keep discussions valuable by staying focused on cybersecurity topics.
               </p>
               <ul className="list-disc list-inside space-y-1">
                 <li>Post in the appropriate category</li>
                 <li>Use descriptive titles that help others find relevant content</li>
                 <li>Provide context when asking questions</li>
                 <li>Mark solutions to help future readers</li>
               </ul>
             </CardContent>
           </Card>
 
           {/* Security Responsibility */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-3">
                 <AlertTriangle className="h-5 w-5 text-warning" />
                 Security Responsibility
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3 text-muted-foreground">
               <p>
                 As a cybersecurity community, we have special responsibilities.
               </p>
               <ul className="list-disc list-inside space-y-1">
                 <li>Never share personal credentials or sensitive information</li>
                 <li>Don't post malware, exploits, or attack tools</li>
                 <li>Discuss vulnerabilities responsibly</li>
                 <li>Report suspicious activity to moderators</li>
                 <li>Help educate others about safe practices</li>
               </ul>
             </CardContent>
           </Card>
 
           {/* What's Not Allowed */}
           <Card className="border-destructive/30">
             <CardHeader>
               <CardTitle className="flex items-center gap-3 text-destructive">
                 <Ban className="h-5 w-5" />
                 What's Not Allowed
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3 text-muted-foreground">
               <p>The following will result in content removal and possible account action:</p>
               <ul className="list-disc list-inside space-y-1">
                 <li>Harassment, bullying, or personal attacks</li>
                 <li>Spam, self-promotion, or off-topic content</li>
                 <li>Sharing illegal content or activities</li>
                 <li>Impersonation or deceptive behavior</li>
                 <li>Sharing others' personal information</li>
                 <li>Malicious code or phishing attempts</li>
               </ul>
             </CardContent>
           </Card>
 
           {/* Reporting */}
           <Card className="bg-primary/5 border-primary/20">
             <CardContent className="py-6 text-center">
               <h3 className="font-semibold mb-2">See something concerning?</h3>
               <p className="text-muted-foreground mb-4">
                 Help us maintain a safe community by reporting violations. Our moderators
                 review all reports promptly.
               </p>
               <p className="text-sm text-muted-foreground">
                 Use the flag icon on any post or reply to report it.
               </p>
             </CardContent>
           </Card>
         </div>
       </main>
 
       <Footer />
     </div>
   );
 }