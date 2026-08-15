import { Radar, PenLine, CalendarClock, Brain, KanbanSquare, BarChart3 } from 'lucide-react';

const FEATURES = [
  { icon: Radar, title: 'Signal-based sourcing', body: 'The agent hunts for accounts that match your ICP and explains the signal behind every one.' },
  { icon: PenLine, title: 'Drafted outreach', body: 'Every message is written for the person, the segment, and the moment. Never a template blast.' },
  { icon: CalendarClock, title: 'Deliberate timing', body: 'Each send gets a reasoned schedule, queued and delivered automatically at the right hour.' },
  { icon: Brain, title: 'Compounding memory', body: 'Approvals, edits, and outcomes become rules the agent applies to the next play.' },
  { icon: KanbanSquare, title: 'Live pipeline board', body: 'Watch leads move from new to booked, with the agent doing every stage transition.' },
  { icon: BarChart3, title: 'Honest reporting', body: 'Funnel, channel performance, and which learnings actually earned their keep.' },
];

export default function LandingFeatures() {
  return (
    <section className="bg-[#f7f6f3] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-center">
          An operator, not a sequencer
        </h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white rounded-xl border border-stone-200 p-6">
              <Icon className="w-5 h-5 text-stone-500" />
              <div className="font-heading font-semibold mt-4">{title}</div>
              <p className="text-sm text-stone-500 mt-2 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}