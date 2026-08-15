import { Send, CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function EventChip({ event }) {
  const Icon = event.kind === 'meeting' ? CalendarCheck : Send;
  return (
    <div
      className={`flex items-start gap-1.5 rounded-md px-1.5 py-1 text-[11px] leading-tight ${
        event.kind === 'meeting' ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-100 text-slate-700'
      }`}
      title={`${format(new Date(event.date), 'p')} · ${event.title} — ${event.detail}${event.note ? `\n${event.note}` : ''}`}
    >
      <Icon className="w-3 h-3 mt-0.5 shrink-0" />
      <span className="truncate">
        <span className="font-medium">{format(new Date(event.date), 'h:mma').toLowerCase()}</span> {event.title}
      </span>
    </div>
  );
}