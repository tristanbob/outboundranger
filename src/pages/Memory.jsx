import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { orgScope } from '@/lib/org';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MemoryGroupedList from '@/components/memory/MemoryGroupedList';
import MemoryCard from '@/components/memory/MemoryCard';
import DossierCard from '@/components/memory/DossierCard';
import AddRuleForm from '@/components/memory/AddRuleForm';

function Empty({ children }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-stone-300 py-10 text-center text-sm text-stone-400 px-6">{children}</div>
  );
}

function Blurb({ children }) {
  return <p className="text-xs text-stone-400 leading-relaxed">{children}</p>;
}

export default function Memory() {
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const [entries, leads] = await Promise.all([
      base44.entities.MemoryEntry.filter(orgScope(), '-created_date', 200),
      base44.entities.Lead.filter(orgScope(), '-dossier_updated', 200),
    ]);
    setData({ entries, leads });
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (entry, active) => {
    await base44.entities.MemoryEntry.update(entry.id, { active, ...(active ? { retire_reason: '' } : {}) });
    await load();
  };

  const remove = async (entry) => {
    await base44.entities.MemoryEntry.delete(entry.id);
    await load();
  };

  if (!data) {
    return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>;
  }

  const { entries, leads } = data;
  const rules = entries.filter((e) => e.tier === 'operator_rule');
  const playbook = entries.filter((e) => e.tier !== 'operator_rule' && e.active);
  const retired = entries.filter((e) => e.tier !== 'operator_rule' && !e.active);
  const dossiers = leads.filter((l) => l.dossier);

  const tab = (value, label, count) => (
    <TabsTrigger value={value} className="gap-1.5">
      {label}
      <span className="text-xs text-stone-400">{count}</span>
    </TabsTrigger>
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">What the agent has learned</h1>
        <p className="text-sm text-stone-400 mt-1">Your rules are absolute, learned tactics have to earn their place, and each customer gets their own dossier.</p>
      </header>

      <Tabs defaultValue="rules" className="space-y-5">
        <TabsList>
          {tab('rules', 'Your rules', rules.length)}
          {tab('playbook', 'Playbook', playbook.length)}
          {tab('dossiers', 'Dossiers', dossiers.length)}
          {tab('retired', 'Retired', retired.length)}
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Blurb>Hard constraints from you, captured whenever you reject or edit a draft. These override the agent's own judgment and never get retired.</Blurb>
          <AddRuleForm onAdded={load} />
          {rules.length === 0 ? (
            <Empty>No rules yet — reject or edit a proposal with a reason and your preference is captured here.</Empty>
          ) : (
            <MemoryGroupedList entries={rules} onToggle={toggle} onDelete={remove} />
          )}
        </TabsContent>

        <TabsContent value="playbook" className="space-y-4">
          <Blurb>Tactics derived from real outcomes. Each shows how often actions using it actually worked; the agent weighs them accordingly.</Blurb>
          {playbook.length === 0 ? (
            <Empty>Nothing learned yet — run a cycle and the agent will start forming tactics from what happens.</Empty>
          ) : (
            <MemoryGroupedList entries={playbook} onToggle={toggle} onDelete={remove} />
          )}
        </TabsContent>

        <TabsContent value="dossiers" className="space-y-4">
          <Blurb>Durable facts about each specific person — their objection, timeline and what we already tried. Never generalized into the playbook.</Blurb>
          {dossiers.length === 0 ? (
            <Empty>No dossiers yet — the agent builds one for a customer after its first send.</Empty>
          ) : (
            <div className="space-y-2">
              {dossiers.map((l) => <DossierCard key={l.id} lead={l} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="retired" className="space-y-4">
          <Blurb>Tactics that stopped earning their keep and were dropped. Switch one back on if you disagree.</Blurb>
          {retired.length === 0 ? (
            <Empty>Nothing retired yet.</Empty>
          ) : (
            <div className="space-y-2">
              {retired.map((e) => <MemoryCard key={e.id} entry={e} onToggle={toggle} onDelete={remove} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}