import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { resolveAction } from '../../shared/agentRuntime.ts';

// Propose mode, phase 2: the customer reacts to a sent message and the agent
// runs its full learning pass on the result.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { org_id, action_id } = await req.json();
    if (!org_id || !action_id) return Response.json({ error: 'org_id and action_id are required' }, { status: 400 });

    const action = await base44.entities.AgentAction.get(action_id);
    if (!action || action.org_id !== org_id) return Response.json({ error: 'Action not found' }, { status: 404 });

    const lead = action.lead_id ? await base44.entities.Lead.get(action.lead_id).catch(() => null) : null;
    if (!lead) return Response.json({ error: 'Lead not found' }, { status: 404 });

    const sim = await resolveAction(base44, org_id, action_id, action, lead);
    return Response.json(sim);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}