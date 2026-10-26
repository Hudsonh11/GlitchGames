import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import plusIcon from '@/assets/glitch-plus-icon.png.asset.json';
import { pickCelebration } from '@/lib/celebrationTheme';
import { cn } from '@/lib/utils';

export type PaymentPhase = 'processing' | 'success' | 'failed';

const MESSAGES = [
  'Contacting Stripe…',
  'Confirming your payment…',
  'Unlocking Plus perks…',
  'Adding coins and gems…',
  'Almost there…',
];

interface Props {
  phase: PaymentPhase;
  onClose: () => void;
}

const PaymentProcessingOverlay: React.FC<Props> = ({ phase, onClose }) => {
  const [elapsed, setElapsed] = useState(0);
  const theme = useMemo(() => pickCelebration(), []);

  useEffect(() => {
    if (phase !== 'processing') return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const particles = useMemo(
    () => Array.from({ length: 36 }, (_, i) => ({
      emoji: theme.particles[i % theme.particles.length],
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      dur: 2.4 + Math.random() * 2,
      size: 18 + Math.random() * 26,
      angle: (i / 36) * Math.PI * 2,
      dist: 160 + Math.random() * 220,
    })),
    [theme],
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-xl p-4">
      <style>{`
        @keyframes pp-fall { from { transform: translateY(-10vh) rotate(0); opacity: 1 } to { transform: translateY(110vh) rotate(360deg); opacity: .8 } }
        @keyframes pp-rise { from { transform: translateY(110vh) scale(.6); opacity: 0 } 15% { opacity: 1 } to { transform: translateY(-10vh) scale(1.1); opacity: 0 } }
        @keyframes pp-burst { from { transform: translate(0,0) scale(.2); opacity: 1 } to { transform: translate(var(--dx), var(--dy)) scale(1.2); opacity: 0 } }
        @keyframes pp-pop { 0% { transform: scale(.3); opacity: 0 } 60% { transform: scale(1.15); opacity: 1 } 100% { transform: scale(1) } }
      `}</style>

      {phase === 'success' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {particles.map((p, i) => (
            <span
              key={i}
              className="absolute"
              style={theme.style === 'burst'
                ? { left: '50%', top: '45%', fontSize: p.size, animation: `pp-burst ${p.dur}s ease-out ${p.delay}s infinite`,
                    ['--dx' as string]: `${Math.cos(p.angle) * p.dist}px`, ['--dy' as string]: `${Math.sin(p.angle) * p.dist}px` }
                : { left: `${p.left}%`, top: 0, fontSize: p.size, animation: `pp-${theme.style} ${p.dur}s linear ${p.delay}s infinite` }}
            >
              {p.emoji}
            </span>
          ))}
        </div>
      )}

      <div className="relative w-full max-w-sm rounded-3xl border border-primary/40 bg-card/80 p-8 text-center shadow-neon-cyan">
        {phase !== 'processing' && (
          <button onClick={onClose} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="relative mx-auto mb-5 h-24 w-24">
          {phase === 'processing' && (
            <div className="absolute -inset-2 rounded-[1.75rem] border-4 border-primary/20 border-t-primary animate-spin" />
          )}
          <img
            src={plusIcon.url}
            alt="Glitch Games Plus"
            className={cn('h-24 w-24 rounded-3xl object-cover', phase === 'processing' && 'animate-pulse')}
            style={phase === 'success' ? { animation: 'pp-pop .7s ease-out both' } : undefined}
          />
        </div>

        {phase === 'processing' && (
          <>
            <h2 className="font-display text-2xl font-bold">Processing Payment</h2>
            <p className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {MESSAGES[Math.min(Math.floor(elapsed / 2), MESSAGES.length - 1)]}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">{elapsed}s · Please don’t close this page</p>
          </>
        )}

        {phase === 'success' && (
          <div style={{ animation: 'pp-pop .6s ease-out .2s both' }}>
            <h2 className="font-display text-2xl font-bold text-gradient">{theme.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{theme.subtitle}</p>
            <Button variant="gaming" className="mt-6 w-full" onClick={onClose}>Let’s play!</Button>
          </div>
        )}

        {phase === 'failed' && (
          <>
            <h2 className="font-display text-2xl font-bold">We couldn’t confirm it yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If you were charged, Plus will appear shortly. Refresh this page in a minute.
            </p>
            <Button variant="outline" className="mt-6 w-full" onClick={onClose}>Close</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentProcessingOverlay;
