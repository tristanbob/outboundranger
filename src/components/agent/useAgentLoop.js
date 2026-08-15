import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { proposeNextAction, deriveLearning, assessReply, updateDossier } from './agentEngine';
import { scoreAppliedMemories } from './memoryScoring';
import { deliverAndRespond } from '@/components/customer/customerAgent';

const ACTIVE_STATUSES = ['new', 'contacted', 'replied'];
async function saveLearning(learning, source, detail, tier) {
  if (!learning?.has_insight || !learning.insight) return;
  await base44.entities.MemoryEntry.create({
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

async function executeAction(actionId, action) {
  const lead = action.lead_id ? await base44.entities.Lead.get(action.lead_id).catch(() => null) : null;
  let sim = { outcome: 'no_response', outcome_details: 'Lead not found — message could not be delivered.' };
  let assessment = null;
  let thread = [];
  if (lead) {
    const resp = await deliverAndRespond({
      lead,
      sender: 'gtm_agent',
      channel: action.channel,
      subject: action.subject,
      body: action.message,
      actionId,
    });
    sim = {
      outcome: resp.outcome,
      outcome_details: resp.responds && resp.reply ? `${lead.name} replied: "${resp.reply}"` : resp.details,
    };
    thread = await base44.entities.Message.filter({ lead_id: lead.id }, 'created_date', 100);
    if (resp.responds && resp.reply) {
      assessment = await assessReply({ lead, action, thread });
    }
  }
  await base44.entities.AgentAction.update(actionId, {
    status: 'completed',
    outcome: sim.outcome,
    outcome_details: sim.outcome_details,
    reply_read: assessment?.reply_read || '',
    reply_objection: assessment?.reply_objection || '',
    ...(assessment?.reply_interest ? { reply_interest: assessment.reply_interest } : {}),
    recommended_next_move: assessment?.recommended_next_move || '',
    executed_at: new Date().toISOString(),
  });
  // Tier 2: credit or retire the rules this action actually leaned on.
  await scoreAppliedMemories(action.applied_memory_ids || [], sim.outcome);

  // Tier 3: a durable dossier on this specific customer — facts, not general rules.
  if (lead) {
    const d = await updateDossier({ lead, thread, action, assessment });
    if (d?.dossier) {
      await base44.entities.Lead.update(lead.id, {
        dossier: d.dossier,
        dossier_do_not_repeat: d.do_not_repeat || lead.dossier_do_not_repeat || '',
        dossier_updated: new Date().toISOString(),
      });
    }
  }

  const learning = await deriveLearning({
    kind: 'observed outcome',
    action,
    detail: `The send resulted in "${sim.outcome}": ${sim.outcome_details}${assessment ? ` The agent read the reply as: ${assessment.reply_read}${assessment.reply_objection ? ` Objection raised: ${assessment.reply_objection}.` : ''} Interest ${assessment.reply_interest}.` : ''}`,
    tier: 'playbook',
  });
  await saveLearning(learning, 'outcome', `${action.action_type} → ${action.lead_name}: ${sim.outcome}`, 'playbook');
  if (learning?.prediction_hit) {
    await base44.entities.AgentAction.update(actionId, { prediction_hit: learning.prediction_hit });
  }
  return sim;
}

export function useAgentLoop(reload) {
  const [running, setRunning] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function runCycle() {
    setRunning(true);
    try {
      const [cfgs, leads, actions, memories, allMessages] = await Promise.all([
        base44.entities.AgentConfig.list(),
        base44.entities.Lead.list('-signal_strength', 200),
        base44.entities.AgentAction.list('-created_date', 200),
        base44.entities.MemoryEntry.list('-created_date', 200),
        base44.entities.Message.list('created_date', 500),
      ]);
      const threads = {};
      allMessages.forEach((m) => {
        if (!m.lead_id) return;
        (threads[m.lead_id] = threads[m.lead_id] || []).push(m);
      });
      const config = cfgs[0];
      if (!config) return { ok: false, message: 'Configure the agent in Settings first.' };
      if (config.paused) return { ok: false, message: 'Agent is paused. Resume it to run a cycle.' };
      if (actions.some((a) => a.status === 'proposed')) {
        return { ok: false, message: 'A proposal is already awaiting your review below.' };
      }
      const activeLeads = leads.filter((l) => ACTIVE_STATUSES.includes(l.status));
      if (!activeLeads.length) return { ok: false, message: 'No active leads to work. Add leads first.' };
      const today = new Date().toISOString().slice(0, 10);
      const todayCount = actions.filter(
        (a) => (a.created_date || '').slice(0, 10) === today && a.status !== 'rejected'
      ).length;
      if (todayCount >= (config.daily_action_limit || 10)) {
        return { ok: false, message: 'Daily action limit reached — guardrail stopped the agent for today.' };
      }

      const p = await proposeNextAction({
        leads: activeLeads,
        memories: memories.filter((m) => m.active),
        config,
        recentActions: actions,
        threads,
      });
      const lead = activeLeads.find((l) => l.id === p.lead_id) || activeLeads[0];
      const draft = {
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
      };

      const autopilotOk =
        config.mode === 'autopilot' &&
        p.risk_level === 'low' &&
        (config.allowed_channels || []).includes(p.channel);

      if (autopilotOk) {
        const created = await base44.entities.AgentAction.create({ ...draft, status: 'executed', mode: 'autopilot' });
        const sim = await executeAction(created.id, { ...draft, id: created.id });
        return { ok: true, message: `Autopilot executed ${p.action_type.replace(/_/g, ' ')} to ${lead.name} → ${sim.outcome.replace(/_/g, ' ')}.` };
      }

      await base44.entities.AgentAction.create({ ...draft, status: 'proposed', mode: config.mode });
      const routed = config.mode === 'autopilot'
        ? 'This action is outside autopilot guardrails — routed to you for approval.'
        : `New proposal ready: ${p.action_type.replace(/_/g, ' ')} to ${lead.name}.`;
      return { ok: true, message: routed };
    } finally {
      setRunning(false);
      await reload();
    }
  }

  async function approve(action, edits) {
    setBusyId(action.id);
    try {
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
        const learning = await deriveLearning({
          kind: 'user edit before approval',
          action,
          detail: `The user edited the draft before sending. Their reason: "${edits.reason}". Original draft: "${action.message}". Edited version: "${edits.message}". Study the DIFF between the two versions — what they removed, added, softened or sharpened — and capture their standing preference.`,
          tier: 'operator_rule',
        });
        await saveLearning(learning, 'edit', `Edited ${action.action_type} → ${action.lead_name}`, 'operator_rule');
      }
      await base44.entities.AgentAction.update(action.id, patch);
      await executeAction(action.id, acted);
    } finally {
      setBusyId(null);
      await reload();
    }
  }

  async function reject(action, reason) {
    setBusyId(action.id);
    try {
      await base44.entities.AgentAction.update(action.id, { status: 'rejected', decision_reason: reason });
      const learning = await deriveLearning({
        kind: 'user rejection',
        action,
        detail: `The user REJECTED this action. Their reason: "${reason}"`,
        tier: 'operator_rule',
      });
      await saveLearning(learning, 'rejection', `Rejected ${action.action_type} → ${action.lead_name}`, 'operator_rule');
    } finally {
      setBusyId(null);
      await reload();
    }
  }

  return { running, busyId, runCycle, approve, reject };
}