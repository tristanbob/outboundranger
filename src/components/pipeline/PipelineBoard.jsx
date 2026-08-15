import { DragDropContext } from '@hello-pangea/dnd';
import PipelineColumn from './PipelineColumn';
import { STAGES } from './stages';

export default function PipelineBoard({ leads, proposals, messages, onMove, onOpen }) {
  const proposalsByLead = {};
  proposals.forEach((p) => { if (p.lead_id) proposalsByLead[p.lead_id] = p; });

  const messageCounts = {};
  messages.forEach((m) => { if (m.lead_id) messageCounts[m.lead_id] = (messageCounts[m.lead_id] || 0) + 1; });

  const handleDragEnd = ({ destination, draggableId }) => {
    if (!destination) return;
    const lead = leads.find((l) => l.id === draggableId);
    if (!lead || lead.status === destination.droppableId) return;
    onMove(lead, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-8 md:px-8">
        {STAGES.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            leads={leads.filter((l) => (l.status || 'new') === stage.id)}
            proposalsByLead={proposalsByLead}
            messageCounts={messageCounts}
            onOpen={onOpen}
          />
        ))}
      </div>
    </DragDropContext>
  );
}