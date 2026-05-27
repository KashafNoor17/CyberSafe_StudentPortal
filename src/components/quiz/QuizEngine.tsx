import { useState, useCallback } from 'react';
import { QuizHeader } from './QuizHeader';
import { QuizQuestionCard } from './QuizQuestionCard';
import { QuizFeedback } from './QuizFeedback';
import { QuizResults } from './QuizResults';
import type { QuizDefinition } from '@/data/quizData';

interface Answer {
  questionId: string;
  userAnswer: string;
  correct: boolean;
}

interface QuizEngineProps {
  quiz: QuizDefinition;
  onComplete?: (score: number, total: number, passed: boolean) => void;
}

export function QuizEngine({ quiz, onComplete }: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<Answer | null>(null);

  const currentQuestion = quiz.questions[currentIndex];
  const correctCount = answers.filter(a => a.correct).length;
  const isLastQuestion = currentIndex === quiz.questions.length - 1;

  const handleAnswer = useCallback((answer: string) => {
    const isCorrect = answer === currentQuestion.correctAnswer;
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      userAnswer: answer,
      correct: isCorrect,
    };

    setLastAnswer(newAnswer);
    setAnswers(prev => [...prev, newAnswer]);
    setShowFeedback(true);
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    setShowFeedback(false);
    setLastAnswer(null);

    if (isLastQuestion) {
      const finalAnswers = [...answers];
      const score = finalAnswers.filter(a => a.correct).length;
      const total = quiz.questions.length;
      const passed = (score / total) * 100 >= quiz.passingScore;
      
      onComplete?.(score, total, passed);
      setShowResults(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [isLastQuestion, answers, quiz, onComplete]);

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setShowFeedback(false);
    setShowResults(false);
    setLastAnswer(null);
  }, []);

  if (showResults) {
    return (
      <QuizResults
        title={quiz.title}
        icon={quiz.icon}
        questions={quiz.questions}
        answers={answers}
        passingScore={quiz.passingScore}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      <QuizHeader
        title={quiz.title}
        icon={quiz.icon}
        currentQuestion={currentIndex}
        totalQuestions={quiz.questions.length}
        correctCount={correctCount}
      />

      {showFeedback && lastAnswer ? (
        <QuizFeedback
          isCorrect={lastAnswer.correct}
          correctAnswer={currentQuestion.correctAnswer}
          userAnswer={lastAnswer.userAnswer}
          explanation={currentQuestion.explanation}
          onNext={handleNext}
          isLast={isLastQuestion}
        />
      ) : (
        <QuizQuestionCard
          question={currentQuestion}
          questionIndex={currentIndex}
          onAnswer={handleAnswer}
          disabled={showFeedback}
        />
      )}
    </div>
  );
}
