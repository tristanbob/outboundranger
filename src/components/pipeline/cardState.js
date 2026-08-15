// Who the ball is with. Cards stay neutral white — the state is carried by a
// thin left rail, a dot and a label, so only one accent (amber = needs you)
// competes for attention.
export const CARD_STATES = {
  needs_you: {
    label: 'Needs you',
    hint: 'The agent drafted an action and is waiting on your decision',
    rail: 'bg-amber-500',
    dot: 'bg-amber-500',
    label_text: 'text-amber-700',
  },
  awaiting_customer: {
    label: 'Awaiting customer',
    hint: 'We sent the last message — the ball is with them',
    rail: 'bg-stone-300',
    dot: 'bg-stone-300',
    label_text: 'text-stone-400',
  },
  agent_working: {
    label: 'Action scheduled',
    hint: 'Nothing is blocking — the agent will work this lead on its next cycle',
    rail: 'bg-stone-800',
    dot: 'bg-stone-800',
    label_text: 'text-stone-500',
  },
  closed: {
    label: 'Closed',
    hint: 'Converted or opted out — no further action',
    rail: 'bg-stone-200',
    dot: 'bg-stone-200',
    label_text: 'text-stone-400',
  },
};

export function getCardStateKey(lead, proposal, leadMessages) {
  if (['converted', 'unsubscribed'].includes(lead.status)) return 'closed';
  if (proposal) return 'needs_you';
  const last = leadMessages[leadMessages.length - 1];
  if (last && last.sender !== 'customer') return 'awaiting_customer';
  return 'agent_working';
}