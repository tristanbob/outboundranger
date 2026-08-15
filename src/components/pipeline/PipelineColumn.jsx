import LeadCard from './LeadCard';

export default function PipelineColumn({ stage, leads, proposalsByLead, messagesByLead, onOpen }) {
  return (
    <div className="w-[82vw] max-w-[18rem] sm:w-72 shrink-0 snap-start flex flex-col">
      <div className="flex items-center gap-2 px-1 pb-2">
        <span className={`w-2 h-2 rounded-full ${stage.accent}`} />
        <span className="text-sm font-medium text-stone-700">{stage.label}</span>
        <span className="text-xs text-stone-400">{leads.length}</span>
      </div>
      <p className="text-[11px] text-stone-400 px-1 pb-2">{stage.hint}</p>
      <div className="flex-1 rounded-xl p-2 space-y-2 min-h-[8rem] bg-stone-200/30">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            proposal={proposalsByLead[lead.id]}
            leadMessages={messagesByLead[lead.id] || []}
            onOpen={onOpen}
          />
        ))}
        {leads.length === 0 && <p className="text-xs text-stone-400 text-center py-6">Empty</p>}
      </div>
    </div>
  );
}