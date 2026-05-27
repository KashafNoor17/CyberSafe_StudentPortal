import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, CheckCircle, AlertTriangle, Info, Eye, MapPin, Users, Share2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrivacySetting {
  id: string;
  label: string;
  description: string;
  privateValue: boolean;
  icon: React.ReactNode;
  riskLevel: 'high' | 'medium' | 'low';
}

interface PrivacySimulatorExerciseProps {
  onComplete?: () => void;
}

const privacySettings: PrivacySetting[] = [
  {
    id: 'profile_visibility',
    label: 'Profile Visibility',
    description: 'Controls who can see your profile. Private means only approved followers can view your posts and information.',
    privateValue: false, // false = private
    icon: <Eye className="h-5 w-5" />,
    riskLevel: 'high',
  },
  {
    id: 'location_sharing',
    label: 'Location Sharing',
    description: 'When enabled, your posts can include your precise location. Disable to prevent revealing where you live, work, or frequently visit.',
    privateValue: false,
    icon: <MapPin className="h-5 w-5" />,
    riskLevel: 'high',
  },
  {
    id: 'tag_review',
    label: 'Tag Review',
    description: 'When enabled, you must approve tags before they appear on your profile. Prevents unwanted posts being associated with you.',
    privateValue: true, // true = enabled/private
    icon: <Users className="h-5 w-5" />,
    riskLevel: 'medium',
  },
  {
    id: 'third_party_sharing',
    label: 'Third-Party Data Sharing',
    description: 'Controls whether your data can be shared with external apps and advertisers. Disable to protect your personal information.',
    privateValue: false,
    icon: <Share2 className="h-5 w-5" />,
    riskLevel: 'high',
  },
  {
    id: 'search_visibility',
    label: 'Search Visibility',
    description: 'When enabled, people can find your profile by searching your email or phone number. Disable for better anonymity.',
    privateValue: false,
    icon: <Search className="h-5 w-5" />,
    riskLevel: 'medium',
  },
];

export function PrivacySimulatorExercise({ onComplete }: PrivacySimulatorExerciseProps) {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    profile_visibility: true, // Start with risky defaults
    location_sharing: true,
    tag_review: false,
    third_party_sharing: true,
    search_visibility: true,
  });
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleToggle = (id: string) => {
    setSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const checkSettings = () => {
    setShowResults(true);
    
    // Check if all settings match their private values
    const allCorrect = privacySettings.every(
      setting => settings[setting.id] === setting.privateValue
    );

    if (allCorrect && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  };

  const getCorrectCount = () => {
    return privacySettings.filter(
      setting => settings[setting.id] === setting.privateValue
    ).length;
  };

  const isSettingCorrect = (setting: PrivacySetting) => {
    return settings[setting.id] === setting.privateValue;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusText = (setting: PrivacySetting, currentValue: boolean) => {
    if (setting.id === 'tag_review') {
      return currentValue ? 'Enabled' : 'Disabled';
    }
    if (setting.id === 'profile_visibility') {
      return currentValue ? 'Public' : 'Private';
    }
    return currentValue ? 'On' : 'Off';
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Privacy Settings Simulator
        </CardTitle>
        <p className="text-muted-foreground">
          Adjust these simulated privacy settings to their safest configuration. 
          Hover over the info icons to learn what each setting controls.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mock Social Media Profile Header */}
        <div className="bg-card rounded-lg p-4 border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h3 className="font-semibold">Your Profile</h3>
              <p className="text-sm text-muted-foreground">@yourhandle • 247 followers</p>
            </div>
            <Badge 
              variant={settings.profile_visibility ? "destructive" : "default"}
              className="ml-auto"
            >
              {settings.profile_visibility ? '🌐 Public' : '🔒 Private'}
            </Badge>
          </div>
        </div>

        {/* Privacy Settings */}
        <TooltipProvider>
          <div className="space-y-4">
            {privacySettings.map((setting) => (
              <motion.div
                key={setting.id}
                layout
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  showResults
                    ? isSettingCorrect(setting)
                      ? 'border-success bg-success/5'
                      : 'border-destructive bg-destructive/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={getRiskColor(setting.riskLevel)}>
                    {setting.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={setting.id} className="font-medium cursor-pointer">
                        {setting.label}
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>{setting.description}</p>
                        </TooltipContent>
                      </Tooltip>
                      <Badge variant="outline" className={`text-xs ${getRiskColor(setting.riskLevel)}`}>
                        {setting.riskLevel} risk
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Currently: {getStatusText(setting, settings[setting.id])}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {showResults && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                      >
                        {isSettingCorrect(setting) ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  )}
                  <Switch
                    id={setting.id}
                    checked={settings[setting.id]}
                    onCheckedChange={() => handleToggle(setting.id)}
                    disabled={isComplete}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </TooltipProvider>

        {/* Try This Tips */}
        <div className="bg-muted/50 rounded-lg p-4 border border-dashed">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            💡 Try This
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Check your real social media privacy settings today</li>
            <li>• Review which third-party apps have access to your accounts</li>
            <li>• Set a calendar reminder to audit your privacy settings monthly</li>
          </ul>
        </div>

        {/* Check Button / Results */}
        <div className="space-y-4">
          {!isComplete ? (
            <Button 
              onClick={checkSettings} 
              className="w-full"
              size="lg"
            >
              Check My Settings
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-success/10 border border-success/30 rounded-lg p-4 text-center"
            >
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <h4 className="font-semibold text-success">Privacy Settings Secured!</h4>
              <p className="text-sm text-muted-foreground">
                You've configured all settings for maximum privacy. Apply these to your real accounts!
              </p>
            </motion.div>
          )}

          {showResults && !isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-center"
            >
              <AlertTriangle className="h-6 w-6 text-warning mx-auto mb-2" />
              <p className="text-sm">
                {getCorrectCount()}/{privacySettings.length} settings are optimal. 
                Adjust the highlighted settings and try again!
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
