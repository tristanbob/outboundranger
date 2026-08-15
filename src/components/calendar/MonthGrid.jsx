import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, format } from 'date-fns';
import EventChip from './EventChip';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthGrid({ month, events }) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  const byDay = {};
  events.forEach((e) => {
    const key = format(new Date(e.date), 'yyyy-MM-dd');
    (byDay[key] = byDay[key] || []).push(e);
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-200">
        {DOW.map((d) => (
          <div key={d} className="px-2 py-2 text-[11px] uppercase tracking-wide text-slate-400 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayEvents = byDay[key] || [];
          return (
            <div
              key={key}
              className={`min-h-[104px] border-r border-b border-slate-100 p-1.5 space-y-1 ${
                isSameMonth(day, month) ? '' : 'bg-slate-50/60'
              }`}
            >
              <div className={`text-xs px-0.5 ${isToday(day) ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                {format(day, 'd')}
              </div>
              {dayEvents.slice(0, 3).map((e) => <EventChip key={e.id} event={e} />)}
              {dayEvents.length > 3 && (
                <div className="text-[11px] text-slate-400 px-1">+{dayEvents.length - 3} more</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}