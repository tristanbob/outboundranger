export default function ThreadList({ leads, messages, selectedId, onSelect }) {
  const lastByLead = {};
  messages.forEach((m) => { lastByLead[m.lead_id] = m; });
  const sorted = [...leads].sort((a, b) => {
    const la = lastByLead[a.id]?.created_date || '';
    const lb = lastByLead[b.id]?.created_date || '';
    return lb.localeCompare(la);
  });

  return (
    <div className="space-y-1.5">
      {sorted.map((lead) => {
        const last = lastByLead[lead.id];
        const active = lead.id === selectedId;
        return (
          <button
            key={lead.id}
            onClick={() => onSelect(lead.id)}
            className={`w-full text-left rounded-xl px-4 py-3 transition-colors border ${
              active ? 'bg-white border-indigo-300 shadow-sm' : 'bg-white/60 border-transparent hover:bg-white hover:border-stone-200'
            }`}
          >
            <div className="text-sm font-medium text-stone-900 truncate">{lead.name}</div>
            <div className="text-xs text-stone-400 truncate">{lead.company}</div>
            <div className="text-xs text-stone-500 truncate mt-1">
              {last ? `${last.sender === 'customer' ? '' : '→ '}${last.body}` : 'No messages yet'}
            </div>
          </button>
        );
      })}
    </div>
  );
}