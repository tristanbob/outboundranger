import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { STAGES } from '@/components/pipeline/stages';

export default function LeadsList({ leads, query, onQuery, selectedId, onSelect }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden">
      <div className="p-3 border-b border-stone-100 relative">
        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-6 top-1/2 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search name, company, title"
          className="pl-8 h-9"
        />
      </div>
      <div className="max-h-[70vh] overflow-y-auto divide-y divide-stone-100">
        {leads.length === 0 ? (
          <p className="text-sm text-stone-400 p-4">No customers match.</p>
        ) : leads.map((lead) => {
          const stage = STAGES.find((s) => s.id === (lead.status || 'new'));
          return (
            <button
              key={lead.id}
              onClick={() => onSelect(lead.id)}
              className={`w-full text-left px-4 py-3 transition-colors ${selectedId === lead.id ? 'bg-stone-100' : 'hover:bg-stone-50'}`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stage?.accent || 'bg-stone-300'}`} />
                <span className="text-sm font-medium text-stone-900 truncate">{lead.name}</span>
              </div>
              <div className="text-xs text-stone-400 mt-0.5 truncate pl-3.5">
                {lead.title ? `${lead.title} · ` : ''}{lead.company}
              </div>
              <div className="text-xs text-stone-400 mt-0.5 pl-3.5">{stage?.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}