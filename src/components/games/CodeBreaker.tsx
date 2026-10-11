import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { playSfx } from '@/lib/sfx';

const COLORS = ['hsl(0 85% 55%)', 'hsl(140 70% 45%)', 'hsl(210 90% 55%)', 'hsl(45 100% 55%)', 'hsl(280 80% 60%)', 'hsl(20 95% 55%)'];
const LEN = 4;
const MAX_TRIES = 10;
const newCode = () => Array.from({ length: LEN }, () => Math.floor(Math.random() * COLORS.length));

interface Row { guess: number[]; exact: number; near: number }

const score = (code: number[], guess: number[]) => {
  let exact = 0;
  const c: number[] = [], g: number[] = [];
  code.forEach((v, i) => (v === guess[i] ? exact++ : (c.push(v), g.push(guess[i]))));
  let near = 0;
  g.forEach(v => { const k = c.indexOf(v); if (k >= 0) { near++; c.splice(k, 1); } });
  return { exact, near };
};

const CodeBreaker: React.FC<{ onScoreUpdate?: (s: number) => void }> = ({ onScoreUpdate }) => {
  const [code, setCode] = useState(newCode);
  const [rows, setRows] = useState<Row[]>([]);
  const [cur, setCur] = useState<number[]>([]);
  const [state, setState] = useState<'play' | 'won' | 'lost'>('play');
  const [total, setTotal] = useState(0);

  const submit = () => {
    if (cur.length !== LEN) return;
    const r = { guess: cur, ...score(code, cur) };
    const next = [...rows, r];
    setRows(next); setCur([]);
    if (r.exact === LEN) {
      const pts = total + (MAX_TRIES - next.length + 1) * 100;
      setTotal(pts); onScoreUpdate?.(pts); setState('won'); playSfx('win');
    } else if (next.length >= MAX_TRIES) { setState('lost'); playSfx('lose'); }
    else playSfx('click');
  };

  const reset = () => { setCode(newCode()); setRows([]); setCur([]); setState('play'); };

  const Peg = ({ i, size = 'w-8 h-8' }: { i: number; size?: string }) => (
    <span className={`${size} rounded-full border border-border inline-block`} style={{ background: COLORS[i] }} />
  );

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 text-foreground">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-bold">Code Breaker</h2>
        <span className="text-sm text-muted-foreground">Score: {total}</span>
      </div>
      <p className="text-xs text-muted-foreground">Crack the 4-colour code. ● = right colour & spot, ○ = right colour, wrong spot.</p>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between bg-card/60 rounded-lg p-2 border border-border">
            <div className="flex gap-2">{r.guess.map((g, j) => <Peg key={j} i={g} />)}</div>
            <span className="text-sm font-mono">{'●'.repeat(r.exact)}{'○'.repeat(r.near)}</span>
          </div>
        ))}
      </div>
      {state === 'play' ? (
        <>
          <div className="flex gap-2 justify-center min-h-10 items-center">
            {Array.from({ length: LEN }).map((_, i) => cur[i] !== undefined
              ? <button key={i} onClick={() => setCur(cur.filter((_, k) => k !== i))}><Peg i={cur[i]} size="w-10 h-10" /></button>
              : <span key={i} className="w-10 h-10 rounded-full border-2 border-dashed border-border" />)}
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            {COLORS.map((_, i) => (
              <button key={i} aria-label={`Colour ${i + 1}`} onClick={() => cur.length < LEN && setCur([...cur, i])} className="hover:scale-110 transition-transform">
                <Peg i={i} size="w-11 h-11" />
              </button>
            ))}
          </div>
          <Button className="w-full" disabled={cur.length !== LEN} onClick={submit}>Guess ({MAX_TRIES - rows.length} left)</Button>
        </>
      ) : (
        <div className="text-center space-y-3">
          <p className="font-bold text-lg">{state === 'won' ? 'Code cracked!' : 'Out of guesses'}</p>
          <div className="flex gap-2 justify-center">{code.map((c, i) => <Peg key={i} i={c} />)}</div>
          <Button onClick={reset}>{state === 'won' ? 'Next code' : 'Try again'}</Button>
        </div>
      )}
    </div>
  );
};

export default CodeBreaker;
