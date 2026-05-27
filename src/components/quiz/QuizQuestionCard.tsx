import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import type { QuizQuestion } from '@/data/quizData';

interface QuizQuestionCardProps {
  question: QuizQuestion;
  questionIndex: number;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

export function QuizQuestionCard({ question, questionIndex, onAnswer, disabled }: QuizQuestionCardProps) {
  // Parse scenario newlines for proper display
  const formattedScenario = question.scenario?.replace(/\\n/g, '\n');

  return (
    <Card className="card-glow animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg flex items-start gap-3">
          <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
            {questionIndex + 1}
          </span>
          <span>{question.question}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email / Scenario Preview */}
        {formattedScenario && (
          <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email Preview</span>
            </div>
            <div className="p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {formattedScenario}
            </div>
          </div>
        )}

        {/* Answer Options */}
        <div className="grid gap-3">
          {question.options.map((option, idx) => {
            const label = String.fromCharCode(65 + idx); // A, B, C, D
            return (
              <Button
                key={idx}
                variant="outline"
                className="h-auto min-h-[52px] py-3 px-4 justify-start text-left whitespace-normal hover:bg-primary/5 hover:border-primary/50 transition-colors"
                onClick={() => onAnswer(option)}
                disabled={disabled}
              >
                <span className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-semibold mr-3">
                  {label}
                </span>
                <span className="flex-1">{option}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
