// The profile the agent needs before it can prospect or write outreach.
// Anything the extraction can't find becomes a question we ask the user.
export const PROFILE_FIELDS = [
  { key: 'company_name', label: 'Company name', question: 'What is your company called?', multiline: false },
  { key: 'what_we_sell', label: 'What you sell', question: 'In one or two sentences, what do you actually sell?' },
  { key: 'value_prop', label: 'Value proposition', question: 'What problem do you solve, and what changes for the customer once you solve it?' },
  { key: 'icp_titles', label: 'Who you sell to', question: 'Which job titles or roles are your buyers?' },
  { key: 'icp_segments', label: 'Company sizes you target', question: 'Which company sizes fit best — startup, SMB, mid-market, enterprise?' },
  { key: 'icp_industries', label: 'Industries', question: 'Which industries or verticals are you focused on?' },
  { key: 'differentiators', label: 'Why you win', question: 'Why do buyers pick you over the alternatives?' },
  { key: 'proof_points', label: 'Proof points', question: 'Any customers, numbers or results the agent can cite in outreach?' },
  { key: 'goal', label: 'Goal for the agent', question: 'What should the agent be optimising for — booked meetings, demo signups, replies?' },
  { key: 'tone', label: 'Tone of voice', question: 'How should outreach sound — direct, warm, technical, playful?' },
  { key: 'avoid', label: 'Never do this', question: 'Anything the agent must never say or do in your name?' },
];