import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, EyeOff, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { T } from '@/components/T';

interface PasswordResult {
  strength: 'None' | 'Weak' | 'Medium' | 'Strong';
  score: number;
  feedback: { message: string; passed: boolean }[];
}

interface PasswordStrengthExerciseProps {
  onComplete?: () => void;
}

const WEAK_PASSWORDS = ['password', '123456', 'qwerty', 'letmein', 'admin', 'welcome', 'monkey', 'dragon'];

const EXAMPLE_PASSWORDS = [
  { label: 'password123', value: 'password123' },
  { label: 'MyDog2024', value: 'MyDog2024' },
  { label: '7Blu3$ky!2024', value: '7Blu3$ky!2024' },
];

function checkPasswordStrength(password: string): PasswordResult {
  if (!password) {
    return { strength: 'None', score: 0, feedback: [] };
  }

  let score = 0;
  const feedback: { message: string; passed: boolean }[] = [];

  if (password.length >= 12) {
    score += 2;
    feedback.push({ message: 'Great length (12+ characters)', passed: true });
  } else if (password.length >= 8) {
    score += 1;
    feedback.push({ message: 'Good length (8+ characters)', passed: true });
  } else {
    feedback.push({ message: 'Too short - use at least 8 characters', passed: false });
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
    feedback.push({ message: 'Contains uppercase letters', passed: true });
  } else {
    feedback.push({ message: 'Add uppercase letters', passed: false });
  }

  if (/[a-z]/.test(password)) {
    score += 1;
    feedback.push({ message: 'Contains lowercase letters', passed: true });
  } else {
    feedback.push({ message: 'Add lowercase letters', passed: false });
  }

  if (/[0-9]/.test(password)) {
    score += 1;
    feedback.push({ message: 'Contains numbers', passed: true });
  } else {
    feedback.push({ message: 'Add numbers', passed: false });
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 2;
    feedback.push({ message: 'Contains special characters', passed: true });
  } else {
    feedback.push({ message: 'Add special characters (!@#$%^&*)', passed: false });
  }

  const uniqueChars = new Set(password.toLowerCase()).size;
  if (uniqueChars >= password.length * 0.7) {
    score += 1;
    feedback.push({ message: 'Good character variety', passed: true });
  }

  const lowerPassword = password.toLowerCase();
  if (WEAK_PASSWORDS.some(weak => lowerPassword.includes(weak))) {
    score = Math.max(0, score - 5);
    feedback.unshift({ message: 'Contains common weak patterns!', passed: false });
  }

  let strength: 'None' | 'Weak' | 'Medium' | 'Strong' = 'Weak';
  if (score >= 7) strength = 'Strong';
  else if (score >= 4) strength = 'Medium';

  return { strength, score: Math.min(score, 10), feedback };
}

export function PasswordStrengthExercise({ onComplete }: PasswordStrengthExerciseProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<PasswordResult>({ strength: 'None', score: 0, feedback: [] });
  const [hasCompletedExercise, setHasCompletedExercise] = useState(false);

  useEffect(() => {
    const newResult = checkPasswordStrength(password);
    setResult(newResult);

    if (newResult.strength === 'Strong' && !hasCompletedExercise) {
      setHasCompletedExercise(true);
      onComplete?.();
    }
  }, [password, hasCompletedExercise, onComplete]);

  const getStrengthColor = () => {
    switch (result.strength) {
      case 'Strong': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'Weak': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getProgressColor = () => {
    switch (result.strength) {
      case 'Strong': return 'bg-success';
      case 'Medium': return 'bg-warning';
      case 'Weak': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <T>Password Strength Checker</T>
          {hasCompletedExercise && (
            <span className="ml-auto flex items-center gap-1 text-sm text-success font-normal">
              <CheckCircle className="h-4 w-4" />
              <T>Exercise Complete!</T>
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          <T>Type a password below to test its strength. Try to create a Strong password to complete this exercise!</T>
        </p>

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password to test..."
            className="pr-12 text-lg h-12"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium"><T>Strength</T>:</span>
            <span className={`font-bold ${getStrengthColor()}`}>
              <T>{result.strength}</T> {result.score > 0 && `(${result.score}/10)`}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${getProgressColor()}`}
              style={{ width: `${result.score * 10}%` }}
            />
          </div>
        </div>

        {password && (
          <div className="space-y-2 p-4 rounded-lg bg-card border">
            <h4 className="font-medium text-sm"><T>Feedback</T>:</h4>
            <ul className="space-y-1">
              {result.feedback.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  {item.passed ? (
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                  <span className={item.passed ? 'text-success' : 'text-muted-foreground'}>
                    <T>{item.message}</T>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <T>Try these examples to see how they score:</T>
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PASSWORDS.map((example) => (
              <Button
                key={example.value}
                variant="outline"
                size="sm"
                onClick={() => setPassword(example.value)}
                className="font-mono text-xs"
              >
                {example.label}
              </Button>
            ))}
          </div>
        </div>

        {hasCompletedExercise && (
          <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center">
            <p className="text-success font-medium">
              🎉 <T>Excellent! You've created a strong password and completed this exercise!</T>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <T>Remember: Use unique, strong passwords for each of your accounts.</T>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}