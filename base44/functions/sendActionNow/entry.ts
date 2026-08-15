import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { executeAction } from '../../shared/agentRuntime.ts';
import { scheduleActionsForOrg } from '../../shared/agentScheduler.ts';

// Sends a queued action right now instead of waiting for its scheduled time:
// delivers the message, lets the customer react, then queues the lead's next step.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { org_id, action_id } = await req.json();
    if (!org_id || !action_id) return Response.json({ error: 'org_id and action_id are required' }, { status: 400 });

    const action = await base44.entities.AgentAction.get(action_id);
    if (!action || action.org_id !== org_id) return Response.json({ error: 'Action not found' }, { status: 404 });

    const sim = await executeAction(base44, org_id, action_id, action);
    const next = action.lead_id
      ? await scheduleActionsForOrg(base44, org_id, { leadId: action.lead_id })
      : null;

    return Response.json({ ok: true, outcome: sim.outcome, outcome_details: sim.outcome_details, next });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}