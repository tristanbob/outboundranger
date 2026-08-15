import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// The agent calls this INSTEAD of acting. It only queues a request — the
// operator has to press Approve in the chat before anything actually happens.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { org_id, kind, summary, rule_insight, rule_category, rule_scope } = body || {};
    if (!org_id) return Response.json({ error: 'org_id is required' }, { status: 400 });
    if (!['operator_rule', 'run_cycle'].includes(kind)) {
      return Response.json({ error: 'kind must be operator_rule or run_cycle' }, { status: 400 });
    }
    if (kind === 'operator_rule' && !rule_insight) {
      return Response.json({ error: 'rule_insight is required for operator_rule' }, { status: 400 });
    }

    const request = await base44.asServiceRole.entities.ApprovalRequest.create({
      org_id,
      kind,
      summary: summary || (kind === 'run_cycle' ? 'Run a work cycle' : rule_insight),
      rule_insight: rule_insight || '',
      rule_category: rule_category || 'strategy',
      rule_scope: rule_scope || 'all leads',
      status: 'pending',
    });

    return Response.json({
      queued: true,
      request_id: request.id,
      message: 'Approval requested. Tell the operator it is waiting for their approval in the chat — do not claim it is done.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}