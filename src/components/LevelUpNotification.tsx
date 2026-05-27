import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLevelName, getLevelEmoji } from '@/lib/gamification';
import { T } from '@/components/T';

interface LevelUpNotificationProps {
  newLevel: string;
  onDismiss: () => void;
}

const levelBenefits: Record<string, string[]> = {
  'Security Apprentice': ['Custom avatar frame unlocked'],
  'Threat Detector': ['2x hint points for exercises'],
  'Privacy Guardian': ['Offline module downloads'],
  'Security Specialist': ['AI-powered hints for exercises'],
  'Cyber Defender': ['Profile badge displayed to others'],
  'Digital Sentinel': ['Custom theme unlocked'],
};

export function LevelUpNotification({ newLevel, onDismiss }: LevelUpNotificationProps) {
  const [visible, setVisible] = useState(true);
  const benefits = levelBenefits[newLevel] || ['Keep learning to unlock more!'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
          onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-primary/30 bg-card p-8 text-center shadow-2xl"
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3"
              onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
            >
              <X className="h-4 w-4" />
            </Button>

            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: 2, duration: 0.5 }}
              className="inline-flex"
            >
              <Sparkles className="h-12 w-12 text-warning mx-auto mb-2" />
            </motion.div>

            <h2 className="text-2xl font-bold font-display mb-1"><T>Level Up!</T></h2>
            <p className="text-4xl mb-2">{getLevelEmoji(newLevel)}</p>
            <p className="text-lg font-semibold text-primary mb-4"><T>{newLevel}</T></p>

            <div className="space-y-2 mb-6">
              <p className="text-sm text-muted-foreground font-medium"><T>New benefits unlocked:</T></p>
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 justify-center text-sm">
                  <Star className="h-4 w-4 text-warning" />
                  <span><T>{b}</T></span>
                </div>
              ))}
            </div>

            <Button
              className="w-full cyber-gradient"
              onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
            >
              <T>Awesome!</T>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}