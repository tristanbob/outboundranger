import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const CATEGORY_STYLES = {
  targeting: 'bg-violet-50 text-violet-700 border-violet-200',
  messaging: 'bg-sky-50 text-sky-700 border-sky-200',
  channel: 'bg-teal-50 text-teal-700 border-teal-200',
  timing: 'bg-orange-50 text-orange-700 border-orange-200',
  strategy: 'bg-stone-100 text-stone-600 border-stone-200',
};

function TrackRecord({ entry }) {
  const applied = entry.applied_count || 0;
  const positive = entry.positive_count || 0;
  if (!applied) {
    return <span className="text-xs text-stone-400">Not yet tested — the agent hasn't applied this.</span>;
  }
  const rate = Math.round((positive / applied) * 100);
  const tone = rate >= 50 ? 'bg-emerald-500' : rate >= 34 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2 w-full max-w-xs">
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-xs text-stone-500 whitespace-nowrap">{positive}/{applied} worked · {rate}%</span>
    </div>
  );
}

export default function MemoryCard({ entry, onToggle, onDelete }) {
  const isRule = entry.tier === 'operator_rule';
  return (
    <div className={`bg-white rounded-xl border px-5 py-4 flex items-start gap-4 ${isRule ? 'border-stone-300' : 'border-stone-200/80'} ${!entry.active ? 'opacity-60' : ''}`}>
      <div className="flex-1 min-w-0 space-y-2.5">
        <p className="text-sm text-stone-800 leading-relaxed">{entry.insight}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={isRule ? 'text-xs border-stone-800 bg-stone-900 text-white' : 'text-xs border-indigo-200 bg-indigo-50 text-indigo-700'}>
            {isRule ? 'Your rule — always obeyed' : 'Learned tactic'}
          </Badge>
          <Badge variant="outline" className={`text-xs capitalize ${CATEGORY_STYLES[entry.category] || ''}`}>{entry.category}</Badge>
          {entry.scope && <span className="text-xs text-stone-500">applies to: {entry.scope}</span>}
          <Badge variant="outline" className="text-xs capitalize">from {entry.source}</Badge>
        </div>
        {!isRule && <TrackRecord entry={entry} />}
        {entry.retire_reason && !entry.active && (
          <p className="text-xs text-red-500">{entry.retire_reason}</p>
        )}
        {entry.source_detail && <p className="text-xs text-stone-400 truncate">{entry.source_detail}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Switch checked={!!entry.active} onCheckedChange={(v) => onToggle(entry, v)} />
        <Button variant="ghost" size="icon" onClick={() => onDelete(entry)} className="text-stone-300 hover:text-red-500 h-8 w-8">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}