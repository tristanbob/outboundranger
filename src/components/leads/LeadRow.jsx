import { Badge } from '@/components/ui/badge';

const STATUS_STYLES = {
  new: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  replied: 'bg-sky-50 text-sky-700 border-sky-200',
  meeting_booked: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  converted: 'bg-emerald-600 text-white border-emerald-600',
  unsubscribed: 'bg-red-50 text-red-600 border-red-200',
};

export default function LeadRow({ lead }) {
  const initials = lead.name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <div className="bg-white rounded-xl border border-stone-200/80 px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-[#101418] text-white flex items-center justify-center text-xs font-semibold shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-stone-900">{lead.name}</div>
        <div className="text-xs text-stone-400 truncate">{lead.title} · {lead.company}</div>
        {lead.signal && <div className="text-xs text-stone-500 mt-1 truncate">⚡ {lead.signal}</div>}
      </div>
      <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${lead.signal_strength || 0}%` }} />
          </div>
          <span className="text-xs text-stone-400 w-7 text-right">{lead.signal_strength || 0}</span>
        </div>
        <Badge variant="outline" className={`text-xs capitalize ${STATUS_STYLES[lead.status] || ''}`}>
          {(lead.status || 'new').replace(/_/g, ' ')}
        </Badge>
      </div>
    </div>
  );
}