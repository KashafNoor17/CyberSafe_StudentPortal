import { Progress } from '@/components/ui/progress';

interface QuizHeaderProps {
  title: string;
  icon: string;
  currentQuestion: number;
  totalQuestions: number;
  correctCount: number;
}

export function QuizHeader({ title, icon, currentQuestion, totalQuestions, correctCount }: QuizHeaderProps) {
  const progress = ((currentQuestion) / totalQuestions) * 100;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
            {icon}
          </div>
          <div>
            <h1 className="font-semibold text-lg">{title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {totalQuestions}
              {correctCount > 0 && ` • Score: ${correctCount}/${currentQuestion} correct`}
            </p>
          </div>
        </div>
        <span className="text-sm font-mono font-medium text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
