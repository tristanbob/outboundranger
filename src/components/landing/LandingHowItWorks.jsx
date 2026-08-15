const STEPS = [
  { n: '01', title: 'Tell it who you are', body: 'Drop your website and answer a few questions, and it builds your offer, ICP, tone, and guardrails.' },
  { n: '02', title: 'Approve or go autopilot', body: 'Review each proposed play, or let the agent run inside the limits you set.' },
  { n: '03', title: 'It learns and repeats', body: 'Replies are read, objections logged, tactics retired or reinforced. Every cycle gets sharper.' },
];

export default function LandingHowItWorks() {
  return (
    <section className="bg-white py-20 md:py-28 border-y border-stone-200">
      <div className="max-w-5xl mx-auto px-5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-center">How it works</h2>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {STEPS.map(({ n, title, body }) => (
            <div key={n}>
              <div className="font-mono text-xs text-stone-400">{n}</div>
              <div className="font-heading font-semibold mt-3">{title}</div>
              <p className="text-sm text-stone-500 mt-2 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}