import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sourceLeads, autopilotOrgIds } from '../../shared/leadProspecting.ts';

// Daily lead sourcing for every organization running on autopilot.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const count = body?.count || 3;

    const orgIds = await autopilotOrgIds(base44);
    const results = {};
    for (const orgId of orgIds) {
      const created = await sourceLeads(base44, orgId, count);
      results[orgId] = created.map((l) => `${l.name} · ${l.company}`);
    }
    return Response.json({ ok: true, orgs: orgIds.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}