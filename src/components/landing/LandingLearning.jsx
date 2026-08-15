import { Inbox, Lightbulb, GitBranch, Archive } from 'lucide-react';

const STEPS = [
  {
    icon: Inbox,
    title: 'Every outcome is recorded',
    body: 'Each message is logged with who it went to, when it was sent, and what came back — a reply, a meeting, an objection, or silence.',
  },
  {
    icon: Lightbulb,
    title: 'Patterns become playbook rules',
    body: 'When a pattern repeats — a segment that only answers on LinkedIn, an angle that keeps landing meetings — the agent writes it down as a rule with the evidence behind it.',
  },
  {
    icon: GitBranch,
    title: 'Your feedback outranks its own',
    body: 'Approvals, edits and rejection reasons become operator rules the agent can never override. Correct it once and it stays corrected.',
  },
  {
    icon: Archive,
    title: 'Weak lessons get retired',
    body: 'Rules that stop producing results lose weight and are consolidated or dropped, so the playbook stays small, current and honest.',
  },
];

export default function LandingLearning() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">How it learns</p>
        <h2 className="mt-3 font-heading text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
          It gets better at your market every week
        </h2>
        <p className="mt-4 text-stone-600 max-w-2xl">
          The agent keeps a memory of what worked and what didn't, and it drafts every new message against that
          memory — plus everything it knows about the specific person it's writing to.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-stone-200 p-5">
              <Icon className="w-5 h-5 text-stone-500" />
              <h3 className="mt-3 font-heading font-semibold text-stone-900">{title}</h3>
              <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}