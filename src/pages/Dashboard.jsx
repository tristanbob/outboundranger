import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { orgScope, getCurrentOrgId } from '@/lib/org';
import { useToast } from '@/components/ui/use-toast';
import StatCards from '@/components/agent/StatCards';
import ProposalCard from '@/components/agent/ProposalCard';
import AwaitingResponseCard from '@/components/agent/AwaitingResponseCard';
import ActivityItem from '@/components/activity/ActivityItem';
import { useAgentLoop } from '@/components/agent/useAgentLoop';
import { Send, MessageSquare, CalendarCheck, Brain, Sparkles } from 'lucide-react';

const DEFAULT_CONFIG = {
  goal: 'Book discovery meetings with warm, high-signal B2B leads.',
  mode: 'propose',
  paused: false,
  daily_action_limit: 10,
  allowed_channels: ['email', 'linkedin'],
};

export default function Dashboard() {
  const { toast } = useToast();
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const [cfgs, actions, memories] = await Promise.all([
      base44.entities.AgentConfig.filter(orgScope()),
      base44.entities.AgentAction.filter(orgScope(), '-created_date', 100),
      base44.entities.MemoryEntry.filter(orgScope(), '-created_date', 100),
    ]);
    let config = cfgs[0];
    if (!config) config = await base44.entities.AgentConfig.create({ ...DEFAULT_CONFIG, org_id: getCurrentOrgId() });
    setData({ config, actions, memories });
  }, []);

  useEffect(() => { load(); }, [load]);

  const { busyId, approve, reject, generateResponse } = useAgentLoop(load);

  if (!data) {
    return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>;
  }

  const { config, actions, memories } = data;
  const proposals = actions.filter((a) => a.status === 'proposed');
  const awaiting = actions.filter((a) => a.status === 'executed');
  const completed = actions.filter((a) => a.status === 'completed');
  const positive = completed.filter((a) => ['reply', 'meeting_booked', 'conversion'].includes(a.outcome));
  const recent = actions.slice(0, 5);

  const handleApprove = async (action, edits) => {
    await approve(action, edits);
    toast({
      title: edits ? 'Edited & sent' : 'Approved & sent',
      description: action.mode === 'autopilot'
        ? 'Outcome recorded — check Activity and Memory for what the agent learned.'
        : "Message delivered — generate the customer's response when you're ready.",
    });
  };

  const handleGenerateResponse = async (action) => {
    await generateResponse(action);
    toast({ title: 'Customer responded', description: 'Outcome recorded — check Activity and Memory for what the agent learned.' });
  };

  const handleReject = async (action, reason) => {
    await reject(action, reason);
    toast({ title: 'Rejected', description: 'Your reason was turned into a playbook learning.' });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">Agent</h1>
        <p className="text-sm text-stone-400 mt-1">One loop: find the signal, propose, execute, learn.</p>
      </header>

      <StatCards stats={[
        { label: 'Actions executed', value: completed.length, icon: Send, accent: 'bg-indigo-50 text-indigo-600' },
        { label: 'Replies & meetings', value: positive.length, icon: MessageSquare, accent: 'bg-sky-50 text-sky-600' },
        { label: 'Conversions', value: completed.filter((a) => a.outcome === 'conversion').length, icon: CalendarCheck, accent: 'bg-emerald-50 text-emerald-600' },
        { label: 'Playbook learnings', value: memories.filter((m) => m.active).length, icon: Brain, accent: 'bg-amber-50 text-amber-600' },
      ]} />

      {awaiting.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-sm font-semibold text-stone-500 uppercase tracking-wide">Awaiting customer response</h2>
          {awaiting.map((a) => (
            <AwaitingResponseCard key={a.id} action={a} busy={busyId === a.id} onGenerate={handleGenerateResponse} />
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold text-stone-500 uppercase tracking-wide">Awaiting your decision</h2>
        {proposals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 py-12 flex flex-col items-center text-center px-6">
            <Sparkles className="w-6 h-6 text-stone-300 mb-3" />
            <p className="text-sm text-stone-500">No pending proposals.</p>
            <p className="text-xs text-stone-400 mt-1">Run an agent cycle — the agent will scan your leads and propose (or autopilot) the next best action.</p>
          </div>
        ) : (
          proposals.map((a) => (
            <ProposalCard key={a.id} action={a} busy={busyId === a.id} onApprove={handleApprove} onReject={handleReject} />
          ))
        )}
      </section>

      {recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-sm font-semibold text-stone-500 uppercase tracking-wide">Recent activity</h2>
          <div className="space-y-2">
            {recent.map((a) => <ActivityItem key={a.id} action={a} />)}
          </div>
        </section>
      )}
    </div>
  );
}