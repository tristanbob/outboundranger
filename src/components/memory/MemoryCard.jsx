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

export default function MemoryCard({ entry, onToggle, onDelete }) {
  return (
    <div className={`bg-white rounded-xl border border-stone-200/80 px-5 py-4 flex items-start gap-4 ${!entry.active ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-800 leading-relaxed">{entry.insight}</p>
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          <Badge variant="outline" className={`text-xs capitalize ${CATEGORY_STYLES[entry.category] || ''}`}>{entry.category}</Badge>
          <Badge variant="outline" className="text-xs capitalize">from {entry.source}</Badge>
          {entry.source_detail && <span className="text-xs text-stone-400 truncate">{entry.source_detail}</span>}
        </div>
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