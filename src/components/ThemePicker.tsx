import React, { useEffect, useState } from 'react';
import { Check, Moon, Sun } from 'lucide-react';
import { THEMES, ThemeId, applyTheme, getStoredTheme, getAppearance, getThemeVars, setAppearance } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
const ThemePicker: React.FC = () => {
  const [active, setActive] = useState<ThemeId>(getStoredTheme);
  const [mode, setMode] = useState(getAppearance);
  useEffect(() => {
    const sync = () => { setActive(getStoredTheme()); setMode(getAppearance()); };
    window.addEventListener('glitch-theme-change', sync);
    return () => window.removeEventListener('glitch-theme-change', sync);
  }, []);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-display font-semibold text-sm">App theme</h4>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          <Button size="sm" variant={mode === 'dark' ? 'secondary' : 'ghost'} onClick={() => setAppearance('dark')} aria-pressed={mode === 'dark'}><Moon />Dark</Button>
          <Button size="sm" variant={mode === 'light' ? 'secondary' : 'ghost'} onClick={() => setAppearance('light')} aria-pressed={mode === 'light'}><Sun />Light</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {THEMES.map(t => {
          const vars = getThemeVars(t, mode);
          const preview = Object.fromEntries(Object.entries(vars).map(([key, value]) => [key.replace('--', '--preview-'), value])) as React.CSSProperties;
          return (
            <Button key={t.id} variant="outline" aria-pressed={active === t.id} onClick={() => applyTheme(t.id)} className={cn('h-auto flex-col items-stretch gap-0 p-0 text-left whitespace-normal overflow-hidden', active === t.id && 'border-primary ring-1 ring-primary/30')}>
              <div style={preview} className="theme-preview relative h-24 p-3 w-full">
                <div className="flex gap-1 mb-3"><span className="theme-preview-accent w-2 h-2 rounded-full"/><span className="theme-preview-secondary w-2 h-2 rounded-full"/></div>
                <div className="flex gap-2"><div className="theme-preview-surface w-8 h-11 rounded"/><div className="flex-1 space-y-2"><div className="theme-preview-surface h-3 w-3/4 rounded"/><div className="theme-preview-accent h-5 w-1/2 rounded"/></div></div>
                {active === t.id && <span className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-primary text-primary-foreground w-5 h-5"><Check className="w-3 h-3"/></span>}
              </div>
              <div className="px-3 py-3 w-full"><p className="text-sm font-semibold">{t.label}</p><p className="text-xs font-normal text-muted-foreground mt-1 min-h-8">{t.description}</p></div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
export default ThemePicker;
