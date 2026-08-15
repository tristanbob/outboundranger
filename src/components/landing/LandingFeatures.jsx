import { Radar, PenLine, MessagesSquare, ToggleRight, CalendarClock, Brain } from 'lucide-react';

const FEATURES = [
  { icon: Radar, title: 'Signal-based sourcing', body: 'The agent hunts for accounts that match your ICP and explains the signal behind every one.' },
  { icon: PenLine, title: 'Personalized sends', body: 'Every message is written for that person, that segment, that moment, then sent by the agent itself.' },
  { icon: MessagesSquare, title: 'Runs the whole thread', body: 'It reads each reply, answers objections, and keeps the conversation going until a meeting is on the books.' },
  { icon: CalendarClock, title: 'Deliberate timing', body: 'Each send gets a reasoned schedule, queued and delivered automatically at the right hour.' },
  { icon: ToggleRight, title: 'Autopilot on or off', body: 'Leave Autopilot on and it sends everything itself. Turn it off and nothing goes out until you approve it.' },
  { icon: Brain, title: 'Compounding memory', body: 'Approvals, edits, and outcomes become rules the agent applies to the next play.' },
];

export default function LandingFeatures() {
  return (
    <section className="bg-[#f7f6f3] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-center">
          What the agent does for you
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