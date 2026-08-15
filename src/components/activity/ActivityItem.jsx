import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Zap, Eye } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_STYLES = {
  proposed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  executed: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

const OUTCOME_STYLES = {
  reply: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  meeting_booked: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  conversion: 'bg-emerald-600 text-white border-emerald-600',
  no_response: 'bg-stone-100 text-stone-500 border-stone-200',
  unsubscribe: 'bg-red-50 text-red-600 border-red-200',
};

export default function ActivityItem({ action }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-stone-200/80">
      <button onClick={() => setOpen(!open)} className="w-full px-5 py-4 flex flex-wrap items-center gap-2 text-left">
        {action.mode === 'autopilot'
          ? <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          : <Eye className="w-4 h-4 text-indigo-400 shrink-0" />}
        <span className="text-sm font-medium text-stone-800 capitalize">{action.action_type?.replace(/_/g, ' ')}</span>
        <span className="text-sm text-stone-400">→</span>
        <span className="text-sm text-stone-600 truncate">{action.lead_name}</span>
        <div className="ml-auto flex items-center gap-2">
          {action.was_edited && <Badge variant="outline" className="text-xs">edited</Badge>}
          <Badge variant="outline" className={`text-xs capitalize ${STATUS_STYLES[action.status] || ''}`}>{action.status}</Badge>
          {action.outcome && (
            <Badge variant="outline" className={`text-xs capitalize ${OUTCOME_STYLES[action.outcome] || ''}`}>
              {action.outcome.replace(/_/g, ' ')}
            </Badge>
          )}
          <ChevronDown className={`w-4 h-4 text-stone-300 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 space-y-3 border-t border-stone-100 text-sm">
          <div className="bg-stone-50 rounded-lg p-3 text-stone-600 whitespace-pre-wrap">{action.message}</div>
          <p className="text-stone-500"><span className="font-medium text-stone-700">Reasoning: </span>{action.reasoning}</p>
          {action.decision_reason && (
            <p className="text-stone-500"><span className="font-medium text-stone-700">User feedback: </span>“{action.decision_reason}”</p>
          )}
          {action.outcome_details && (
            <p className="text-stone-500"><span className="font-medium text-stone-700">Outcome: </span>{action.outcome_details}</p>
          )}
          <p className="text-xs text-stone-400">{action.created_date && format(new Date(action.created_date), 'MMM d, yyyy · HH:mm')} · {action.channel}</p>
        </div>
      )}
    </div>
  );
}