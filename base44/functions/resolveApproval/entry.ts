import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Called from the chat UI when the operator presses Approve or Discard.
// This is the only place a gated action actually executes.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { request_id, approve } = (await req.json()) || {};
    if (!request_id) return Response.json({ error: 'request_id is required' }, { status: 400 });

    const request = await base44.asServiceRole.entities.ApprovalRequest.get(request_id);
    if (!request) return Response.json({ error: 'Request not found' }, { status: 404 });
    if (request.status !== 'pending') {
      return Response.json({ error: 'This request was already resolved' }, { status: 409 });
    }

    if (!approve) {
      const updated = await base44.asServiceRole.entities.ApprovalRequest.update(request_id, {
        status: 'discarded',
        result: 'Discarded by the operator — nothing was changed.',
        resolved_at: new Date().toISOString(),
      });
      return Response.json({ request: updated });
    }

    let result = '';
    if (request.kind === 'operator_rule') {
      await base44.asServiceRole.entities.MemoryEntry.create({
        org_id: request.org_id,
        insight: request.rule_insight,
        tier: 'operator_rule',
        source: 'manual',
        category: request.rule_category || 'strategy',
        scope: request.rule_scope || 'all leads',
        source_detail: 'Approved by the operator in chat',
        active: true,
        last_confirmed: new Date().toISOString(),
      });
      result = 'Rule saved — the agent applies it to all future outreach.';
    } else {
      const res = await base44.functions.invoke('runAgentCycle', { org_id: request.org_id });
      const count = res?.data?.actions?.length ?? res?.data?.created?.length;
      result = count ? `Work cycle finished — ${count} action${count > 1 ? 's' : ''} to review.` : 'Work cycle finished.';
    }

    const updated = await base44.asServiceRole.entities.ApprovalRequest.update(request_id, {
      status: 'approved',
      result,
      resolved_at: new Date().toISOString(),
    });
    return Response.json({ request: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}