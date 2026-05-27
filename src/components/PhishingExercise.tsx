import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, XCircle, GripVertical, AlertTriangle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Email {
  id: string;
  from: string;
  subject: string;
  message: string;
  isPhishing: boolean;
  explanation: string;
}

const sampleEmails: Email[] = [
  {
    id: '1',
    from: 'security@paypa1.com',
    subject: 'URGENT: Your account will be suspended!',
    message: 'Click here immediately to verify your account: http://paypa1-verify.com',
    isPhishing: true,
    explanation: 'Notice "paypa1" uses number 1 instead of letter l. Suspicious domain and urgent language are red flags.',
  },
  {
    id: '2',
    from: 'security@paypal.com',
    subject: 'Recent login from new device',
    message: 'We noticed a login from Chrome on Windows. If this was you, no action needed.',
    isPhishing: false,
    explanation: 'Official domain, no urgent action required, and informational tone indicate a legitimate email.',
  },
  {
    id: '3',
    from: 'support@amaz0n-support.com',
    subject: 'Your order cannot be shipped',
    message: 'Reply with your password to confirm your identity for shipping.',
    isPhishing: true,
    explanation: 'Uses "amaz0n" with zero instead of o. Legitimate companies never ask for passwords via email.',
  },
];

interface PhishingExerciseProps {
  onComplete?: () => void;
}

export function PhishingExercise({ onComplete }: PhishingExerciseProps) {
  const [categorizedEmails, setCategorizedEmails] = useState<{
    uncategorized: Email[];
    legitimate: Email[];
    phishing: Email[];
  }>({
    uncategorized: [...sampleEmails],
    legitimate: [],
    phishing: [],
  });
  
  const [showResults, setShowResults] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [draggedEmail, setDraggedEmail] = useState<Email | null>(null);

  const handleDragStart = (email: Email) => {
    setDraggedEmail(email);
  };

  const handleDrop = useCallback((category: 'legitimate' | 'phishing') => {
    if (!draggedEmail) return;

    setCategorizedEmails((prev) => {
      // Remove from uncategorized
      const newUncategorized = prev.uncategorized.filter((e) => e.id !== draggedEmail.id);
      
      // Also check if it was in the other category and remove
      const newLegitimate = prev.legitimate.filter((e) => e.id !== draggedEmail.id);
      const newPhishing = prev.phishing.filter((e) => e.id !== draggedEmail.id);

      // Add to the target category
      if (category === 'legitimate') {
        newLegitimate.push(draggedEmail);
      } else {
        newPhishing.push(draggedEmail);
      }

      return {
        uncategorized: newUncategorized,
        legitimate: newLegitimate,
        phishing: newPhishing,
      };
    });
    
    setDraggedEmail(null);
  }, [draggedEmail]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const checkAnswers = () => {
    setShowResults(true);
    
    // Check if all are correctly categorized
    const legitimateCorrect = categorizedEmails.legitimate.every((e) => !e.isPhishing);
    const phishingCorrect = categorizedEmails.phishing.every((e) => e.isPhishing);
    const allCategorized = categorizedEmails.uncategorized.length === 0;
    
    if (legitimateCorrect && phishingCorrect && allCategorized) {
      setCompleted(true);
      onComplete?.();
    }
  };

  const resetExercise = () => {
    setCategorizedEmails({
      uncategorized: [...sampleEmails],
      legitimate: [],
      phishing: [],
    });
    setShowResults(false);
    setCompleted(false);
  };

  const getCorrectCount = () => {
    const legitCorrect = categorizedEmails.legitimate.filter((e) => !e.isPhishing).length;
    const phishCorrect = categorizedEmails.phishing.filter((e) => e.isPhishing).length;
    return legitCorrect + phishCorrect;
  };

  const allCategorized = categorizedEmails.uncategorized.length === 0;

  return (
    <Card className="border-secondary/30 bg-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-secondary" />
          🕵️ Phishing Detection Challenge
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Drag each email to the correct category: Legitimate or Phishing
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Uncategorized Emails */}
        {categorizedEmails.uncategorized.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Emails to Check:</h4>
            {categorizedEmails.uncategorized.map((email) => (
              <motion.div
                key={email.id}
                draggable
                onDragStart={() => handleDragStart(email)}
                className="p-4 bg-card border rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">From:</span> {email.from}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Subject:</span> {email.subject}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Message:</span> {email.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Drop Zones */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Legitimate Zone */}
          <div
            className={`p-4 border-2 border-dashed rounded-lg min-h-[200px] transition-colors ${
              draggedEmail ? 'border-success bg-success/5' : 'border-muted'
            }`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('legitimate')}
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-success" />
              <span className="font-semibold text-success">✅ Legitimate</span>
            </div>
            <AnimatePresence>
              {categorizedEmails.legitimate.map((email) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  draggable
                  onDragStart={() => handleDragStart(email)}
                  className={`p-3 mb-2 rounded-lg cursor-grab ${
                    showResults
                      ? email.isPhishing
                        ? 'bg-destructive/10 border-2 border-destructive'
                        : 'bg-success/10 border-2 border-success'
                      : 'bg-card border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{email.from}</p>
                      <p className="text-xs text-muted-foreground">{email.subject}</p>
                    </div>
                    {showResults && (
                      email.isPhishing ? (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      )
                    )}
                  </div>
                  {showResults && (
                    <p className="text-xs mt-2 text-muted-foreground">{email.explanation}</p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {categorizedEmails.legitimate.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">
                Drag legitimate emails here
              </p>
            )}
          </div>

          {/* Phishing Zone */}
          <div
            className={`p-4 border-2 border-dashed rounded-lg min-h-[200px] transition-colors ${
              draggedEmail ? 'border-destructive bg-destructive/5' : 'border-muted'
            }`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('phishing')}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-semibold text-destructive">❌ Phishing</span>
            </div>
            <AnimatePresence>
              {categorizedEmails.phishing.map((email) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  draggable
                  onDragStart={() => handleDragStart(email)}
                  className={`p-3 mb-2 rounded-lg cursor-grab ${
                    showResults
                      ? !email.isPhishing
                        ? 'bg-destructive/10 border-2 border-destructive'
                        : 'bg-success/10 border-2 border-success'
                      : 'bg-card border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{email.from}</p>
                      <p className="text-xs text-muted-foreground">{email.subject}</p>
                    </div>
                    {showResults && (
                      !email.isPhishing ? (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      )
                    )}
                  </div>
                  {showResults && (
                    <p className="text-xs mt-2 text-muted-foreground">{email.explanation}</p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {categorizedEmails.phishing.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">
                Drag phishing emails here
              </p>
            )}
          </div>
        </div>

        {/* Check Answers Button */}
        <div className="flex justify-center gap-3">
          {!showResults ? (
            <Button
              onClick={checkAnswers}
              disabled={!allCategorized}
              className="min-w-[150px]"
            >
              Check My Answers
            </Button>
          ) : (
            <>
              {completed ? (
                <div className="text-center">
                  <Badge className="bg-success/10 text-success border-success/20 text-lg py-2 px-4">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Perfect! You correctly identified all emails!
                  </Badge>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-muted-foreground">
                    You got {getCorrectCount()} out of {sampleEmails.length} correct.
                  </p>
                  <Button onClick={resetExercise} variant="outline">
                    Try Again
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Completion Message */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-success/10 border border-success/20 rounded-lg text-center"
          >
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="font-semibold text-success">Exercise Complete!</p>
            <p className="text-sm text-muted-foreground">
              You can now identify phishing attempts. Stay vigilant!
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
