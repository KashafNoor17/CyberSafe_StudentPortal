import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, ArrowRight, CheckCircle, XCircle, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { QuizQuestion } from '@/data/quizData';

interface Answer {
  questionId: string;
  userAnswer: string;
  correct: boolean;
}

interface QuizResultsProps {
  title: string;
  icon: string;
  questions: QuizQuestion[];
  answers: Answer[];
  passingScore: number;
  onRetry: () => void;
}

export function QuizResults({ title, icon, questions, answers, passingScore, onRetry }: QuizResultsProps) {
  const score = answers.filter(a => a.correct).length;
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= passingScore;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="card-glow">
        <CardHeader className="text-center pb-4">
          <div className={`mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center ${passed ? 'bg-accent/10' : 'bg-warning/10'}`}>
            <Trophy className={`h-10 w-10 ${passed ? 'text-accent' : 'text-warning'}`} />
          </div>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <CardDescription className="text-base">
            {passed ? '🎉 Congratulations! You passed the quiz.' : '📚 Keep learning and try again!'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score display */}
          <div className="text-center py-4 rounded-lg bg-muted/30 border">
            <p className={`text-5xl font-bold font-mono ${passed ? 'text-accent' : 'text-warning'}`}>
              {percentage}%
            </p>
            <p className="text-muted-foreground mt-2">
              {score} out of {total} correct
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {passingScore}% required to pass
            </p>
          </div>

          {/* Pass/Fail badge */}
          <div className="flex justify-center">
            {passed ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <Award className="w-5 h-5 text-accent" />
                <span className="font-semibold text-accent">Passed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20">
                <RefreshCw className="w-5 h-5 text-warning" />
                <span className="font-semibold text-warning">Try Again</span>
              </div>
            )}
          </div>

          {/* Answer review */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              📋 Review Your Answers
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {questions.map((question, index) => {
                const answer = answers[index];
                return (
                  <div
                    key={question.id}
                    className={`p-3 rounded-lg border flex items-start gap-3 ${
                      answer?.correct
                        ? 'border-accent/30 bg-accent/5'
                        : 'border-destructive/30 bg-destructive/5'
                    }`}
                  >
                    {answer?.correct ? (
                      <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">
                        Q{index + 1}: {question.question}
                      </p>
                      {!answer?.correct && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Correct: <span className="text-accent">{question.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant="outline" onClick={onRetry} className="min-w-[140px]">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake Quiz
            </Button>
            <Button asChild className="min-w-[140px]">
              <Link to="/quiz">
                All Quizzes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {passed && (
              <Button variant="secondary" asChild className="min-w-[140px]">
                <Link to="/badges">
                  <Award className="mr-2 h-4 w-4" />
                  View Badges
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
