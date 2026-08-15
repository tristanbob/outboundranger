import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export default function ScheduledCard({ action }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="capitalize">{action.action_type.replace(/_/g, ' ')}</Badge>
        <Badge variant="outline" className="capitalize">{action.channel}</Badge>
        <span className="ml-auto text-xs text-stone-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Sends {action.scheduled_for ? new Date(action.scheduled_for).toLocaleString() : 'shortly'}
        </span>
      </div>
      {action.subject && <div className="text-sm font-semibold text-stone-800">{action.subject}</div>}
      <p className="text-sm text-stone-600 whitespace-pre-wrap">{action.message}</p>
      {action.timing_reason && <p className="text-xs text-stone-400 italic">{action.timing_reason}</p>}
    </div>
  );
}