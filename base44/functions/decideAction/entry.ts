import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { approveAction, rejectAction } from '../../shared/agentRuntime.ts';

// Approving or rejecting a proposal: the send, the customer reaction and the
// learning pass all run here so closing the app never interrupts them.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { org_id, action_id, decision, edits, reason } = await req.json();
    if (!org_id || !action_id) return Response.json({ error: 'org_id and action_id are required' }, { status: 400 });

    const action = await base44.entities.AgentAction.get(action_id);
    if (!action || action.org_id !== org_id) return Response.json({ error: 'Action not found' }, { status: 404 });

    if (decision === 'reject') {
      await rejectAction(base44, org_id, action, reason || '');
    } else {
      await approveAction(base44, org_id, action, edits || null);
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}