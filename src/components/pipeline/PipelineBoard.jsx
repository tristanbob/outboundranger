import PipelineColumn from './PipelineColumn';
import { STAGES } from './stages';

export default function PipelineBoard({ leads, proposals, scheduled = [], messages, onOpen }) {
  const proposalsByLead = {};
  proposals.forEach((p) => { if (p.lead_id) proposalsByLead[p.lead_id] = p; });

  // Soonest queued send per lead, shown as a badge on the card.
  const scheduledByLead = {};
  scheduled.forEach((a) => {
    if (!a.lead_id) return;
    const cur = scheduledByLead[a.lead_id];
    if (!cur || new Date(a.scheduled_for || 0) < new Date(cur.scheduled_for || 0)) scheduledByLead[a.lead_id] = a;
  });

  const messagesByLead = {};
  messages.forEach((m) => {
    if (!m.lead_id) return;
    (messagesByLead[m.lead_id] = messagesByLead[m.lead_id] || []).push(m);
  });

  return (
    <div className="flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-visible snap-x snap-mandatory md:snap-none pb-4 -mx-4 px-4 md:-mx-8 md:px-8 h-[calc(100vh-14rem)]">
      {STAGES.map((stage) => (
        <PipelineColumn
          key={stage.id}
          stage={stage}
          leads={leads.filter((l) => !l.archived && (l.status || 'new') === stage.id)}
          proposalsByLead={proposalsByLead}
          scheduledByLead={scheduledByLead}
          messagesByLead={messagesByLead}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}