import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { playSfx } from '@/lib/sfx';

// Tap / space to swap between inner and outer orbit and dodge incoming meteors.
const OrbitDodge: React.FC<{ onScoreUpdate?: (s: number) => void }> = ({ onScoreUpdate }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const outer = useRef(true);

  useEffect(() => {
    if (!running) return;
    const c = canvas.current!; const ctx = c.getContext('2d')!;
    const S = c.width, cx = S / 2, cy = S / 2, R1 = S * 0.22, R2 = S * 0.38;
    const css = getComputedStyle(document.documentElement);
    const col = (v: string) => `hsl(${css.getPropertyValue(v).trim()})`;
    let angle = 0, speed = 1.8, pts = 0, raf = 0, last = performance.now(), spawn = 0;
    const meteors: { a: number; outer: boolean; life: number }[] = [];

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      angle += speed * dt; speed += dt * 0.04; spawn -= dt;
      if (spawn <= 0) {
        meteors.push({ a: angle + Math.PI * (0.8 + Math.random() * 0.9), outer: Math.random() < 0.5, life: 6 });
        spawn = Math.max(0.35, 1.1 - pts / 400);
      }
      ctx.clearRect(0, 0, S, S);
      ctx.strokeStyle = col('--border'); ctx.lineWidth = 2;
      [R1, R2].forEach(r => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); });
      ctx.fillStyle = col('--primary'); ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
      const pr = outer.current ? R2 : R1;
      const px = cx + Math.cos(angle) * pr, py = cy + Math.sin(angle) * pr;
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]; m.life -= dt;
        const mr = m.outer ? R2 : R1, mx = cx + Math.cos(m.a) * mr, my = cy + Math.sin(m.a) * mr;
        ctx.fillStyle = col('--destructive'); ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI * 2); ctx.fill();
        if (Math.hypot(mx - px, my - py) < 20) {
          cancelAnimationFrame(raf); playSfx('lose'); setOver(true); setRunning(false); return;
        }
        if (m.life <= 0) { meteors.splice(i, 1); pts += 10; setScore(pts); onScoreUpdate?.(pts); }
      }
      ctx.fillStyle = col('--accent'); ctx.shadowColor = col('--accent'); ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const key = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); outer.current = !outer.current; playSfx('click'); } };
    window.addEventListener('keydown', key);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', key); };
  }, [running, onScoreUpdate]);

  const start = () => { setScore(0); setOver(false); outer.current = true; setRunning(true); };

  return (
    <div className="max-w-md mx-auto p-4 space-y-3 text-foreground text-center">
      <div className="flex justify-between"><h2 className="font-display text-xl font-bold">Orbit Dodge</h2><span className="text-sm text-muted-foreground">Score: {score}</span></div>
      <canvas
        ref={canvas} width={400} height={400}
        onPointerDown={() => { if (running) { outer.current = !outer.current; playSfx('click'); } }}
        className="w-full aspect-square rounded-2xl bg-card/60 border border-border touch-none"
      />
      {!running && (
        <div className="space-y-2">
          {over && <p className="font-bold">Crashed! Final score {score}</p>}
          <p className="text-xs text-muted-foreground">Tap or press Space to switch orbit and dodge the red meteors.</p>
          <Button onClick={start}>{over ? 'Play again' : 'Start'}</Button>
        </div>
      )}
    </div>
  );
};

export default OrbitDodge;
