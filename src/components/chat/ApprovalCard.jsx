import { Check, X, ShieldCheck, Play, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';

const KIND_LABEL = {
  operator_rule: { label: 'Save a new rule', icon: BookMarked },
  run_cycle: { label: 'Run a work cycle', icon: Play },
};

export default function ApprovalCard({ request, busy, onResolve }) {
  const { label, icon: Icon } = KIND_LABEL[request.kind] || KIND_LABEL.operator_rule;
  const pending = request.status === 'pending';

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
        <Icon className="w-3.5 h-3.5" />
        {label}
        <span className="ml-auto flex items-center gap-1 text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5" /> Needs your approval
        </span>
      </div>
      <p className="text-sm text-stone-800 mt-2">{request.summary}</p>
      {request.kind === 'operator_rule' && request.rule_scope && (
        <p className="text-xs text-stone-400 mt-1">Applies to: {request.rule_scope}</p>
      )}

      {pending ? (
        <div className="flex gap-2 mt-4">
          <Button size="sm" disabled={busy} onClick={() => onResolve(request, true)}>
            <Check className="w-3.5 h-3.5" /> Approve
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onResolve(request, false)}>
            <X className="w-3.5 h-3.5" /> Discard
          </Button>
        </div>
      ) : (
        <p className="text-xs text-stone-500 mt-3">{request.result}</p>
      )}
    </div>
  );
}