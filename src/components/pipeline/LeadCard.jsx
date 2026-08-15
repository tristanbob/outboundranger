import { Draggable } from '@hello-pangea/dnd';
import { MessageSquare } from 'lucide-react';
import { CARD_STATES, getCardStateKey } from './cardState';

export default function LeadCard({ lead, index, proposal, leadMessages = [], onOpen }) {
  const stateKey = getCardStateKey(lead, proposal, leadMessages);
  const state = CARD_STATES[stateKey];
  const muted = stateKey === 'closed';

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(lead)}
          className={`relative overflow-hidden rounded-xl border border-stone-200 bg-white p-3.5 pl-4 cursor-pointer transition-all hover:border-stone-300 ${
            snapshot.isDragging ? 'shadow-lg rotate-1' : 'hover:shadow-sm'
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
            <span className="text-xs font-semibold text-stone-500 shrink-0">{Math.round(lead.signal_strength ?? 0)}</span>
          </div>

          {lead.signal && <p className="text-xs text-stone-500 mt-2 line-clamp-2">{lead.signal}</p>}

          <div className="mt-2.5 h-1 rounded-full overflow-hidden bg-stone-100">
            <div className="h-full rounded-full bg-stone-700" style={{ width: `${Math.min(100, lead.signal_strength ?? 0)}%` }} />
          </div>

          {leadMessages.length > 0 && (
            <span className="text-[11px] text-stone-400 mt-2.5 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> {leadMessages.length}
            </span>
          )}
        </div>
      )}
    </Draggable>
  );
}