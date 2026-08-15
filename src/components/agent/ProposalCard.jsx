import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Pencil, X, Loader2, Target, Lightbulb, TrendingUp, ShieldAlert } from 'lucide-react';
import EditDialog from './EditDialog';
import RejectDialog from './RejectDialog';

export default function ProposalCard({ action, busy, onApprove, onReject }) {
  const [editOpen, setEditOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-indigo-200 shadow-[0_1px_12px_rgba(79,70,229,0.08)] overflow-hidden">
      <div className="px-6 pt-5 pb-4 flex flex-wrap items-center gap-2 border-b border-stone-100">
        <Badge className="bg-indigo-600 hover:bg-indigo-600 capitalize">{action.action_type.replace(/_/g, ' ')}</Badge>
        <Badge variant="outline" className="capitalize">{action.channel}</Badge>
        {action.risk_level === 'high' && (
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600">
            <ShieldAlert className="w-3 h-3 mr-1" /> High risk — approval required
          </Badge>
        )}
        <span className="ml-auto text-xs text-stone-400">Confidence {action.confidence}%</span>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-stone-400 mb-1 flex items-center gap-1.5"><Target className="w-3 h-3" /> Target</div>
          <div className="text-sm font-medium text-stone-900">{action.lead_name}</div>
        </div>

        <div className="bg-stone-50 rounded-xl border border-stone-200/70 p-4">
          {action.subject && <div className="text-sm font-semibold text-stone-800 mb-2">{action.subject}</div>}
          <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">{action.message}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-stone-400 mb-1 flex items-center gap-1.5"><Lightbulb className="w-3 h-3" /> Why this action</div>
            <p className="text-sm text-stone-600">{action.reasoning}</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-stone-400 mb-1 flex items-center gap-1.5"><TrendingUp className="w-3 h-3" /> Expected effect</div>
            <p className="text-sm text-stone-600">{action.expected_effect}</p>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-stone-400 mb-1">Evidence used</div>
          <p className="text-xs text-stone-500 italic">{action.evidence}</p>
        </div>
      </div>

      <div className="px-6 py-4 bg-stone-50/60 border-t border-stone-100 flex flex-wrap gap-2 justify-end">
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => setRejectOpen(true)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <X className="w-4 h-4 mr-1.5" /> Reject
        </Button>
        <Button variant="outline" size="sm" disabled={busy} onClick={() => setEditOpen(true)}>
          <Pencil className="w-4 h-4 mr-1.5" /> Edit
        </Button>
        <Button size="sm" disabled={busy} onClick={() => onApprove(action)} className="bg-emerald-600 hover:bg-emerald-700">
          {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
          {busy ? 'Executing…' : 'Approve & send'}
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
      <RejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onReject={(reason) => { setRejectOpen(false); onReject(action, reason); }}
      />
    </div>
  );
}