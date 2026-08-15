import {
  assessReply,
  deriveLearning,
  proposeNextAction,
  respondAsCustomer,
  updateDossier,
} from './agentBrain.ts';
import { autopilotOrgIds } from './leadProspecting.ts';

const ACTIVE_STATUSES = ['new', 'contacted', 'replied'];
const POSITIVE_OUTCOMES = ['reply', 'meeting_booked', 'conversion'];
const OUTCOME_TO_LEAD_STATUS = {
  reply: 'replied',
  meeting_booked: 'meeting_booked',
  conversion: 'converted',
  unsubscribe: 'unsubscribed',
};
export const MAX_AUTOPILOT_STEPS = 10;

// The agent decides how long to wait before sending. 0 (or missing) = send now.
export function scheduledFor(delayHours) {
  const h = Math.max(0, Math.min(336, Number(delayHours) || 0));
  if (h < 1) return '';
  return new Date(Date.now() + h * 3600 * 1000).toISOString();
}

async function saveLearning(base44, orgId, learning, source, detail, tier) {
  if (!learning?.has_insight || !learning.insight) return;
  await base44.entities.MemoryEntry.create({
    org_id: orgId,
    insight: learning.insight,
    tier,
    scope: learning.scope || 'all leads',
    category: learning.category || 'strategy',
    source,
    source_detail: detail,
    applied_count: 0,
    positive_count: 0,
    active: true,
  });
}

// Rules only accumulate credit if they were actually applied. A playbook tactic
// that keeps failing gets retired — operator rules are never retired.
async function scoreAppliedMemories(base44, ids = [], outcome) {
  if (!ids.length) return;
  const positive = POSITIVE_OUTCOMES.includes(outcome);
  await Promise.all(ids.map(async (id) => {
    const entry = await base44.entities.MemoryEntry.get(id).catch(() => null);
    if (!entry) return;
    const applied_count = (entry.applied_count || 0) + 1;
    const positive_count = (entry.positive_count || 0) + (positive ? 1 : 0);
    const patch = {
      applied_count,
      positive_count,
      ...(positive ? { last_confirmed: new Date().toISOString() } : {}),
    };
    const failing = entry.tier !== 'operator_rule' && applied_count >= 3 && positive_count / applied_count < 0.34;
    if (failing && entry.active) {
      patch.active = false;
      patch.retire_reason = `Retired automatically — only ${positive_count} of ${applied_count} actions using this rule went anywhere.`;
    }
    await base44.entities.MemoryEntry.update(id, patch);
  }));
}

// Phase 1: logs the outgoing message only — the customer hasn't reacted yet.
export async function deliverMessage(base44, orgId, { lead, sender, channel, subject, body, actionId }) {
  await base44.entities.Message.create({
    org_id: orgId,
    lead_id: lead.id,
    lead_name: `${lead.name} (${lead.company})`,
    sender,
    channel: channel || 'email',
    subject: subject || '',
    body,
    related_action_id: actionId || '',
  });
  if (lead.status === 'new') {
    await base44.entities.Lead.update(lead.id, { status: 'contacted' });
  }
}

// Phase 2 of the simulation: the customer reacts and their status moves.
export async function generateCustomerResponse(base44, orgId, { lead, channel }) {
  const history = await base44.entities.Message.filter({ lead_id: lead.id }, 'created_date', 100);
  const resp = await respondAsCustomer(base44, { lead, history, channel: channel || 'email' });
  if (resp.responds && resp.reply) {
    await base44.entities.Message.create({
      org_id: orgId,
      lead_id: lead.id,
      lead_name: `${lead.name} (${lead.company})`,
      sender: 'customer',
      channel: channel || 'email',
      body: resp.reply,
    });
  }
  const newStatus = OUTCOME_TO_LEAD_STATUS[resp.outcome];
  if (newStatus) {
    await base44.entities.Lead.update(lead.id, { status: newStatus });
  }
  return resp;
}

// Phase 1 of an action: send the message only. Returns the lead, or null.
export async function deliverAction(base44, orgId, actionId, action) {
  const lead = action.lead_id ? await base44.entities.Lead.get(action.lead_id).catch(() => null) : null;
  if (!lead) {
    await base44.entities.AgentAction.update(actionId, {
      status: 'completed',
      outcome: 'no_response',
      outcome_details: 'Lead not found — message could not be delivered.',
      executed_at: new Date().toISOString(),
    });
    return null;
  }
  await deliverMessage(base44, orgId, {
    lead,
    sender: 'gtm_agent',
    channel: action.channel,
    subject: action.subject,
    body: action.message,
    actionId,
  });
  await base44.entities.AgentAction.update(actionId, {
    status: 'executed',
    executed_at: new Date().toISOString(),
  });
  return lead;
}

// Phase 2: the customer reacts, and the agent runs its full learning pass.
export async function resolveAction(base44, orgId, actionId, action, lead) {
  const resp = await generateCustomerResponse(base44, orgId, { lead, channel: action.channel });
  const sim = {
    outcome: resp.outcome,
    outcome_details: resp.responds && resp.reply ? `${lead.name} replied: "${resp.reply}"` : resp.details,
  };
  const thread = await base44.entities.Message.filter({ lead_id: lead.id }, 'created_date', 100);
  let assessment = null;
  if (resp.responds && resp.reply) {
    assessment = await assessReply(base44, { lead, action, thread });
  }
  await base44.entities.AgentAction.update(actionId, {
    status: 'completed',
    outcome: sim.outcome,
    outcome_details: sim.outcome_details,
    reply_read: assessment?.reply_read || '',
    reply_objection: assessment?.reply_objection || '',
    ...(assessment?.reply_interest ? { reply_interest: assessment.reply_interest } : {}),
    recommended_next_move: assessment?.recommended_next_move || '',
  });
  // Tier 2: credit or retire the rules this action actually leaned on.
  await scoreAppliedMemories(base44, action.applied_memory_ids || [], sim.outcome);

  // Tier 3: a durable dossier on this specific customer — facts, not general rules.
  const d = await updateDossier(base44, { lead, thread, action, assessment });
  if (d?.dossier) {
    await base44.entities.Lead.update(lead.id, {
      dossier: d.dossier,
      dossier_do_not_repeat: d.do_not_repeat || lead.dossier_do_not_repeat || '',
      dossier_updated: new Date().toISOString(),
    });
  }

  const learning = await deriveLearning(base44, {
    kind: 'observed outcome',
    action,
    detail: `The send resulted in "${sim.outcome}": ${sim.outcome_details}${assessment ? ` The agent read the reply as: ${assessment.reply_read}${assessment.reply_objection ? ` Objection raised: ${assessment.reply_objection}.` : ''} Interest ${assessment.reply_interest}.` : ''}`,
    tier: 'playbook',
  });
  await saveLearning(base44, orgId, learning, 'outcome', `${action.action_type} → ${action.lead_name}: ${sim.outcome}`, 'playbook');
  if (learning?.prediction_hit) {
    await base44.entities.AgentAction.update(actionId, { prediction_hit: learning.prediction_hit });
  }
  return sim;
}

export async function executeAction(base44, orgId, actionId, action) {
  const lead = await deliverAction(base44, orgId, actionId, action);
  if (!lead) return { outcome: 'no_response', outcome_details: 'Lead not found — message could not be delivered.' };
  return resolveAction(base44, orgId, actionId, action, lead);
}

// One agent step: think, then either execute (autopilot) or propose.
export async function runAgentStep(base44, orgId) {
  const [cfgs, leads, actions, memories, allMessages] = await Promise.all([
    base44.entities.AgentConfig.filter({ org_id: orgId }),
    base44.entities.Lead.filter({ org_id: orgId }, '-signal_strength', 200),
    base44.entities.AgentAction.filter({ org_id: orgId }, '-created_date', 200),
    base44.entities.MemoryEntry.filter({ org_id: orgId }, '-created_date', 200),
    base44.entities.Message.filter({ org_id: orgId }, 'created_date', 500),
  ]);
  const threads = {};
  allMessages.forEach((m) => {
    if (!m.lead_id) return;
    (threads[m.lead_id] = threads[m.lead_id] || []).push(m);
  });
  const config = cfgs[0];
  if (!config) return { ok: false, continueLoop: false, message: 'Configure the agent in Settings first.' };
  if (config.paused) return { ok: false, continueLoop: false, message: 'Agent is paused. Resume it to run a cycle.' };
  if (actions.some((a) => a.status === 'proposed')) {
    return { ok: false, continueLoop: false, message: 'A proposal is already awaiting your review.' };
  }
  if (actions.some((a) => a.status === 'executed')) {
    return { ok: false, continueLoop: false, message: 'A sent message is waiting on a customer response — generate it first.' };
  }
  const activeLeads = leads.filter((l) => ACTIVE_STATUSES.includes(l.status));
  if (!activeLeads.length) return { ok: false, continueLoop: false, message: 'No active leads to work. Add leads first.' };
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = actions.filter(
    (a) => (a.created_date || '').slice(0, 10) === today && a.status !== 'rejected'
  ).length;
  if (todayCount >= (config.daily_action_limit || 10)) {
    return { ok: false, continueLoop: false, message: 'Daily action limit reached — guardrail stopped the agent for today.' };
  }

  const p = await proposeNextAction(base44, {
    leads: activeLeads,
    memories: memories.filter((m) => m.active),
    config,
    recentActions: actions,
    threads,
  });
  const lead = activeLeads.find((l) => l.id === p.lead_id) || activeLeads[0];
  const draft = {
    org_id: orgId,
    lead_id: lead.id,
    lead_name: `${lead.name} (${lead.company})`,
    action_type: p.action_type,
    channel: p.channel,
    subject: p.subject || '',
    message: p.message,
    reasoning: p.reasoning,
    evidence: p.evidence,
    expected_effect: p.expected_effect,
    risk_level: p.risk_level,
    confidence: Math.round(p.confidence),
    applied_memory_ids: p.applied_memory_ids || [],
    scheduled_for: scheduledFor(p.send_delay_hours),
    timing_reason: p.timing_reason || '',
  };

  const autopilotOk =
    config.mode === 'autopilot' &&
    p.risk_level === 'low' &&
    (config.allowed_channels || []).includes(p.channel);

  // Autopilot still respects the agent's own timing — it queues instead of blasting.
  if (autopilotOk && draft.scheduled_for) {
    await base44.entities.AgentAction.create({ ...draft, status: 'scheduled', mode: 'autopilot' });
    return {
      ok: true,
      continueLoop: true,
      message: `Autopilot scheduled ${p.action_type.replace(/_/g, ' ')} to ${lead.name} for ${new Date(draft.scheduled_for).toLocaleString()}.`,
    };
  }

  if (autopilotOk) {
    const created = await base44.entities.AgentAction.create({ ...draft, status: 'executed', mode: 'autopilot' });
    const sim = await executeAction(base44, orgId, created.id, { ...draft, id: created.id });
    return {
      ok: true,
      executed: true,
      continueLoop: true,
      message: `Autopilot executed ${p.action_type.replace(/_/g, ' ')} to ${lead.name} → ${sim.outcome.replace(/_/g, ' ')}.`,
    };
  }

  await base44.entities.AgentAction.create({ ...draft, status: 'proposed', mode: config.mode });
  const routed = config.mode === 'autopilot'
    ? 'This action is outside autopilot guardrails — routed to you for approval.'
    : `New proposal ready: ${p.action_type.replace(/_/g, ' ')} to ${lead.name}.`;
  return { ok: true, continueLoop: false, message: routed };
}

// Propose mode: one step, then stop. Autopilot: keep working autonomously
// until a guardrail, a needed approval, or an empty pipeline stops it.
export async function runAgentCycle(base44, orgId) {
  let executedCount = 0;
  let last;
  for (let i = 0; i < MAX_AUTOPILOT_STEPS; i++) {
    last = await runAgentStep(base44, orgId);
    if (last.executed) executedCount++;
    if (!last.continueLoop) break;
  }
  if (executedCount > 1) {
    return { ok: true, message: `Autopilot ran ${executedCount} actions back-to-back. ${last.message}` };
  }
  return last;
}

export async function approveAction(base44, orgId, action, edits) {
  let patch = { status: 'executed' };
  let acted = { ...action };
  if (edits) {
    patch = {
      ...patch,
      subject: edits.subject,
      message: edits.message,
      was_edited: true,
      original_message: action.message,
      decision_reason: edits.reason,
    };
    acted = { ...acted, ...patch };
    const learning = await deriveLearning(base44, {
      kind: 'user edit before approval',
      action,
      detail: `The user edited the draft before sending. Their reason: "${edits.reason}". Original draft: "${action.message}". Edited version: "${edits.message}". Study the DIFF between the two versions — what they removed, added, softened or sharpened — and capture their standing preference.`,
      tier: 'operator_rule',
    });
    await saveLearning(base44, orgId, learning, 'edit', `Edited ${action.action_type} → ${action.lead_name}`, 'operator_rule');
  }
  // An approved action with a future send time waits in the queue for the hourly sender.
  const due = !acted.scheduled_for || new Date(acted.scheduled_for) <= new Date();
  if (!due) {
    await base44.entities.AgentAction.update(action.id, { ...patch, status: 'scheduled' });
    return;
  }
  await base44.entities.AgentAction.update(action.id, patch);
  if (action.mode === 'autopilot') {
    await executeAction(base44, orgId, action.id, acted);
  } else {
    await deliverAction(base44, orgId, action.id, acted);
  }
}

// Sends every scheduled action whose time has come, across all organizations.
export async function sendDueActions(base44) {
  const now = new Date();
  const queued = await base44.asServiceRole.entities.AgentAction.filter({ status: 'scheduled' }, 'scheduled_for', 200);
  // Only orgs on autopilot send automatically — in propose mode the user sends manually.
  const allowed = new Set(await autopilotOrgIds(base44));
  const due = queued.filter((a) => a.scheduled_for && new Date(a.scheduled_for) <= now && allowed.has(a.org_id));
  const sent = [];
  for (const action of due) {
    if (action.mode === 'autopilot') {
      await executeAction(base44, action.org_id, action.id, action);
    } else {
      await deliverAction(base44, action.org_id, action.id, action);
    }
    sent.push(`${action.action_type} → ${action.lead_name}`);
  }
  return { ok: true, queued: queued.length, sent: sent.length, details: sent };
}

export async function rejectAction(base44, orgId, action, reason) {
  await base44.entities.AgentAction.update(action.id, { status: 'rejected', decision_reason: reason });
  const learning = await deriveLearning(base44, {
    kind: 'user rejection',
    action,
    detail: `The user REJECTED this action. Their reason: "${reason}"`,
    tier: 'operator_rule',
  });
  await saveLearning(base44, orgId, learning, 'rejection', `Rejected ${action.action_type} → ${action.lead_name}`, 'operator_rule');
}