import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { CARD_STATES, getCardStateKey } from './cardState';

function sendLabel(iso) {
  const d = new Date(iso);
  if (isToday(d)) return `Today ${format(d, 'h:mm a')}`;
  if (isTomorrow(d)) return `Tomorrow ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

export default function LeadCard({ lead, proposal, scheduledAction, leadMessages = [], onOpen }) {
  const stateKey = getCardStateKey(lead, proposal, leadMessages);
  const state = CARD_STATES[stateKey];
  const muted = stateKey === 'closed';

  // Briefly highlight the card when the agent moves it to another stage.
  const prevStatus = useRef(lead.status);
  const [justMoved, setJustMoved] = useState(false);
  useEffect(() => {
    if (prevStatus.current !== lead.status) {
      prevStatus.current = lead.status;
      setJustMoved(true);
      const t = setTimeout(() => setJustMoved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [lead.status]);

  return (
    <div
      onClick={() => onOpen(lead)}
      className={`relative overflow-hidden rounded-xl border bg-white p-3.5 pl-4 cursor-pointer transition-all hover:shadow-sm ${
        justMoved ? 'border-stone-400 ring-2 ring-stone-300' : 'border-stone-200 hover:border-stone-300'
      } ${muted ? 'opacity-70' : ''}`}
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${state.rail}`} />

      <div className="flex items-center gap-1.5 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full ${state.dot}`} />
        <span className={`text-[11px] font-medium uppercase tracking-wide ${state.label_text}`}>{state.label}</span>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium text-stone-900 truncate">{lead.name}</div>
          <div className="text-xs text-stone-500 truncate">{lead.title ? `${lead.title} · ` : ''}{lead.company}</div>
        </div>
        <span className="shrink-0 w-7 h-7 rounded-full bg-stone-800 text-white text-[11px] font-semibold flex items-center justify-center">
          {Math.round(lead.signal_strength ?? 0)}
        </span>
      </div>

      {lead.signal && <p className="text-xs text-stone-500 mt-2 line-clamp-2">{lead.signal}</p>}

      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
        {leadMessages.length > 0 && (
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> {leadMessages.length}
          </span>
        )}
        {scheduledAction?.scheduled_for && (
          <span className="text-[11px] font-medium text-stone-600 bg-stone-100 border border-stone-200 rounded-full px-2 py-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" /> {sendLabel(scheduledAction.scheduled_for)}
          </span>
        )}
      </div>
    </div>
  );
}