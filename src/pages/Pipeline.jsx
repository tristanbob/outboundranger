import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { orgScope, getCurrentOrgId } from '@/lib/org';
import { useToast } from '@/components/ui/use-toast';
import AgentStatusBar from '@/components/agent/AgentStatusBar';
import StatCards from '@/components/agent/StatCards';
import PipelineBoard from '@/components/pipeline/PipelineBoard';
import LeadDrawer from '@/components/pipeline/LeadDrawer';
import AddLeadDialog from '@/components/leads/AddLeadDialog';
import FindLeadsButton from '@/components/agent/FindLeadsButton';
import BoardLegend from '@/components/pipeline/BoardLegend';
import { useAgentLoop } from '@/components/agent/useAgentLoop';
import { Users, Sparkles, CalendarCheck, Brain } from 'lucide-react';

const DEFAULT_CONFIG = {
  goal: 'Book discovery meetings with warm, high-signal B2B leads.',
  mode: 'propose',
  paused: false,
  daily_action_limit: 10,
  allowed_channels: ['email', 'linkedin'],
};

export default function Pipeline() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [openLeadId, setOpenLeadId] = useState(null);

  const load = useCallback(async () => {
    const [cfgs, leads, actions, memories, messages, profiles] = await Promise.all([
      base44.entities.AgentConfig.filter(orgScope()),
      base44.entities.Lead.filter(orgScope(), '-signal_strength', 200),
      base44.entities.AgentAction.filter(orgScope(), '-created_date', 200),
      base44.entities.MemoryEntry.filter(orgScope(), '-created_date', 200),
      base44.entities.Message.filter(orgScope(), 'created_date', 500),
      base44.entities.CompanyProfile.filter(orgScope(), '-created_date', 1),
    ]);
    let config = cfgs[0];
    if (!config) config = await base44.entities.AgentConfig.create({ ...DEFAULT_CONFIG, org_id: getCurrentOrgId() });
    setData({ config, leads, actions, memories, messages, profile: profiles[0] || null });
  }, []);

  useEffect(() => { load(); }, [load]);

  const { running, busyId, runCycle, approve, reject } = useAgentLoop(load);

  if (!data) {
    return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>;
  }

  const { config, leads, actions, memories, messages, profile } = data;
  const proposals = actions.filter((a) => a.status === 'proposed');
  const openLead = leads.find((l) => l.id === openLeadId) || null;

  const handleRun = async () => {
    const res = await runCycle();
    toast({ title: res.ok ? 'Agent cycle complete' : 'Agent stopped', description: res.message });
  };

  const handleFindLeads = async (created) => {
    await load();
    toast({
      title: created.length ? `${created.length} new lead${created.length > 1 ? 's' : ''} sourced` : 'No new leads found',
      description: created.length
        ? created.map((l) => `${l.name} · ${l.company}`).join(', ')
        : 'Everything the agent found is already in your pipeline.',
    });
  };

  const handleTogglePause = async () => {
    await base44.entities.AgentConfig.update(config.id, { paused: !config.paused });
    await load();
  };

  const handleMove = async (lead, status) => {
    setData((d) => ({ ...d, leads: d.leads.map((l) => (l.id === lead.id ? { ...l, status } : l)) }));
    await base44.entities.Lead.update(lead.id, { status });
    await load();
  };

  const handleApprove = async (action, edits) => {
    await approve(action, edits);
    toast({ title: edits ? 'Edited & sent' : 'Approved & sent', description: 'The customer responded — see the card for what happened.' });
  };

  const handleReject = async (action, reason) => {
    await reject(action, reason);
    toast({ title: 'Rejected', description: 'Your reason was turned into a playbook learning.' });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">Pipeline</h1>
          <p className="text-sm text-stone-400 mt-1">Every customer, tracked as the agent moves them through the GTM process. The marker on each card shows whose turn it is; drag a card to override a stage.</p>
        </div>
        <div className="flex items-center gap-2">
          <FindLeadsButton config={config} leads={leads} memories={memories} profile={profile} onDone={handleFindLeads} />
          <AddLeadDialog onAdded={load} />
        </div>
      </header>

      <AgentStatusBar config={config} running={running} onRun={handleRun} onTogglePause={handleTogglePause} />

      <StatCards stats={[
        { label: 'Leads in pipeline', value: leads.filter((l) => !['converted', 'unsubscribed'].includes(l.status)).length, icon: Users },
        { label: 'Awaiting your decision', value: proposals.length, icon: Sparkles },
        { label: 'Meetings & conversions', value: leads.filter((l) => ['meeting_booked', 'converted'].includes(l.status)).length, icon: CalendarCheck },
        { label: 'Playbook learnings', value: memories.filter((m) => m.active).length, icon: Brain },
      ]} />

      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 py-12 text-center text-sm text-stone-400">
          No leads yet — add your first lead to give the agent a pipeline to work.
        </div>
      ) : (
        <>
        <BoardLegend />
        <PipelineBoard
          leads={leads}
          proposals={proposals}
          messages={messages}
          onMove={handleMove}
          onOpen={(lead) => setOpenLeadId(lead.id)}
        />
        </>
      )}

      <LeadDrawer
        lead={openLead}
        proposal={proposals.find((p) => p.lead_id === openLeadId)}
        actions={actions.filter((a) => a.lead_id === openLeadId)}
        messages={messages.filter((m) => m.lead_id === openLeadId)}
        busyId={busyId}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={() => setOpenLeadId(null)}
      />
    </div>
  );
}