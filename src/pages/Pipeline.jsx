import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { orgScope, getCurrentOrgId } from '@/lib/org';
import { useToast } from '@/components/ui/use-toast';
import PipelineBoard from '@/components/pipeline/PipelineBoard';
import LeadDrawer from '@/components/pipeline/LeadDrawer';
import AddLeadDialog from '@/components/leads/AddLeadDialog';
import FindLeadsButton from '@/components/agent/FindLeadsButton';
import BoardLegend from '@/components/pipeline/BoardLegend';
import { useAgentLoop } from '@/components/agent/useAgentLoop';
import { useLiveBoard } from '@/components/pipeline/useLiveBoard';

const DEFAULT_CONFIG = {
  goal: 'Book discovery meetings with warm, high-signal B2B leads.',
  mode: 'propose',
  paused: false,
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
  useLiveBoard(load);

  const { busyId, approve, reject, generateResponse } = useAgentLoop(load);

  if (!data) {
    return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>;
  }

  const { config, leads, actions, memories, messages, profile } = data;
  const proposals = actions.filter((a) => a.status === 'proposed');
  const openLead = leads.find((l) => l.id === openLeadId) || null;

  const handleFindLeads = async (created) => {
    await load();
    toast({
      title: created.length ? `${created.length} new lead${created.length > 1 ? 's' : ''} sourced` : 'No new leads found',
      description: created.length
        ? created.map((l) => `${l.name} · ${l.company}`).join(', ')
        : 'Everything the agent found is already in your pipeline.',
    });
  };

  const handleApprove = async (action, edits) => {
    await approve(action, edits);
    toast({
      title: edits ? 'Edited & sent' : 'Approved & sent',
      description: action.mode === 'autopilot'
        ? 'The customer responded — see the card for what happened.'
        : "Message delivered — generate the customer's response when you're ready.",
    });
  };

  const handleGenerateResponse = async (action) => {
    await generateResponse(action);
    toast({ title: 'Customer responded', description: 'See the conversation and outcome on the card.' });
  };

  const handleReject = async (action, reason) => {
    await reject(action, reason);
    toast({ title: 'Rejected', description: 'Your reason was turned into a playbook learning.' });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-xl md:text-2xl font-bold text-stone-900 tracking-tight">Pipeline</h1>
        </div>
        {leads.length > 0 && <div className="hidden sm:block ml-auto"><BoardLegend /></div>}
        <div className="flex items-center gap-2 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
          <FindLeadsButton onDone={handleFindLeads} />
          <AddLeadDialog onAdded={load} />
        </div>
      </header>

      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 py-12 text-center text-sm text-stone-400">
          No leads yet — add your first lead to give the agent a pipeline to work.
        </div>
      ) : (
        <>
        <div className="sm:hidden"><BoardLegend /></div>
        <PipelineBoard
          leads={leads}
          proposals={proposals}
          messages={messages}
          onOpen={(lead) => setOpenLeadId(lead.id)}
        />
        </>
      )}

      <LeadDrawer
        lead={openLead}
        proposal={proposals.find((p) => p.lead_id === openLeadId)}
        awaiting={actions.find((a) => a.lead_id === openLeadId && a.status === 'executed')}
        actions={actions.filter((a) => a.lead_id === openLeadId)}
        messages={messages.filter((m) => m.lead_id === openLeadId)}
        busyId={busyId}
        onApprove={handleApprove}
        onReject={handleReject}
        onGenerateResponse={handleGenerateResponse}
        onClose={() => setOpenLeadId(null)}
      />
    </div>
  );
}