import { Award, Lock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

interface CertificateProgressProps {
  modulesCompleted: number;
  totalModules: number;
  quizPassed: boolean;
  hasCertificate: boolean;
}

export function CertificateProgress({ 
  modulesCompleted, 
  totalModules, 
  quizPassed,
  hasCertificate 
}: CertificateProgressProps) {
  const progress = totalModules > 0 ? (modulesCompleted / totalModules) * 100 : 0;
  const allModulesComplete = modulesCompleted >= totalModules;
  const isEligible = allModulesComplete && quizPassed;

  if (hasCertificate) {
    return (
      <Card className="card-cyber border-success/30 bg-success/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-success">Certificate Earned!</h3>
                <p className="text-sm text-muted-foreground">
                  View and share your achievement
                </p>
              </div>
            </div>
            <Link to="/certificate">
              <Button variant="outline" size="sm" className="border-success/30 hover:bg-success/10">
                View Certificate
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-cyber">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            {isEligible ? (
              <Award className="h-6 w-6 text-primary" />
            ) : (
              <Lock className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">
              {isEligible ? 'Claim Your Certificate!' : 'Certificate Progress'}
            </h3>
            
            {isEligible ? (
              <p className="text-sm text-muted-foreground mb-3">
                You've completed all requirements. Generate your certificate now!
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Modules completed</span>
                  <span className="font-medium">{modulesCompleted}/{totalModules}</span>
                </div>
                <Progress value={progress} className="h-2" />
                
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${quizPassed ? 'bg-success' : 'bg-muted-foreground'}`} />
                  <span className="text-xs text-muted-foreground">
                    {quizPassed ? 'Quiz passed ✓' : 'Quiz: 70% required'}
                  </span>
                </div>
              </div>
            )}
            
            {isEligible && (
              <Link to="/certificate">
                <Button size="sm" className="cyber-gradient">
                  Generate Certificate
                  <Award className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
