import { base44 } from '@/api/base44Client';

export async function proposeNextAction({ leads, memories, config, recentActions }) {
  const memoryText = memories.length
    ? memories.map((m) => `- [${m.category}] ${m.insight}`).join('\n')
    : 'No learnings yet — use sensible GTM best practices.';
  const leadsText = leads
    .map((l) => `id=${l.id} | ${l.name}, ${l.title || 'unknown role'} at ${l.company} | segment: ${l.segment} | status: ${l.status} | signal: ${l.signal || 'none'} (strength ${l.signal_strength ?? 0}/100)`)
    .join('\n');
  const recentText = recentActions.slice(0, 12)
    .map((a) => `${a.action_type} → ${a.lead_name} via ${a.channel} | status: ${a.status}${a.outcome ? ` | outcome: ${a.outcome}` : ''}${a.decision_reason ? ` | user feedback: "${a.decision_reason}"` : ''}`)
    .join('\n') || 'None yet.';

  return base44.integrations.Core.InvokeLLM({
    prompt: `You are an autonomous GTM (go-to-market) sales agent. Your goal: "${config.goal}".

Pick the single NEXT BEST ACTION from the lead list below, then draft it.

LEARNED PLAYBOOK — you MUST follow these learnings. They come from user feedback and observed outcomes and override generic best practices:
${memoryText}

AVAILABLE LEADS:
${leadsText}

RECENT ACTIONS (do not repeat an action already taken on a lead unless it is a logical follow-up):
${recentText}

ALLOWED CHANNELS: ${(config.allowed_channels || ['email']).join(', ')}

Rules:
- Choose the lead with the best combination of signal strength and playbook fit.
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