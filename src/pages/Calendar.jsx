import { useState } from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Send, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrg } from '@/components/org/OrgContext';
import { useCalendarEvents } from '@/components/calendar/useCalendarEvents';
import MonthGrid from '@/components/calendar/MonthGrid';

const FILTERS = [
  { key: 'all', label: 'Everything' },
  { key: 'scheduled', label: 'Scheduled sends' },
  { key: 'meeting', label: 'Meetings' },
];

export default function Calendar() {
  const { currentOrg } = useOrg();
  const { events, loading } = useCalendarEvents(currentOrg.id);
  const [month, setMonth] = useState(new Date());
  const [filter, setFilter] = useState('all');

  const visible = filter === 'all' ? events : events.filter((e) => e.kind === filter);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Calendar</h1>
        <p className="text-sm text-slate-500 mt-1">When the agent's queued messages go out, and when meetings land.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setMonth(subMonths(month, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="font-heading font-semibold text-slate-900 w-40 text-center">{format(month, 'MMMM yyyy')}</div>
          <Button variant="outline" size="icon" onClick={() => setMonth(addMonths(month, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMonth(new Date())}>Today</Button>
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                filter === f.key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <MonthGrid month={month} events={visible} />
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Scheduled send</span>
            <span className="flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5 text-emerald-600" /> Meeting booked</span>
          </div>
        </>
      )}
    </div>
  );
}