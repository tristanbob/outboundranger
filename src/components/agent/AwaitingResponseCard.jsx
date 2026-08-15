import { Button } from '@/components/ui/button';
import { Loader2, Reply } from 'lucide-react';

export default function AwaitingResponseCard({ action, busy, onGenerate }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/80 p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-stone-900">Message sent to {action.lead_name}</div>
        <p className="text-xs text-stone-500 mt-0.5 capitalize">
          {action.action_type?.replace(/_/g, ' ')} via {action.channel || 'email'} — waiting on the customer.
        </p>
      </div>
      <Button size="sm" disabled={busy} onClick={() => onGenerate(action)} className="bg-[#101418] hover:bg-stone-700 rounded-full shrink-0">
        {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Reply className="w-4 h-4 mr-1.5" />}
        {busy ? 'Customer responding…' : 'Generate customer response'}
      </Button>
    </div>
  );
}