// Who the ball is with. One card colour per state — kept to three live states
// plus a muted "closed" so the board reads at a glance.
export const CARD_STATES = {
  needs_you: {
    label: 'Needs you',
    hint: 'The agent drafted an action and is waiting on your decision',
    card: 'bg-amber-50 border-amber-300 hover:border-amber-400',
    dot: 'bg-amber-500',
    text: 'text-amber-800',
    sub: 'text-amber-700/70',
    bar: 'bg-amber-500',
    track: 'bg-amber-200/60',
  },
  awaiting_customer: {
    label: 'Awaiting customer',
    hint: 'We sent the last message — the ball is with them',
    card: 'bg-sky-50 border-sky-300 hover:border-sky-400',
    dot: 'bg-sky-500',
    text: 'text-sky-900',
    sub: 'text-sky-800/70',
    bar: 'bg-sky-600',
    track: 'bg-sky-200/60',
  },
  agent_working: {
    label: "Agent's move",
    hint: 'Nothing is blocking — the agent will work this lead on its next cycle',
    card: 'bg-indigo-50 border-indigo-300 hover:border-indigo-400',
    dot: 'bg-indigo-500',
    text: 'text-indigo-900',
    sub: 'text-indigo-800/70',
    bar: 'bg-indigo-600',
    track: 'bg-indigo-200/60',
  },
  closed: {
    label: 'Closed',
    hint: 'Converted or opted out — no further action',
    card: 'bg-white border-stone-200 hover:border-stone-300',
    dot: 'bg-stone-300',
    text: 'text-stone-500',
    sub: 'text-stone-400',
    bar: 'bg-stone-400',
    track: 'bg-stone-100',
  },
};

export function getCardStateKey(lead, proposal, leadMessages) {
  if (['converted', 'unsubscribed'].includes(lead.status)) return 'closed';
  if (proposal) return 'needs_you';
  const last = leadMessages[leadMessages.length - 1];
  if (last && last.sender !== 'customer') return 'awaiting_customer';
  return 'agent_working';
}