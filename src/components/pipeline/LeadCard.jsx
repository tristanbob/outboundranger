import { Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function LeadCard({ lead, index, proposal, messageCount, onOpen }) {
  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(lead)}
          className={`bg-white rounded-xl border p-3.5 cursor-pointer transition-shadow ${
            snapshot.isDragging ? 'shadow-lg border-indigo-300 rotate-1' : 'border-stone-200/80 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-medium text-stone-900 truncate">{lead.name}</div>
              <div className="text-xs text-stone-400 truncate">{lead.title ? `${lead.title} · ` : ''}{lead.company}</div>
            </div>
            <span className="text-xs font-semibold text-stone-400 shrink-0">{Math.round(lead.signal_strength ?? 0)}</span>
          </div>

          {lead.signal && <p className="text-xs text-stone-500 mt-2 line-clamp-2">{lead.signal}</p>}

          <div className="mt-2.5 h-1 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-stone-800 rounded-full" style={{ width: `${Math.min(100, lead.signal_strength ?? 0)}%` }} />
          </div>

          {(proposal || messageCount > 0) && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {proposal && (
                <Badge variant="outline" className="text-[11px] border-indigo-200 bg-indigo-50 text-indigo-700">
                  <Sparkles className="w-3 h-3 mr-1" /> Proposal ready
                </Badge>
              )}
              {messageCount > 0 && (
                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {messageCount}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}