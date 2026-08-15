import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { getCurrentOrgId } from '@/lib/org';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

export default function AddRuleForm({ onAdded }) {
  const [insight, setInsight] = useState('');
  const [category, setCategory] = useState('messaging');
  const [scope, setScope] = useState('');
  const [saving, setSaving] = useState(false);

  const add = async () => {
    setSaving(true);
    await base44.entities.MemoryEntry.create({
      org_id: getCurrentOrgId(),
      insight,
      tier: 'operator_rule',
      scope: scope.trim() || 'all leads',
      category,
      source: 'manual',
      applied_count: 0,
      positive_count: 0,
      active: true,
    });
    setInsight('');
    setScope('');
    setSaving(false);
    await onAdded();
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-3">
      <Textarea rows={2} value={insight} onChange={(e) => setInsight(e.target.value)} placeholder="Tell the agent a rule it must always obey, e.g. 'Never mention pricing in a first touch'" />
      <div className="flex flex-wrap items-center gap-2">
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
        <Input value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Applies to (default: all leads)" className="w-56" />
        <Button size="sm" disabled={!insight.trim() || saving} onClick={add} className="bg-[#101418] hover:bg-stone-700 rounded-full">
          <Plus className="w-4 h-4 mr-1.5" /> Add rule
        </Button>
      </div>
    </div>
  );
}