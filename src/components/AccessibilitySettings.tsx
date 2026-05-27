import { useState, useEffect } from 'react';
import { Settings2, Type, Eye, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { T } from '@/components/T';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface A11ySettings {
  fontSize: number; // 100 = default, range 75-150
  reducedMotion: boolean;
  highContrast: boolean;
  dyslexiaFont: boolean;
  smoothScrolling: boolean;
}

const STORAGE_KEY = 'cybersafe-a11y-settings';

function loadSettings(): A11ySettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { fontSize: 100, reducedMotion: false, highContrast: false, dyslexiaFont: false, smoothScrolling: true };
}

function saveSettings(s: A11ySettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function applySettings(s: A11ySettings) {
  const root = document.documentElement;
  root.style.fontSize = `${s.fontSize}%`;
  if (s.reducedMotion) { root.classList.add('reduce-motion'); } else { root.classList.remove('reduce-motion'); }
  if (s.highContrast) { root.classList.add('high-contrast'); } else { root.classList.remove('high-contrast'); }
  if (s.dyslexiaFont) { root.classList.add('dyslexia-font'); } else { root.classList.remove('dyslexia-font'); }
  if (s.smoothScrolling) { root.classList.add('smooth-scroll'); } else { root.classList.remove('smooth-scroll'); }
}

export function AccessibilitySettings() {
  const [settings, setSettings] = useState<A11ySettings>(loadSettings);

  useEffect(() => {
    applySettings(settings);
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    applySettings(loadSettings());
  }, []);

  const update = (partial: Partial<A11ySettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 z-50 h-12 w-12 rounded-full bg-card border border-border shadow-lg hover:bg-muted min-h-[44px] min-w-[44px] bottom-24 md:bottom-6"
          aria-label="Accessibility settings"
        >
          <Settings2 className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[340px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" aria-hidden="true" />
            <T>Accessibility</T>
          </SheetTitle>
          <SheetDescription>
            <T>Customize your reading and display preferences.</T>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Font Size */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Type className="h-4 w-4" aria-hidden="true" />
              <T>Text Size</T>: {settings.fontSize}%
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="min-h-[44px] min-w-[44px]"
                onClick={() => update({ fontSize: Math.max(75, settings.fontSize - 10) })}
                disabled={settings.fontSize <= 75}
                aria-label="Decrease text size"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </Button>
              <div
                className="flex-1 h-2 bg-muted rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={settings.fontSize}
                aria-valuemin={75}
                aria-valuemax={150}
                aria-label="Text size"
              >
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${((settings.fontSize - 75) / 75) * 100}%` }}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="min-h-[44px] min-w-[44px]"
                onClick={() => update({ fontSize: Math.min(150, settings.fontSize + 10) })}
                disabled={settings.fontSize >= 150}
                aria-label="Increase text size"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="reduced-motion" className="text-sm font-medium cursor-pointer">
              <T>Reduce animations</T>
            </Label>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(v) => update({ reducedMotion: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="text-sm font-medium cursor-pointer">
              <T>High contrast</T>
            </Label>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(v) => update({ highContrast: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="dyslexia-font" className="text-sm font-medium cursor-pointer">
              <T>Dyslexia-friendly font</T>
            </Label>
            <Switch
              id="dyslexia-font"
              checked={settings.dyslexiaFont}
              onCheckedChange={(v) => update({ dyslexiaFont: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="smooth-scrolling" className="text-sm font-medium cursor-pointer">
              <T>Smooth scrolling</T>
            </Label>
            <Switch
              id="smooth-scrolling"
              checked={settings.smoothScrolling}
              onCheckedChange={(v) => update({ smoothScrolling: v })}
            />
          </div>

          <Button
            variant="outline"
            className="w-full min-h-[44px]"
            onClick={() => update({ fontSize: 100, reducedMotion: false, highContrast: false, dyslexiaFont: false, smoothScrolling: true })}
          >
            <T>Reset to defaults</T>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
