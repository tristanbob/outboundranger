import { base44 } from '@/api/base44Client';

// The GTM agent reads a customer's reply and decides what it actually means
// before it plans the next move.
export async function assessReply({ lead, action, thread }) {
  const threadText = thread
    .map((m) => `${m.sender === 'customer' ? lead.name : 'Us'}: ${m.body}`)
    .join('\n---\n');

  return base44.integrations.Core.InvokeLLM({
    prompt: `You are an autonomous GTM sales agent evaluating a prospect's reply so you can decide your next move.

PROSPECT: ${lead.name}, ${lead.title || 'unknown role'} at ${lead.company} | segment: ${lead.segment} | status: ${lead.status}
YOUR MESSAGE WAS: "${action.message}"

FULL CONVERSATION:
${threadText}

Read their latest reply carefully and assess it honestly — do not flatter yourself about how well it went.
- "reply_read": what they ACTUALLY mean, including anything implied but unsaid (1-2 sentences).
- "reply_objection": the specific objection, hesitation, or blocker they raised. Empty string if none.
- "reply_interest": did this reply move their interest up, down, or leave it unchanged?
- "recommended_next_move": the concrete next move, answering exactly what they asked for. If they asked for something specific (numbers, a case study, a time), say to send THAT. If the right move is to back off or wait, say so.`,
    response_json_schema: {
      type: 'object',
      properties: {
        reply_read: { type: 'string' },
        reply_objection: { type: 'string' },
        reply_interest: { type: 'string', enum: ['increased', 'unchanged', 'decreased'] },
        recommended_next_move: { type: 'string' },
      },
      required: ['reply_read', 'reply_interest', 'recommended_next_move'],
    },
  });
}

export async function proposeNextAction({ leads, memories, config, recentActions, threads = {} }) {
  const memoryText = memories.length
    ? memories.map((m) => `- [${m.category}] ${m.insight}`).join('\n')
    : 'No learnings yet — use sensible GTM best practices.';
  const leadsText = leads
    .map((l) => `id=${l.id} | ${l.name}, ${l.title || 'unknown role'} at ${l.company} | segment: ${l.segment} | status: ${l.status} | signal: ${l.signal || 'none'} (strength ${l.signal_strength ?? 0}/100)`)
    .join('\n');
  const recentText = recentActions.slice(0, 12)
    .map((a) => `${a.action_type} → ${a.lead_name} via ${a.channel} | status: ${a.status}${a.outcome ? ` | outcome: ${a.outcome}` : ''}${a.decision_reason ? ` | user feedback: "${a.decision_reason}"` : ''}${a.reply_read ? ` | how we read their reply: ${a.reply_read}` : ''}${a.recommended_next_move ? ` | recommended next move: ${a.recommended_next_move}` : ''}`)
    .join('\n') || 'None yet.';

  const conversationText = leads
    .map((l) => {
      const msgs = threads[l.id];
      if (!msgs?.length) return null;
      const lines = msgs.slice(-8)
        .map((m) => `  ${m.sender === 'customer' ? l.name : m.sender === 'user' ? 'Seller (human)' : 'Us (agent)'}: ${m.body}`)
        .join('\n');
      return `${l.name} (${l.company}) [id=${l.id}]:\n${lines}`;
    })
    .filter(Boolean)
    .join('\n\n') || 'No conversations yet.';

  return base44.integrations.Core.InvokeLLM({
    prompt: `You are an autonomous GTM (go-to-market) sales agent. Your goal: "${config.goal}".

Pick the single NEXT BEST ACTION from the lead list below, then draft it.

LEARNED PLAYBOOK — you MUST follow these learnings. They come from user feedback and observed outcomes and override generic best practices:
${memoryText}

AVAILABLE LEADS:
${leadsText}

RECENT ACTIONS (do not repeat an action already taken on a lead unless it is a logical follow-up):
${recentText}

LIVE CONVERSATIONS — what these prospects have actually said to us:
${conversationText}

ALLOWED CHANNELS: ${(config.allowed_channels || ['email']).join(', ')}

Rules:
- Choose the lead with the best combination of signal strength and playbook fit. A prospect who is mid-conversation and waiting on us outranks a cold lead.
- If a prospect has an open conversation, your message MUST directly continue it: answer what they asked for, address their objection, and never re-pitch something they already responded to. Match the specifics of their last message.
- Personalize the message to the lead's specific signal. Short, human, no fluff.
- risk_level is "high" if the action is sensitive (discounts, pricing commitments, executive intro requests, anything irreversible), otherwise "low".
- In "evidence", cite the specific lead signal AND any playbook learnings you applied.
- In "expected_effect", state the concrete result you expect and a rough likelihood.
- lead_id must be one of the ids above. confidence is 0-100.`,
    response_json_schema: {
      type: 'object',
      properties: {
        lead_id: { type: 'string' },
        action_type: { type: 'string', enum: ['cold_outreach', 'follow_up', 'share_content', 'intro_request', 'meeting_request'] },
        channel: { type: 'string' },
        subject: { type: 'string' },
        message: { type: 'string' },
        reasoning: { type: 'string' },
        evidence: { type: 'string' },
        expected_effect: { type: 'string' },
        risk_level: { type: 'string', enum: ['low', 'high'] },
        confidence: { type: 'number' },
      },
      required: ['lead_id', 'action_type', 'channel', 'message', 'reasoning', 'evidence', 'expected_effect', 'risk_level', 'confidence'],
    },
  });
}

export async function deriveLearning({ kind, action, detail }) {
  return base44.integrations.Core.InvokeLLM({
    prompt: `You maintain the learned playbook of a GTM sales agent. A feedback event just occurred.

Action: ${action.action_type} to ${action.lead_name} via ${action.channel}
Drafted message: "${action.message}"
Event type: ${kind}
Details: ${detail}

Extract ONE concise, generalizable, actionable playbook rule the agent should follow in future actions (about targeting, messaging, channel, or timing). It must change future behavior — a directive, not a diary note. If the event carries no meaningful lesson (e.g. an unremarkable no-response with no clear cause), set has_insight to false.`,
    response_json_schema: {
      type: 'object',
      properties: {
        has_insight: { type: 'boolean' },
        insight: { type: 'string' },
        category: { type: 'string', enum: ['targeting', 'messaging', 'channel', 'timing', 'strategy'] },
      },
      required: ['has_insight'],
    },
  });
}