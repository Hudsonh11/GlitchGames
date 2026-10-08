import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Phone, PhoneOff, Headphones } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGame } from '@/contexts/GameContext';
import { AGENT_PRESENCE_CHANNEL, freshSince, useIsSupportAgent } from '@/lib/supportCall';
import { playSfx } from '@/lib/sfx';

interface Waiting { id: string; username: string | null; created_at: string }

/**
 * Mounted globally. For support agents: marks them online and pops an
 * incoming-call card when they are not on the Support tab.
 */
const AgentHub: React.FC = () => {
  const { session } = useGame();
  const userId = session?.user.id;
  const isAgent = useIsSupportAgent(userId);
  const location = useLocation();
  const navigate = useNavigate();
  const onTab = location.pathname === '/support';
  const [incoming, setIncoming] = useState<Waiting | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Presence: agent is online whenever signed in on the site.
  useEffect(() => {
    if (!isAgent || !userId) return;
    const ch = supabase.channel(AGENT_PRESENCE_CHANNEL, { config: { presence: { key: userId } } });
    ch.subscribe((status) => { if (status === 'SUBSCRIBED') ch.track({ online_at: new Date().toISOString() }); });
    return () => { supabase.removeChannel(ch); };
  }, [isAgent, userId]);

  // Notification permission is requested from the Support Desk via a button
  // (browsers ignore permission prompts without a click).

  // System notifications for new calls (works while the tab is in the background).
  const notifiedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!isAgent) return;
    const notify = (c: Waiting) => {
      if (notifiedRef.current.has(c.id)) return;
      notifiedRef.current.add(c.id);
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      if (document.visibilityState === 'visible' && onTab) return;
      try {
        const n = new Notification('📞 Incoming support call', {
          body: `${c.username ?? 'A player'} needs help — click to answer`,
          tag: `support-${c.id}`, requireInteraction: true,
        });
        n.onclick = () => { window.focus(); n.close(); navigate(`/support?answer=${c.id}`); };
      } catch { /* ignore */ }
    };
    const check = async () => {
      const { data } = await supabase.from('support_calls').select('id, username, created_at')
        .eq('status', 'waiting').gte('created_at', freshSince());
      (data ?? []).forEach(notify);
    };
    check();
    const ch = supabase.channel('agent-call-notify')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_calls' }, check)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAgent, onTab, navigate]);

  // Incoming calls while off the Support tab.
  useEffect(() => {
    if (!isAgent || onTab) { setIncoming(null); return; }
    const refresh = async () => {
      const { data } = await supabase.from('support_calls').select('id, username, created_at')
        .eq('status', 'waiting').gte('created_at', freshSince()).order('created_at', { ascending: true }).limit(5);
      const next = (data ?? []).find(c => !dismissed.has(c.id)) ?? null;
      setIncoming(prev => {
        if (next && next.id !== prev?.id) playSfx('notification');
        return next;
      });
    };
    refresh();
    const ch = supabase.channel('agent-incoming-calls')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_calls' }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAgent, onTab, dismissed]);

  if (!incoming) return null;

  return (
    <div role="alertdialog" aria-label="Incoming support call"
      className="fixed top-20 right-4 z-[60] w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border-2 border-primary/50 glass-panel shadow-2xl p-4 animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          <Headphones className="relative w-6 h-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-sm">Incoming support call</p>
          <p className="text-xs text-muted-foreground truncate">{incoming.username ?? 'A player'} needs help</p>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setDismissed(s => new Set(s).add(incoming.id))}
          aria-label="Dismiss call"
          className="flex-1 h-11 rounded-xl bg-destructive/15 text-destructive hover:bg-destructive/25 flex items-center justify-center transition-colors">
          <PhoneOff className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate(`/support?answer=${incoming.id}`)}
          aria-label="Answer call"
          className="flex-1 h-11 rounded-xl bg-success text-success-foreground hover:opacity-90 flex items-center justify-center animate-pulse">
          <Phone className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AgentHub;
