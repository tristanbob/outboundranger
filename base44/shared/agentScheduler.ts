import { proposeNextAction } from './agentBrain.ts';
import { scheduledFor } from './agentRuntime.ts';

const ACTIVE_STATUSES = ['new', 'contacted', 'replied'];
// A lead with any of these already has a next step in flight.
const IN_FLIGHT = ['proposed', 'scheduled', 'executed'];

// Reviews every lead with no next step in flight, drafts it, and queues it.
// Only runs for orgs on autopilot — in propose mode the user drives manually.
export async function scheduleActionsForOrg(base44, orgId, { leadId } = {}) {
  const db = base44.asServiceRole.entities;
  const [cfgs, leads, actions, memories, allMessages] = await Promise.all([
    db.AgentConfig.filter({ org_id: orgId }),
    db.Lead.filter({ org_id: orgId }, '-signal_strength', 200),
    db.AgentAction.filter({ org_id: orgId }, '-created_date', 200),
    db.MemoryEntry.filter({ org_id: orgId }, '-created_date', 200),
    db.Message.filter({ org_id: orgId }, 'created_date', 500),
  ]);

  const config = cfgs[0];
  if (!config) return { ok: false, scheduled: 0, message: 'No agent config for this organization.' };
  if (config.mode !== 'autopilot' || config.paused) {
    return { ok: false, scheduled: 0, message: 'Autopilot is off — automatic scheduling skipped.' };
  }

  const threads = {};
  allMessages.forEach((m) => {
    if (!m.lead_id) return;
    (threads[m.lead_id] = threads[m.lead_id] || []).push(m);
  });

  const inFlight = new Set(actions.filter((a) => IN_FLIGHT.includes(a.status)).map((a) => a.lead_id));
  let targets = leads.filter((l) => ACTIVE_STATUSES.includes(l.status) && !inFlight.has(l.id));
  if (leadId) targets = targets.filter((l) => l.id === leadId);

  const details = [];
  for (const lead of targets) {
    const p = await proposeNextAction(base44, {
      leads: [lead],
      memories: memories.filter((m) => m.active),
      config,
      recentActions: actions.filter((a) => a.lead_id === lead.id),
      threads,
    });
    const withinGuardrails = p.risk_level === 'low' && (config.allowed_channels || []).includes(p.channel);
    await db.AgentAction.create({
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
      scheduled_for: withinGuardrails ? (scheduledFor(p.send_delay_hours) || new Date().toISOString()) : '',
      timing_reason: p.timing_reason || '',
      status: withinGuardrails ? 'scheduled' : 'proposed',
      mode: 'autopilot',
    });
    details.push(`${p.action_type} → ${lead.name}${withinGuardrails ? ' (scheduled)' : ' (needs approval)'}`);
  }

  return { ok: true, scheduled: details.length, skipped_leads: leads.length - targets.length, details };
}

export async function scheduleActionsForOrgs(base44, orgIds) {
  const results = {};
  for (const orgId of orgIds) {
    results[orgId] = await scheduleActionsForOrg(base44, orgId);
  }
  return results;
}