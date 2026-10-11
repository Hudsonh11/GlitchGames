import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { playSfx } from '@/lib/sfx';

const FRUITS = ['🍎', '🍌', '🍇', '🍓', '🍍', '🥝', '🍒', '🍑'];
const VEG = ['🥕', '🥦', '🌽', '🥔', '🧅', '🍆', '🥒', '🫑'];
const pick = () => { const f = Math.random() < 0.5; const a = f ? FRUITS : VEG; return { e: a[Math.floor(Math.random() * a.length)], fruit: f }; };
const DURATION = 30;

const SpeedSort: React.FC<{ onScoreUpdate?: (s: number) => void }> = ({ onScoreUpdate }) => {
  const [item, setItem] = useState(pick);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [state, setState] = useState<'idle' | 'play' | 'done'>('idle');
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);

  useEffect(() => {
    if (state !== 'play') return;
    const t = setInterval(() => setTime(s => {
      if (s <= 1) { setState('done'); playSfx('win'); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [state]);

  const answer = useCallback((fruit: boolean) => {
    if (state !== 'play') return;
    if (fruit === item.fruit) {
      const nc = combo + 1; const ns = score + 10 + Math.min(nc, 20) * 2;
      setCombo(nc); setScore(ns); onScoreUpdate?.(ns); setFlash('ok'); playSfx('coin');
    } else { setCombo(0); setTime(t => Math.max(0, t - 2)); setFlash('bad'); playSfx('lose'); }
    setItem(pick());
    setTimeout(() => setFlash(null), 150);
  }, [state, item, combo, score, onScoreUpdate]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') answer(true); if (e.key === 'ArrowRight') answer(false); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [answer]);

  const start = () => { setScore(0); setCombo(0); setTime(DURATION); setItem(pick()); setState('play'); };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 text-foreground text-center">
      <div className="flex justify-between text-sm"><h2 className="font-display text-xl font-bold">Speed Sort</h2><span className="text-muted-foreground">⏱ {time}s · {score} pts</span></div>
      {state === 'play' ? (
        <>
          <div className={`h-48 rounded-2xl border-2 flex items-center justify-center text-8xl transition-colors ${flash === 'ok' ? 'border-primary bg-primary/10' : flash === 'bad' ? 'border-destructive bg-destructive/10' : 'border-border bg-card/60'}`}>{item.e}</div>
          <p className="text-sm text-muted-foreground">Combo x{combo}</p>
          <div className="grid grid-cols-2 gap-3">
            <Button size="lg" onClick={() => answer(true)}>← Fruit</Button>
            <Button size="lg" variant="secondary" onClick={() => answer(false)}>Veg →</Button>
          </div>
        </>
      ) : (
        <div className="space-y-3 py-8">
          {state === 'done' && <p className="text-lg font-bold">Time! You scored {score}</p>}
          <p className="text-xs text-muted-foreground">Sort fruit and veg as fast as you can. Wrong answers cost 2 seconds. Arrow keys work too.</p>
          <Button onClick={start}>{state === 'done' ? 'Play again' : 'Start'}</Button>
        </div>
      )}
    </div>
  );
};

export default SpeedSort;
