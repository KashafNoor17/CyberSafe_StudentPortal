import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { T } from '@/components/T';

interface ResolvedQuestion {
  originalId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface UserAnswer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
}

interface ModuleQuizProps {
  moduleId: string;
  onQuizComplete: (score: number, total: number) => void;
}

export function ModuleQuiz({ moduleId, onQuizComplete }: ModuleQuizProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<ResolvedQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (moduleId && user) {
      fetchAndResolveQuestions();
    }
  }, [moduleId, user]);

  const fetchAndResolveQuestions = async () => {
    try {
      const { data: rawQuestions, error } = await supabase
        .from('module_quizzes')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index');

      if (error) throw error;
      if (!rawQuestions?.length) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const resolved: ResolvedQuestion[] = rawQuestions.map((q: any) => ({
        originalId: q.id,
        questionText: q.question,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
      }));
      setQuestions(resolved);

      const { data: answersData } = await supabase
        .from('user_quiz_answers')
        .select('quiz_id, selected_answer, is_correct')
        .eq('module_id', moduleId)
        .eq('user_id', user!.id);

      if (answersData?.length) {
        const answersMap: Record<string, UserAnswer> = {};
        const explanationMap: Record<string, boolean> = {};
        answersData.forEach((a) => {
          answersMap[a.quiz_id] = {
            questionId: a.quiz_id,
            selectedOption: a.selected_answer,
            isCorrect: a.is_correct,
          };
          explanationMap[a.quiz_id] = true;
        });
        setUserAnswers(answersMap);
        setShowExplanation(explanationMap);

        if (rawQuestions.length === answersData.length) {
          const correctCount = answersData.filter((a) => a.is_correct).length;
          onQuizComplete(correctCount, rawQuestions.length);
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching quiz data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (question: ResolvedQuestion, selectedOption: string) => {
    if (!user || userAnswers[question.originalId]) return;

    const isCorrect = selectedOption === question.correctAnswer;

    try {
      const { error } = await supabase.from('user_quiz_answers').insert({
        user_id: user.id,
        module_id: moduleId,
        quiz_id: question.originalId,
        selected_answer: selectedOption,
        is_correct: isCorrect,
      });
      if (error) throw error;

      const newAnswers = {
        ...userAnswers,
        [question.originalId]: {
          questionId: question.originalId,
          selectedOption,
          isCorrect,
        },
      };
      setUserAnswers(newAnswers);
      setShowExplanation({ ...showExplanation, [question.originalId]: true });

      if (Object.keys(newAnswers).length === questions.length) {
        const correctCount = Object.values(newAnswers).filter((a) => a.isCorrect).length;
        onQuizComplete(correctCount, questions.length);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving answer:', error);
      }
    }
  };

  const getOptionStyle = (questionId: string, option: string, correctAnswer: string) => {
    const answer = userAnswers[questionId];
    if (!answer) {
      return 'border-border hover:border-primary hover:bg-primary/5';
    }
    const isSelected = answer.selectedOption === option;
    const isCorrect = correctAnswer === option;
    if (isCorrect) return 'border-success bg-success/10 text-success';
    if (isSelected && !answer.isCorrect) return 'border-destructive bg-destructive/10 text-destructive';
    return 'border-border opacity-50';
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <T>Test Your Knowledge</T>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) return null;

  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = Object.values(userAnswers).filter((a) => a.isCorrect).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <T>Test Your Knowledge</T>
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {answeredCount}/{questions.length} <T>answered</T>
            {allAnswered && <> • <T>Score</T>: {correctCount}/{questions.length}</>}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, index) => (
          <div
            key={question.originalId}
            className={`p-4 rounded-lg border ${
              userAnswers[question.originalId] ? 'bg-background' : 'bg-card'
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
                {index + 1}
              </span>
              <p className="font-medium text-foreground pt-1">{question.questionText}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-11">
              {question.options.map((option, optIdx) => {
                const isAnswered = !!userAnswers[question.originalId];
                const label = String.fromCharCode(65 + optIdx);

                return (
                  <Button
                    key={optIdx}
                    variant="outline"
                    className={`justify-start h-auto py-3 px-4 text-left whitespace-normal ${getOptionStyle(
                      question.originalId,
                      option,
                      question.correctAnswer
                    )}`}
                    onClick={() => handleAnswerSelect(question, option)}
                    disabled={isAnswered}
                  >
                    <span className="font-semibold mr-2">{label}.</span>
                    {option}
                    {isAnswered && question.correctAnswer === option && (
                      <CheckCircle className="ml-auto h-4 w-4 flex-shrink-0" />
                    )}
                    {isAnswered &&
                      userAnswers[question.originalId]?.selectedOption === option &&
                      !userAnswers[question.originalId]?.isCorrect && (
                        <XCircle className="ml-auto h-4 w-4 flex-shrink-0" />
                      )}
                  </Button>
                );
              })}
            </div>

            {showExplanation[question.originalId] && (
              <div
                className={`mt-4 ml-11 p-3 rounded-lg ${
                  userAnswers[question.originalId]?.isCorrect
                    ? 'bg-success/10 border border-success/20'
                    : 'bg-warning/10 border border-warning/20'
                }`}
              >
                <p className="text-sm">
                  <span className="font-semibold">
                    {userAnswers[question.originalId]?.isCorrect ? <><T>Correct!</T> </> : <><T>Incorrect.</T> </>}
                  </span>
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        ))}

        {allAnswered && (
          <div className="text-center p-4 rounded-lg bg-card border">
            <p className="text-lg font-semibold">
              <T>Quiz Complete!</T> <T>You scored</T> {correctCount}/{questions.length} (
              {Math.round((correctCount / questions.length) * 100)}%)
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {correctCount === questions.length
                ? <><span>🎉</span> <T>Perfect score!</T></>
                : correctCount >= questions.length * 0.7
                ? <><span>👍</span> <T>Great job!</T></>
                : <T>Keep learning and try again!</T>}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
