import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuizFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
  explanation: string;
  onNext: () => void;
  isLast: boolean;
}

export function QuizFeedback({ isCorrect, correctAnswer, userAnswer, explanation, onNext, isLast }: QuizFeedbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-2 ${isCorrect ? 'border-accent bg-accent/5' : 'border-destructive bg-destructive/5'}`}>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-accent shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-destructive shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-semibold ${isCorrect ? 'text-accent' : 'text-destructive'}`}>
                {isCorrect ? '✅ Correct! Great job!' : '❌ Incorrect'}
              </p>
              
              {!isCorrect && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Your answer: <span className="text-destructive font-medium">{userAnswer}</span>
                  </p>
                  <p className="text-sm">
                    Correct answer: <span className="text-accent font-medium">{correctAnswer}</span>
                  </p>
                </div>
              )}
              
              <div className="mt-3 p-3 rounded-lg bg-background/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">💡 Explanation: </span>
                  {explanation}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onNext} className="min-w-[140px]">
              {isLast ? 'See Results' : 'Next Question'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
