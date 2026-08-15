import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { consolidateOrgMemory, orgIdsWithMemory } from '../../shared/memoryConsolidation.ts';

// Nightly consolidation pass over the agent's learned playbook.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const orgIds = body?.org_id ? [body.org_id] : await orgIdsWithMemory(base44);
    const results = {};
    for (const orgId of orgIds) {
      results[orgId] = await consolidateOrgMemory(base44, orgId);
    }
    return Response.json({ ok: true, orgs: orgIds.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}