// The profile the agent needs before it can prospect or write outreach.
// Anything the extraction can't find becomes a question we ask the user.
// Fields with `options` are asked as selectable chips (multi where it makes
// sense) with a free-form answer always available as the last option.
export const PROFILE_FIELDS = [
  { key: 'company_name', label: 'Company name', question: 'What is your company called?', multiline: false },
  { key: 'what_we_sell', label: 'What you sell', question: 'In one or two sentences, what do you actually sell?' },
  { key: 'value_prop', label: 'Value proposition', question: 'What problem do you solve, and what changes for the customer once you solve it?' },
  {
    key: 'icp_titles',
    label: 'Who you sell to',
    question: 'Which job titles or roles are your buyers?',
    multi: true,
    options: ['Founder / CEO', 'VP Sales', 'VP Marketing', 'Head of Operations', 'CTO / Engineering lead', 'Product manager', 'Individual practitioners'],
  },
  {
    key: 'icp_segments',
    label: 'Company sizes you target',
    question: 'Which company sizes fit best?',
    multi: true,
    options: ['Startup', 'SMB', 'Mid-market', 'Enterprise', 'Individual consumers'],
  },
  {
    key: 'icp_industries',
    label: 'Industries',
    question: 'Which industries or verticals are you focused on?',
    multi: true,
    options: ['SaaS / Software', 'E-commerce / Retail', 'Fintech', 'Healthcare', 'Gaming', 'Agencies', 'Manufacturing', 'Education'],
  },
  { key: 'differentiators', label: 'Why you win', question: 'Why do buyers pick you over the alternatives?' },
  { key: 'proof_points', label: 'Proof points', question: 'Any customers, numbers or results the agent can cite in outreach?' },
  {
    key: 'goal',
    label: 'Goal for the agent',
    question: 'What should the agent be optimising for?',
    options: ['Booked meetings', 'Demo signups', 'Free trial signups', 'Replies and conversations', 'Closed revenue'],
  },
  {
    key: 'tone',
    label: 'Tone of voice',
    question: 'How should outreach sound?',
    multi: true,
    options: ['Direct and concise', 'Warm and friendly', 'Technical and precise', 'Playful', 'Formal and professional'],
  },
  {
    key: 'avoid',
    label: 'Never do this',
    question: 'Anything the agent must never say or do in your name?',
    multi: true,
    options: ['Never name competitors', 'No pricing promises', 'No hype or buzzwords', 'Never follow up more than weekly', 'No false urgency'],
  },
];