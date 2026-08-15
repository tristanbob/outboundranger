import { Check } from 'lucide-react';

const MODES = [
  {
    label: 'Autopilot ON',
    tag: 'Fully automated',
    points: [
      'Sources leads and sends outreach on its own',
      'Reads replies and answers them without you',
      'Picks the send time for every message',
      'You just watch the pipeline move',
    ],
    dark: true,
  },
  {
    label: 'Autopilot OFF',
    tag: 'You approve everything',
    points: [
      'Nothing is sent until you say so',
      'See the message, reasoning, and timing first',
      'Edit the copy or reject the play',
      'Your feedback becomes a rule it follows',
    ],
    dark: false,
  },
];

export default function LandingAutopilot() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-center">
          One switch decides how much it does alone
        </h2>
        <p className="mt-4 text-center text-stone-500 max-w-2xl mx-auto">
          Autopilot is a toggle in your settings. Turn it on for a hands-off pipeline, turn it off to
          approve every message. Nothing else changes.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {MODES.map((m) => (
            <div
              key={m.label}
              className={`rounded-xl border p-6 ${m.dark ? 'bg-[#101418] border-[#101418] text-white' : 'bg-[#f7f6f3] border-stone-200'}`}
            >
              <div className={`text-xs uppercase tracking-widest ${m.dark ? 'text-emerald-400' : 'text-stone-400'}`}>
                {m.tag}
              </div>
              <div className="font-heading font-semibold text-lg mt-2">{m.label}</div>
              <ul className="mt-4 space-y-2.5">
                {m.points.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm leading-relaxed">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${m.dark ? 'text-emerald-400' : 'text-stone-400'}`} />
                    <span className={m.dark ? 'text-white/70' : 'text-stone-600'}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}