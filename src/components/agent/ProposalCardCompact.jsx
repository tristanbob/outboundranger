import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Pencil, Loader2 } from 'lucide-react';
import EditDialog from './EditDialog';
import ScheduledMeta from './ScheduledMeta';

export default function ProposalCardCompact({ action, busy, onApprove }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-3">
      <ScheduledMeta channel={action.channel} scheduledFor={action.scheduled_for} />
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="capitalize">{action.action_type.replace(/_/g, ' ')}</Badge>
      </div>
      {action.subject && <div className="text-sm font-semibold text-stone-800">{action.subject}</div>}
      <p className="text-sm text-stone-600 whitespace-pre-wrap">{action.message}</p>
      {action.timing_reason && <p className="text-xs text-stone-400 italic">{action.timing_reason}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" disabled={busy} onClick={() => setEditOpen(true)}>
          <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
        </Button>
        <Button size="sm" disabled={busy} onClick={() => onApprove(action)}>
          {busy ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
          Approve
        </Button>
      </div>
      {editOpen && (
        <EditDialog
          action={action}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSave={(edits) => { setEditOpen(false); onApprove(action, edits); }}
        />
      )}
    </div>
  );
}