import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { runAgentCycle } from '../../shared/agentRuntime.ts';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { org_id } = await req.json();
    if (!org_id) return Response.json({ error: 'org_id is required' }, { status: 400 });

    const result = await runAgentCycle(base44, org_id);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}