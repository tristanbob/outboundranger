import { Draggable } from '@hello-pangea/dnd';
import { MessageSquare } from 'lucide-react';
import { CARD_STATES, getCardStateKey } from './cardState';

export default function LeadCard({ lead, index, proposal, leadMessages = [], onOpen }) {
  const state = CARD_STATES[getCardStateKey(lead, proposal, leadMessages)];

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(lead)}
          className={`rounded-xl border p-3.5 cursor-pointer transition-all ${state.card} ${
            snapshot.isDragging ? 'shadow-lg rotate-1' : 'hover:shadow-sm'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`w-2 h-2 rounded-full ${state.dot}`} />
            <span className={`text-[11px] font-semibold uppercase tracking-wide ${state.sub}`}>{state.label}</span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className={`text-sm font-medium truncate ${state.text}`}>{lead.name}</div>
              <div className={`text-xs truncate ${state.sub}`}>{lead.title ? `${lead.title} · ` : ''}{lead.company}</div>
            </div>
            <span className={`text-xs font-semibold shrink-0 ${state.sub}`}>{Math.round(lead.signal_strength ?? 0)}</span>
          </div>

          {lead.signal && <p className={`text-xs mt-2 line-clamp-2 ${state.sub}`}>{lead.signal}</p>}

          <div className={`mt-2.5 h-1 rounded-full overflow-hidden ${state.track}`}>
            <div className={`h-full rounded-full ${state.bar}`} style={{ width: `${Math.min(100, lead.signal_strength ?? 0)}%` }} />
          </div>

          {leadMessages.length > 0 && (
            <span className={`text-[11px] mt-2.5 flex items-center gap-1 ${state.sub}`}>
              <MessageSquare className="w-3 h-3" /> {leadMessages.length}
            </span>
          )}
        </div>
      )}
    </Draggable>
  );
}