import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { orgScope } from '@/lib/org';
import { useToast } from '@/components/ui/use-toast';
import LeadsList from '@/components/leads/LeadsList';
import LeadProfile from '@/components/leads/LeadProfile';
import AddLeadDialog from '@/components/leads/AddLeadDialog';
import FindLeadsButton from '@/components/agent/FindLeadsButton';
import { useAgentLoop } from '@/components/agent/useAgentLoop';

export default function Leads() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    const [leads, actions, messages] = await Promise.all([
      base44.entities.Lead.filter(orgScope(), '-signal_strength', 200),
      base44.entities.AgentAction.filter(orgScope(), '-created_date', 300),
      base44.entities.Message.filter(orgScope(), 'created_date', 500),
    ]);
    setData({ leads, actions, messages });
    setSelectedId((id) => id || leads[0]?.id || null);
  }, []);

  useEffect(() => { load(); }, [load]);

  const { busyId, approve, reject, generateResponse } = useAgentLoop(load);

  if (!data) {
    return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>;
  }

  const { leads, actions, messages } = data;
  const q = query.trim().toLowerCase();
  const filtered = q
    ? leads.filter((l) => [l.name, l.company, l.title].some((v) => (v || '').toLowerCase().includes(q)))
    : leads;
  const selected = leads.find((l) => l.id === selectedId) || null;
  const leadActions = selected ? actions.filter((a) => a.lead_id === selected.id) : [];

  const handleApprove = async (action, edits) => {
    await approve(action, edits);
    toast({ title: edits ? 'Edited & sent' : 'Approved & sent' });
  };

  const handleReject = async (action, reason) => {
    await reject(action, reason);
    toast({ title: 'Rejected', description: 'Your reason was turned into a playbook learning.' });
  };

  const handleGenerateResponse = async (action) => {
    await generateResponse(action);
    toast({ title: 'Customer responded' });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-xl md:text-2xl font-bold text-stone-900 tracking-tight">Customers</h1>
          <p className="text-sm text-stone-400 mt-1">Everything known about each customer and the full history of what the agent has done with them.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
          <FindLeadsButton onDone={load} />
          <AddLeadDialog onAdded={load} />
        </div>
      </header>

      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 py-12 text-center text-sm text-stone-400">
          No customers yet — add one to give the agent someone to work.
        </div>
      ) : (
        <div className="grid lg:grid-cols-[20rem_1fr] gap-6 items-start">
          <LeadsList
            leads={filtered}
            query={query}
            onQuery={setQuery}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          {selected ? (
            <LeadProfile
              lead={selected}
              proposal={leadActions.find((a) => a.status === 'proposed')}
              awaiting={leadActions.find((a) => a.status === 'executed')}
              actions={leadActions}
              messages={messages.filter((m) => m.lead_id === selected.id)}
              busyId={busyId}
              onApprove={handleApprove}
              onReject={handleReject}
              onGenerateResponse={handleGenerateResponse}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200/80 py-12 text-center text-sm text-stone-400">
              Select a customer to see their profile.
            </div>
          )}
        </div>
      )}
    </div>
  );
}