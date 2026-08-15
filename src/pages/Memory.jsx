import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import MemoryCard from '@/components/memory/MemoryCard';
import DossierCard from '@/components/memory/DossierCard';
import AddRuleForm from '@/components/memory/AddRuleForm';
import { Lock, TrendingUp, User, Archive } from 'lucide-react';

function Section({ icon: Icon, title, blurb, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-heading text-sm font-semibold text-stone-700 flex items-center gap-2">
          <Icon className="w-4 h-4 text-stone-400" /> {title}
        </h2>
        <p className="text-xs text-stone-400 mt-1">{blurb}</p>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-stone-300 py-8 text-center text-sm text-stone-400 px-6">{children}</div>
  );
}

export default function Memory() {
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const [entries, leads] = await Promise.all([
      base44.entities.MemoryEntry.list('-created_date', 200),
      base44.entities.Lead.list('-dossier_updated', 200),
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

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">What the agent has learned</h1>
        <p className="text-sm text-stone-400 mt-1">Three layers of memory: your rules are absolute, learned tactics have to earn their place, and each customer gets their own dossier.</p>
      </header>

      <Section
        icon={Lock}
        title="Your rules — always obeyed"
        blurb="Hard constraints from you, captured whenever you reject or edit a draft. These override the agent's own judgment and never get retired."
      >
        <AddRuleForm onAdded={load} />
        {rules.length === 0 ? (
          <Empty>No rules yet — reject or edit a proposal with a reason and your preference is captured here.</Empty>
        ) : (
          <div className="space-y-2">
            {rules.map((e) => <MemoryCard key={e.id} entry={e} onToggle={toggle} onDelete={remove} />)}
          </div>
        )}
      </Section>

      <Section
        icon={TrendingUp}
        title="Learned playbook — earning its place"
        blurb="Tactics derived from real outcomes. Each shows how often actions using it actually worked; the agent weighs them accordingly."
      >
        {playbook.length === 0 ? (
          <Empty>Nothing learned yet — run a cycle and the agent will start forming tactics from what happens.</Empty>
        ) : (
          <div className="space-y-2">
            {playbook.map((e) => <MemoryCard key={e.id} entry={e} onToggle={toggle} onDelete={remove} />)}
          </div>
        )}
      </Section>

      {retired.length > 0 && (
        <Section
          icon={Archive}
          title="Retired tactics"
          blurb="Rules that stopped earning their keep and were dropped. Switch one back on if you disagree."
        >
          <div className="space-y-2">
            {retired.map((e) => <MemoryCard key={e.id} entry={e} onToggle={toggle} onDelete={remove} />)}
          </div>
        </Section>
      )}

      <Section
        icon={User}
        title="Customer dossiers"
        blurb="Durable facts about each specific person — their objection, timeline and what we already tried. Never generalized into the playbook."
      >
        {dossiers.length === 0 ? (
          <Empty>No dossiers yet — the agent builds one for a customer after its first send.</Empty>
        ) : (
          <div className="space-y-2">
            {dossiers.map((l) => <DossierCard key={l.id} lead={l} />)}
          </div>
        )}
      </Section>
    </div>
  );
}