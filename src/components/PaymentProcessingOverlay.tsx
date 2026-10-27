import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import plusIcon from '@/assets/glitch-plus-icon.png.asset.json';
import { pickCelebration } from '@/lib/celebrationTheme';
import { CHARACTER_DURATION_MS, DISMISS_DURATION_MS, TICK_DURATION_MS, type SuccessStage } from '@/lib/paymentAnimation';
import SeasonalCharacter from '@/components/payment/SeasonalCharacter';

export type PaymentPhase = 'processing' | 'success' | 'failed';
interface Props { phase: PaymentPhase; onClose: () => void }

const PaymentProcessingOverlay: React.FC<Props> = ({ phase, onClose }) => {
  const [elapsed, setElapsed] = useState(0);
  const [stage, setStage] = useState<SuccessStage>('tick');
  const theme = useMemo(() => pickCelebration(), []);
  const closeRef = useRef(onClose);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'processing') return;
    setElapsed(0);
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'success') return;
    setStage('tick');
    const eventTimer = window.setTimeout(() => setStage('character'), TICK_DURATION_MS);
    const dismissTimer = window.setTimeout(() => setStage('dismiss'), TICK_DURATION_MS + CHARACTER_DURATION_MS);
    const closeTimer = window.setTimeout(() => closeRef.current(), TICK_DURATION_MS + CHARACTER_DURATION_MS + DISMISS_DURATION_MS);
    return () => { [eventTimer, dismissTimer, closeTimer].forEach(window.clearTimeout); };
  }, [phase]);

  const exiting = phase === 'success' && stage === 'dismiss';
  const title = phase === 'processing' ? 'Processing Payment' : phase === 'failed' ? 'Payment not confirmed yet' : stage === 'tick' ? 'Payment complete' : theme.title;
  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="payment-title" tabIndex={-1}
      className={`payment-overlay fixed inset-0 z-[150] flex flex-col items-center justify-center gap-7 bg-background/90 p-6 backdrop-blur-xl outline-none ${exiting ? 'payment-exiting' : ''}`}
      data-payment-stage={phase === 'success' ? stage : phase}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && phase === 'failed') closeRef.current();
        if (event.key === 'Tab') {
          event.preventDefault();
          (dialogRef.current?.querySelector<HTMLElement>('button') ?? dialogRef.current)?.focus();
        }
      }}>
      <div className="payment-circle" data-season={theme.key}>
        {phase === 'processing' && <div className="payment-loading-scene">
          <svg viewBox="0 0 200 200" className="payment-spinner" aria-hidden="true">
            <circle cx="100" cy="100" r="79" className="payment-spinner-track" />
            <circle cx="100" cy="100" r="79" className="payment-spinner-arc" />
          </svg>
          <img src={plusIcon.url} alt="Glitch Games Plus" className="h-16 w-16 rounded-2xl object-cover" />
        </div>}
        {phase === 'success' && <>
          <div className={`payment-tick-scene ${stage !== 'tick' ? 'payment-scene-hidden' : ''}`} aria-hidden="true">
            <div className="payment-ripple" /><div className="payment-ripple payment-ripple-second" />
            <svg viewBox="0 0 120 120" className="payment-check"><circle cx="60" cy="60" r="52" className="payment-check-disc" /><path d="M35 61 L52 78 L86 43" pathLength="1" className="payment-check-path" /></svg>
          </div>
          {stage !== 'tick' && <SeasonalCharacter theme={theme} />}
        </>}
        {phase === 'failed' && <AlertCircle className="h-20 w-20 text-warning" aria-hidden="true" />}
      </div>
      <div className="w-full max-w-xs text-center" role="status" aria-live="polite" aria-atomic="true">
        <h2 id="payment-title" className="font-display text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{phase === 'processing' ? 'Confirming your Plus membership…' : phase === 'failed' ? 'If you were charged, refresh shortly to check your Plus status.' : stage === 'tick' ? 'Welcome to Glitch Games Plus' : theme.subtitle}</p>
      </div>
      {phase === 'processing' && <p className="text-xs tabular-nums text-muted-foreground">{elapsed}s · Please keep this page open</p>}
      {phase === 'failed' && <Button variant="outline" onClick={onClose}>Back to rewards</Button>}
    </div>
  );
};
export default PaymentProcessingOverlay;
