import { useState, useCallback } from 'react';
import { AlertTriangle, Shield, Clock, CheckCircle, XCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Choice {
  text: string;
  points: number;
  feedback: string;
  isBest: boolean;
}

interface ScenarioStep {
  title: string;
  description: string;
  timeLimit?: number; // seconds
  choices: Choice[];
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: string;
  steps: ScenarioStep[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'ransomware',
    title: 'Ransomware Attack',
    description: 'Your organization\'s systems have been encrypted by ransomware. Make critical decisions to respond.',
    icon: <AlertTriangle className="h-6 w-6" />,
    difficulty: 'Hard',
    steps: [
      {
        title: 'Initial Discovery',
        description: 'You arrive at work to find a ransom note on your screen: "All files encrypted. Pay 5 BTC to recover." Several colleagues report the same issue. What do you do first?',
        timeLimit: 60,
        choices: [
          { text: 'Immediately disconnect affected machines from the network', points: 25, feedback: 'Correct! Isolating affected systems prevents the ransomware from spreading further.', isBest: true },
          { text: 'Pay the ransom to recover files quickly', points: 0, feedback: 'Never pay the ransom. It funds criminal activity and there\'s no guarantee of recovery.', isBest: false },
          { text: 'Try to delete the ransomware yourself', points: 5, feedback: 'While well-intentioned, this could destroy forensic evidence and may not stop the spread.', isBest: false },
          { text: 'Turn off all computers in the building', points: 15, feedback: 'Shutting down can help but may destroy evidence in RAM. Disconnecting from network is better.', isBest: false },
        ],
      },
      {
        title: 'Escalation',
        description: 'The machines are isolated. What\'s your next priority?',
        choices: [
          { text: 'Notify IT security team and management', points: 25, feedback: 'Correct! Proper escalation ensures the right people are involved in the response.', isBest: true },
          { text: 'Start restoring from backups immediately', points: 10, feedback: 'Restoring is important but premature — you need to understand the scope first.', isBest: false },
          { text: 'Post about it on social media', points: 0, feedback: 'Never publicly disclose an active incident without authorization. This could worsen the situation.', isBest: false },
          { text: 'Contact law enforcement', points: 20, feedback: 'Good instinct! Law enforcement should be notified, but typically after internal escalation.', isBest: false },
        ],
      },
      {
        title: 'Recovery',
        description: 'The security team has contained the threat. How do you approach recovery?',
        choices: [
          { text: 'Restore from verified clean backups, scan all systems, then reconnect', points: 25, feedback: 'Perfect! Verified backups + full scan + staged reconnection is the gold standard.', isBest: true },
          { text: 'Restore from the most recent backup immediately', points: 10, feedback: 'Recent backups might also be compromised. Always verify backup integrity first.', isBest: false },
          { text: 'Reinstall the operating system on all machines', points: 15, feedback: 'Thorough but may be unnecessary for unaffected machines and destroys evidence.', isBest: false },
          { text: 'Resume normal operations — the threat is contained', points: 0, feedback: 'Never resume without proper recovery. Contained ≠ resolved.', isBest: false },
        ],
      },
      {
        title: 'Post-Incident',
        description: 'Systems are restored. What should happen next?',
        choices: [
          { text: 'Conduct a post-incident review, update security controls, and train staff', points: 25, feedback: 'Excellent! Learning from incidents and improving defenses is essential for resilience.', isBest: true },
          { text: 'Move on — the crisis is over', points: 0, feedback: 'Failing to learn from incidents virtually guarantees repeat occurrences.', isBest: false },
          { text: 'Fire the person who clicked the malicious link', points: 5, feedback: 'Blame culture prevents reporting. Focus on systemic improvements, not individual punishment.', isBest: false },
          { text: 'Only update antivirus software', points: 10, feedback: 'AV updates help but a comprehensive review of all security controls is needed.', isBest: false },
        ],
      },
    ],
  },
  {
    id: 'data-breach',
    title: 'Data Breach Response',
    description: 'Customer data has been exposed. Navigate the incident response process.',
    icon: <Shield className="h-6 w-6" />,
    difficulty: 'Medium',
    steps: [
      {
        title: 'Detection',
        description: 'Your monitoring system alerts you that an unauthorized user has accessed a database containing 10,000 customer records. What\'s your first action?',
        choices: [
          { text: 'Verify the alert and assess the scope of unauthorized access', points: 25, feedback: 'Correct! Always verify alerts before escalating to avoid false alarms while acting quickly.', isBest: true },
          { text: 'Immediately notify all 10,000 customers', points: 5, feedback: 'Premature notification without understanding the scope can cause unnecessary panic.', isBest: false },
          { text: 'Shut down the entire database', points: 15, feedback: 'This stops the breach but may impact business operations unnecessarily.', isBest: false },
          { text: 'Ignore it — monitoring systems have false positives', points: 0, feedback: 'Never ignore security alerts. Even false positives should be investigated.', isBest: false },
        ],
      },
      {
        title: 'Containment',
        description: 'The breach is confirmed. Customer names, emails, and hashed passwords were accessed. How do you contain it?',
        choices: [
          { text: 'Revoke the compromised credentials, patch the vulnerability, and preserve logs', points: 25, feedback: 'Perfect! This addresses the immediate threat while preserving evidence for investigation.', isBest: true },
          { text: 'Change all database passwords only', points: 10, feedback: 'Changing passwords is part of it, but you also need to fix the vulnerability and save logs.', isBest: false },
          { text: 'Delete the database logs to hide the breach', points: 0, feedback: 'Destroying evidence is illegal in most jurisdictions and prevents understanding the breach.', isBest: false },
          { text: 'Only patch the vulnerability', points: 10, feedback: 'Patching is critical but compromised credentials must also be revoked.', isBest: false },
        ],
      },
      {
        title: 'Notification',
        description: 'The breach has been contained. When and how do you notify affected users?',
        choices: [
          { text: 'Notify affected users within 72 hours with clear details and recommended actions', points: 25, feedback: 'Correct! Most regulations (GDPR, state laws) require notification within 72 hours with actionable advice.', isBest: true },
          { text: 'Wait a month to fully investigate before notifying anyone', points: 5, feedback: 'Excessive delay violates most breach notification laws and erodes trust.', isBest: false },
          { text: 'Only notify regulators, not customers', points: 10, feedback: 'Both regulators AND affected individuals typically need to be notified.', isBest: false },
          { text: 'Send a vague email saying "we had an issue"', points: 5, feedback: 'Notifications must be specific about what data was affected and what users should do.', isBest: false },
        ],
      },
    ],
  },
  {
    id: 'lost-device',
    title: 'Lost Company Device',
    description: 'A company laptop with sensitive data has gone missing.',
    icon: <Clock className="h-6 w-6" />,
    difficulty: 'Easy',
    steps: [
      {
        title: 'Discovery',
        description: 'An employee reports their company laptop was left in a taxi. It contains client project files and saved VPN credentials. What should happen first?',
        choices: [
          { text: 'Remotely wipe the device and revoke all its credentials', points: 25, feedback: 'Correct! Remote wipe and credential revocation should happen immediately to protect data.', isBest: true },
          { text: 'Wait to see if the taxi company returns it', points: 0, feedback: 'Every minute of delay is a risk. Data protection can\'t wait for a lost-and-found.', isBest: false },
          { text: 'Only change the VPN password', points: 10, feedback: 'VPN access is important but the device contains data that needs protection too.', isBest: false },
          { text: 'Report it to the police only', points: 10, feedback: 'Police reports are helpful but don\'t protect the data on the device.', isBest: false },
        ],
      },
      {
        title: 'Assessment',
        description: 'The device has been remotely wiped. What should you assess next?',
        choices: [
          { text: 'Determine if disk encryption was enabled and what data was stored', points: 25, feedback: 'Correct! Full-disk encryption status determines whether this is a data breach or just a lost device.', isBest: true },
          { text: 'Issue the employee a new laptop immediately', points: 5, feedback: 'Replacing the device is needed but understanding data exposure comes first.', isBest: false },
          { text: 'Discipline the employee', points: 5, feedback: 'Focus on data protection first. Disciplinary actions come after investigation.', isBest: false },
          { text: 'Nothing — the wipe solved everything', points: 0, feedback: 'You need to verify the wipe succeeded and assess what data may have been exposed before the wipe.', isBest: false },
        ],
      },
    ],
  },
];

export default function IncidentResponse() {
  const { user } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastFeedback, setLastFeedback] = useState('');
  const [completed, setCompleted] = useState(false);

  const startScenario = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentStep(0);
    setChoices([]);
    setTotalScore(0);
    setShowFeedback(false);
    setCompleted(false);
  }, []);

  const makeChoice = useCallback((choiceIndex: number) => {
    if (!selectedScenario || showFeedback) return;
    const step = selectedScenario.steps[currentStep];
    const choice = step.choices[choiceIndex];
    
    setChoices(prev => [...prev, choiceIndex]);
    setTotalScore(prev => prev + choice.points);
    setLastFeedback(choice.feedback);
    setShowFeedback(true);
  }, [selectedScenario, currentStep, showFeedback]);

  const nextStep = useCallback(async () => {
    if (!selectedScenario) return;
    
    if (currentStep + 1 >= selectedScenario.steps.length) {
      setCompleted(true);
      // Save result
      if (user) {
        const maxScore = selectedScenario.steps.length * 25;
        await supabase.from('incident_simulations').insert({
          user_id: user.id,
          scenario_type: selectedScenario.id,
          choices: choices,
          score: totalScore,
          max_score: maxScore,
        });
      }
    } else {
      setCurrentStep(prev => prev + 1);
      setShowFeedback(false);
    }
  }, [selectedScenario, currentStep, choices, totalScore, user]);

  const reset = useCallback(() => {
    setSelectedScenario(null);
    setCompleted(false);
  }, []);

  const maxScore = selectedScenario ? selectedScenario.steps.length * 25 : 100;
  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Incident Response Simulator
          </h1>
          <p className="text-muted-foreground mt-1">
            Practice handling real-world security incidents with branching scenarios
          </p>
        </div>

        {!selectedScenario ? (
          /* Scenario Selection */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {SCENARIOS.map((scenario) => (
              <Card key={scenario.id} className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => startScenario(scenario)}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-primary">{scenario.icon}</span>
                    {scenario.title}
                  </CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="secondary">{scenario.difficulty}</Badge>
                      <Badge variant="outline">{scenario.steps.length} decisions</Badge>
                    </div>
                    <Button size="sm" variant="ghost">
                      Start <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : completed ? (
          /* Completion Screen */
          <div className="animate-fade-in space-y-6">
            <Card className="border-primary/20">
              <CardContent className="pt-8 text-center space-y-4">
                <Award className="h-16 w-16 mx-auto text-primary" />
                <h2 className="text-2xl font-bold">Scenario Complete!</h2>
                <p className="text-lg">
                  <span className={`font-bold ${scorePercent >= 80 ? 'text-green-500' : scorePercent >= 50 ? 'text-yellow-500' : 'text-destructive'}`}>
                    {totalScore} / {maxScore} points
                  </span>
                  <span className="text-muted-foreground"> ({scorePercent}%)</span>
                </p>
                <Progress value={scorePercent} className="h-3 max-w-xs mx-auto" />
                <p className="text-muted-foreground">
                  {scorePercent >= 80
                    ? 'Excellent! You demonstrated strong incident response skills.'
                    : scorePercent >= 50
                    ? 'Good effort! Review the feedback to improve your response.'
                    : 'Keep practicing! Review best practices for incident response.'}
                </p>
                <div className="flex gap-3 justify-center pt-2">
                  <Button onClick={() => startScenario(selectedScenario)}>
                    <RotateCcw className="h-4 w-4 mr-1" /> Retry
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    Choose Another
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Review choices */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Your Decisions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedScenario.steps.map((step, i) => {
                  const choiceIdx = choices[i];
                  const choice = step.choices[choiceIdx];
                  return (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      {choice?.isBest ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{step.title}: {choice?.text}</p>
                        <p className="text-muted-foreground text-xs">{choice?.feedback}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Active Scenario */
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{selectedScenario.title}</h2>
              <Badge variant="outline">
                Step {currentStep + 1} of {selectedScenario.steps.length}
              </Badge>
            </div>
            <Progress value={((currentStep + (showFeedback ? 1 : 0)) / selectedScenario.steps.length) * 100} className="h-2" />

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">{selectedScenario.steps[currentStep].title}</CardTitle>
                <CardDescription className="text-sm">
                  {selectedScenario.steps[currentStep].description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedScenario.steps[currentStep].choices.map((choice, i) => (
                  <Button
                    key={i}
                    variant={
                      showFeedback && choices[currentStep] === i
                        ? choice.isBest ? 'default' : 'destructive'
                        : showFeedback && choice.isBest
                        ? 'outline'
                        : 'outline'
                    }
                    className={`w-full text-left justify-start h-auto py-3 px-4 text-sm whitespace-normal ${
                      showFeedback && choice.isBest && choices[currentStep] !== i
                        ? 'border-green-500/50'
                        : ''
                    }`}
                    onClick={() => makeChoice(i)}
                    disabled={showFeedback}
                  >
                    <span className="font-mono mr-2 shrink-0">{String.fromCharCode(65 + i)}.</span>
                    {choice.text}
                    {showFeedback && choice.isBest && (
                      <CheckCircle className="h-4 w-4 ml-auto text-green-500 shrink-0" />
                    )}
                  </Button>
                ))}

                {showFeedback && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm">{lastFeedback}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Points earned: +{selectedScenario.steps[currentStep].choices[choices[currentStep]].points}
                    </p>
                    <Button className="mt-3" size="sm" onClick={nextStep}>
                      {currentStep + 1 >= selectedScenario.steps.length ? 'See Results' : 'Next Step'} <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
              ← Back to scenarios
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
