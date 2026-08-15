import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import MemoryCard from '@/components/memory/MemoryCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

export default function Memory() {
  const [entries, setEntries] = useState(null);
  const [insight, setInsight] = useState('');
  const [category, setCategory] = useState('strategy');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setEntries(await base44.entities.MemoryEntry.list('-created_date', 200));
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    setSaving(true);
    await base44.entities.MemoryEntry.create({ insight, category, source: 'manual', active: true });
    setInsight('');
    setSaving(false);
    await load();
  };

  const toggle = async (entry, active) => {
    await base44.entities.MemoryEntry.update(entry.id, { active });
    await load();
  };

  const remove = async (entry) => {
    await base44.entities.MemoryEntry.delete(entry.id);
    await load();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">Playbook memory</h1>
        <p className="text-sm text-stone-400 mt-1">Learnings from your feedback and observed outcomes. Active entries directly shape the agent's next actions — toggle off or delete any you disagree with.</p>
      </header>

      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-3">
        <Textarea rows={2} value={insight} onChange={(e) => setInsight(e.target.value)} placeholder="Teach the agent a rule, e.g. 'Never mention pricing in a first touch'" />
        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="targeting">Targeting</SelectItem>
              <SelectItem value="messaging">Messaging</SelectItem>
              <SelectItem value="channel">Channel</SelectItem>
              <SelectItem value="timing">Timing</SelectItem>
              <SelectItem value="strategy">Strategy</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" disabled={!insight.trim() || saving} onClick={add} className="bg-[#101418] hover:bg-stone-700 rounded-full">
            <Plus className="w-4 h-4 mr-1.5" /> Add learning
          </Button>
        </div>
      </div>

      {!entries ? (
        <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 py-12 text-center text-sm text-stone-400">
          No learnings yet — approve, edit, or reject a proposal and the agent will start building its playbook.
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => <MemoryCard key={e.id} entry={e} onToggle={toggle} onDelete={remove} />)}
        </div>
      )}
    </div>
  );
}