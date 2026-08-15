import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import LeadRow from '@/components/leads/LeadRow';
import AddLeadDialog from '@/components/leads/AddLeadDialog';

export default function Leads() {
  const [leads, setLeads] = useState(null);

  const load = useCallback(async () => {
    setLeads(await base44.entities.Lead.list('-signal_strength', 200));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">Leads</h1>
          <p className="text-sm text-stone-400 mt-1">The agent works this list, prioritized by buying signal.</p>
        </div>
        <AddLeadDialog onAdded={load} />
      </header>
      {!leads ? (
        <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 py-12 text-center text-sm text-stone-400">
          No leads yet — add your first lead to give the agent something to work.
        </div>
      ) : (
        <div className="space-y-2">
          {leads.map((l) => <LeadRow key={l.id} lead={l} />)}
        </div>
      )}
    </div>
  );
}