import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import ScheduledEditDialog from './ScheduledEditDialog';
import ScheduledMeta from './ScheduledMeta';
import SendNowButton from './SendNowButton';

export default function ScheduledCard({ action, onSent }) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(action);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-3">
      <ScheduledMeta channel={current.channel} scheduledFor={current.scheduled_for} />
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="capitalize">{current.action_type.replace(/_/g, ' ')}</Badge>
      </div>
      {current.subject && <div className="text-sm font-semibold text-stone-800">{current.subject}</div>}
      <p className="text-sm text-stone-600 whitespace-pre-wrap">{current.message}</p>
      {current.timing_reason && <p className="text-xs text-stone-400 italic">{current.timing_reason}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
        </Button>
        <SendNowButton action={current} onSent={onSent} />
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