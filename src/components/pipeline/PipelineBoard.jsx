import PipelineColumn from './PipelineColumn';
import { STAGES } from './stages';

export default function PipelineBoard({ leads, proposals, messages, onOpen }) {
  const proposalsByLead = {};
  proposals.forEach((p) => { if (p.lead_id) proposalsByLead[p.lead_id] = p; });

  const messagesByLead = {};
  messages.forEach((m) => {
    if (!m.lead_id) return;
    (messagesByLead[m.lead_id] = messagesByLead[m.lead_id] || []).push(m);
  });

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-visible snap-x snap-mandatory md:snap-none pb-4 -mx-4 px-4 md:-mx-8 md:px-8">
      {STAGES.map((stage) => (
        <PipelineColumn
          key={stage.id}
          stage={stage}
          leads={leads.filter((l) => (l.status || 'new') === stage.id)}
          proposalsByLead={proposalsByLead}
          messagesByLead={messagesByLead}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}