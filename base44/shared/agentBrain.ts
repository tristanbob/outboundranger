// Every LLM call the GTM agent makes. Runs server-side so a cycle keeps
// working after the user closes the app.

function llm(base44, args) {
  return base44.asServiceRole.integrations.Core.InvokeLLM(args);
}

export async function assessReply(base44, { lead, action, thread }) {
  const threadText = thread
    .map((m) => `${m.sender === 'customer' ? lead.name : 'Us'}: ${m.body}`)
    .join('\n---\n');

  return llm(base44, {
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

// Tier 3: durable facts about ONE customer. Never generalized into the playbook.
export async function updateDossier(base44, { lead, thread, action, assessment }) {
  const threadText = thread
    .slice(-12)
    .map((m) => `${m.sender === 'customer' ? lead.name : 'Us'}: ${m.body}`)
    .join('\n---\n');

  return llm(base44, {
    prompt: `You maintain a private dossier on a single prospect so future outreach remembers everything already learned about THEM. This is facts, not general sales advice.

PROSPECT: ${lead.name}, ${lead.title || 'unknown role'} at ${lead.company} | segment: ${lead.segment}
EXISTING DOSSIER: ${lead.dossier || '(empty)'}
ALREADY-USED ANGLES: ${lead.dossier_do_not_repeat || '(none)'}
LATEST ACTION WE TOOK: ${action.action_type} via ${action.channel} — "${action.message}"
${assessment ? `HOW WE READ THEIR REPLY: ${assessment.reply_read}${assessment.reply_objection ? ` | Objection: ${assessment.reply_objection}` : ''} | Interest ${assessment.reply_interest}` : 'They did not reply.'}

RECENT CONVERSATION:
${threadText || '(no messages)'}

Rewrite the dossier as a compact, updated set of facts about this specific person — their stated objection, timeline, who else is involved, what they care about, and where the deal actually stands. Merge the existing dossier with anything new; drop nothing important; no filler. Max 6 short bullet-style sentences.
Also list the angles/asks already used on them, so we never repeat them.`,
    response_json_schema: {
      type: 'object',
      properties: {
        dossier: { type: 'string' },
        do_not_repeat: { type: 'string' },
      },
      required: ['dossier'],
    },
  });
}

function formatRules(rules) {
  return rules.length
    ? rules.map((m) => `- [id=${m.id}] (${m.category}${m.scope ? `, applies to: ${m.scope}` : ''}) ${m.insight}`).join('\n')
    : 'None yet.';
}

function formatPlaybook(rules) {
  return rules.length
    ? rules
        .map((m) => {
          const applied = m.applied_count || 0;
          const pos = m.positive_count || 0;
          const track = applied ? `track record: ${pos}/${applied} positive` : 'untested';
          return `- [id=${m.id}] (${m.category}${m.scope ? `, applies to: ${m.scope}` : ''}, ${track}) ${m.insight}`;
        })
        .join('\n')
    : 'No learned tactics yet — use sensible GTM best practices.';
}

export async function proposeNextAction(base44, { leads, memories, config, recentActions, threads = {} }) {
  const operatorRules = memories.filter((m) => m.tier === 'operator_rule');
  const playbook = memories.filter((m) => m.tier !== 'operator_rule');

  const leadsText = leads
    .map((l) => {
      const dossier = l.dossier ? `\n    what we know about them: ${l.dossier}` : '';
      const avoid = l.dossier_do_not_repeat ? `\n    do NOT repeat: ${l.dossier_do_not_repeat}` : '';
      return `id=${l.id} | ${l.name}, ${l.title || 'unknown role'} at ${l.company} | segment: ${l.segment} | status: ${l.status} | signal: ${l.signal || 'none'} (strength ${l.signal_strength ?? 0}/100)${dossier}${avoid}`;
    })
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

  return llm(base44, {
    prompt: `You are an autonomous GTM (go-to-market) sales agent. Your goal: "${config.goal}".

Pick the single NEXT BEST ACTION from the lead list below, then draft it.

=== TIER 1 — THE OPERATOR'S RULES (NON-NEGOTIABLE) ===
These come directly from your human operator. They are hard constraints and override everything else, including your own judgment and any learned tactic. Violating one makes the action invalid:
${formatRules(operatorRules)}

=== TIER 2 — LEARNED PLAYBOOK (EVIDENCE-WEIGHTED) ===
Tactics you learned from real outcomes. Weight each by its track record: strong records should be followed, weak or untested ones are only weak hints and may be ignored if the situation argues otherwise:
${formatPlaybook(playbook)}

=== TIER 3 — WHAT YOU KNOW ABOUT EACH CUSTOMER ===
Per-customer facts appear inline in the lead list below. Treat them as true and specific to that person — never generalize them to other leads.

AVAILABLE LEADS:
${leadsText}

RECENT ACTIONS (do not repeat an action already taken on a lead unless it is a logical follow-up):
${recentText}

LIVE CONVERSATIONS — what these prospects have actually said to us:
${conversationText}

ALLOWED CHANNELS: ${(config.allowed_channels || ['email']).join(', ')}

Rules:
- Choose the lead with the best combination of signal strength and playbook fit. A prospect who is mid-conversation and waiting on us outranks a cold lead.
- If a prospect has an open conversation, your message MUST directly continue it: answer what they asked for, address their objection, and never re-pitch something they already responded to. Honour their dossier and the "do NOT repeat" list.
- Personalize the message to the lead's specific signal. Short, human, no fluff.
- risk_level is "high" if the action is sensitive (discounts, pricing commitments, executive intro requests, anything irreversible), otherwise "low".
- In "evidence", cite the specific lead signal AND any rules/learnings you applied.
- In "applied_memory_ids", list the exact ids of the Tier 1 and Tier 2 entries you actually applied — this is how they get credited or retired. Empty array if none applied.
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
        applied_memory_ids: { type: 'array', items: { type: 'string' } },
        expected_effect: { type: 'string' },
        risk_level: { type: 'string', enum: ['low', 'high'] },
        confidence: { type: 'number' },
      },
      required: ['lead_id', 'action_type', 'channel', 'message', 'reasoning', 'evidence', 'expected_effect', 'risk_level', 'confidence'],
    },
  });
}

// tier: 'operator_rule' (user told us) or 'playbook' (we observed it)
export async function deriveLearning(base44, { kind, action, detail, tier }) {
  const tierBrief = tier === 'operator_rule'
    ? `This is an OPERATOR RULE: it captures what your human wants, in their voice — style, length, tone, claims they will not make, channels or asks they refuse. Write it as a standing constraint you must always obey. Do not water it down into generic advice, and do not invent conditions they did not state.`
    : `This is a PLAYBOOK TACTIC learned from an observed outcome. Write it as a testable directive scoped to the kind of prospect it should apply to, so its track record can be measured over time.`;

  return llm(base44, {
    prompt: `You maintain the layered memory of a GTM sales agent. A feedback event just occurred.

Action: ${action.action_type} to ${action.lead_name} via ${action.channel}
Drafted message: "${action.message}"
${action.expected_effect ? `What the agent predicted would happen: "${action.expected_effect}"` : ''}
Event type: ${kind}
Details: ${detail}

${tierBrief}

Return:
- "has_insight": false if the event carries no meaningful lesson (e.g. an unremarkable no-response with no clear cause). Otherwise true.
- "insight": ONE concise, actionable rule that will change future behaviour — a directive, not a diary note.
- "category": which aspect of the motion it governs.
- "scope": who it applies to, e.g. "enterprise ops leaders", "all leads". Be as narrow as the evidence justifies.
${action.expected_effect ? `- "prediction_hit": judge honestly whether the real outcome matched the agent's prediction — "yes", "partial", or "no".` : ''}`,
    response_json_schema: {
      type: 'object',
      properties: {
        has_insight: { type: 'boolean' },
        insight: { type: 'string' },
        category: { type: 'string', enum: ['targeting', 'messaging', 'channel', 'timing', 'strategy'] },
        scope: { type: 'string' },
        prediction_hit: { type: 'string', enum: ['yes', 'partial', 'no'] },
      },
      required: ['has_insight'],
    },
  });
}

// The simulated buyer on the other side of the conversation.
export async function respondAsCustomer(base44, { lead, history, channel }) {
  const historyText = history
    .map((m) => `${m.sender === 'customer' ? lead.name : m.sender === 'user' ? 'Seller (human)' : 'Seller (AI agent)'}: ${m.subject ? `[${m.subject}] ` : ''}${m.body}`)
    .join('\n---\n');

  return llm(base44, {
    prompt: `You are role-playing as a REAL B2B buyer. Stay fully in character — you are the customer, not a salesperson.

WHO YOU ARE: ${lead.name}, ${lead.title || 'decision maker'} at ${lead.company} (${lead.segment} company).${lead.persona ? ` Personality: ${lead.persona}` : ''}
Your context: ${lead.signal || 'no particular buying signal'} (interest level ${lead.signal_strength ?? 50}/100). Your current relationship with this vendor: ${lead.status}.

CONVERSATION SO FAR (the most recent message is addressed to you — react to it):
${historyText}

Decide realistically how ${lead.name} responds:
- Busy professionals ignore generic, long, or pushy messages (responds=false, outcome=no_response).
- Sharp, relevant, low-friction messages earn short businesslike replies (outcome=reply).
- Only agree to a meeting (meeting_booked) or commit to buying (conversion) if the conversation has genuinely earned it given your interest level and history.
- If the outreach feels spammy or ignores your earlier answers, you may get annoyed — or unsubscribe.
- Stay consistent with everything you said earlier in the thread.
- Replies are human and short (1-4 sentences), in ${lead.name}'s voice, appropriate for ${channel}.

In "details", describe in one third-person sentence what happened (e.g. "Maya ignored the message — too generic for her.").`,
    response_json_schema: {
      type: 'object',
      properties: {
        responds: { type: 'boolean' },
        reply: { type: 'string' },
        outcome: { type: 'string', enum: ['reply', 'meeting_booked', 'conversion', 'no_response', 'unsubscribe'] },
        details: { type: 'string' },
      },
      required: ['responds', 'outcome', 'details'],
    },
  });
}