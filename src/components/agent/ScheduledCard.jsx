import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Pencil } from 'lucide-react';
import ScheduledEditDialog from './ScheduledEditDialog';

export default function ScheduledCard({ action }) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(action);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="capitalize">{current.action_type.replace(/_/g, ' ')}</Badge>
        <Badge variant="outline" className="capitalize">{current.channel}</Badge>
        <span className="ml-auto text-xs text-stone-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Sends {current.scheduled_for ? new Date(current.scheduled_for).toLocaleString() : 'shortly'}
        </span>
      </div>
      {current.subject && <div className="text-sm font-semibold text-stone-800">{current.subject}</div>}
      <p className="text-sm text-stone-600 whitespace-pre-wrap">{current.message}</p>
      {current.timing_reason && <p className="text-xs text-stone-400 italic">{current.timing_reason}</p>}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
        </Button>
      </div>
      {editing && (
        <ScheduledEditDialog
          action={current}
          open={editing}
          onOpenChange={setEditing}
          onSaved={(patch) => setCurrent((c) => ({ ...c, ...patch }))}
        />
      )}
    </div>
  );
}