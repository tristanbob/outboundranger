import { base44 } from '@/api/base44Client';

const OUTCOME_TO_LEAD_STATUS = {
  reply: 'replied',
  meeting_booked: 'meeting_booked',
  conversion: 'converted',
  unsubscribe: 'unsubscribed',
};

export async function respondAsCustomer({ lead, history, channel }) {
  const historyText = history
    .map((m) => `${m.sender === 'customer' ? lead.name : m.sender === 'user' ? 'Seller (human)' : 'Seller (AI agent)'}: ${m.subject ? `[${m.subject}] ` : ''}${m.body}`)
    .join('\n---\n');

  return base44.integrations.Core.InvokeLLM({
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

// Logs the outgoing message, lets the simulated customer react, logs their reply,
// and updates the lead's status. Used by both the GTM agent and the Inbox.
export async function deliverAndRespond({ lead, sender, channel, subject, body, actionId }) {
  const leadName = `${lead.name} (${lead.company})`;
  await base44.entities.Message.create({
    lead_id: lead.id,
    lead_name: leadName,
    sender,
    channel: channel || 'email',
    subject: subject || '',
    body,
    related_action_id: actionId || '',
  });
  const history = await base44.entities.Message.filter({ lead_id: lead.id }, 'created_date', 100);
  const resp = await respondAsCustomer({ lead, history, channel: channel || 'email' });
  if (resp.responds && resp.reply) {
    await base44.entities.Message.create({
      lead_id: lead.id,
      lead_name: leadName,
      sender: 'customer',
      channel: channel || 'email',
      body: resp.reply,
    });
  }
  const newStatus = OUTCOME_TO_LEAD_STATUS[resp.outcome];
  if (newStatus) {
    await base44.entities.Lead.update(lead.id, { status: newStatus });
  } else if (resp.outcome === 'no_response' && lead.status === 'new') {
    await base44.entities.Lead.update(lead.id, { status: 'contacted' });
  }
  return resp;
}