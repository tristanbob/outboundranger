import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { scheduleActionsForOrg, scheduleActionsForOrgs } from '../../shared/agentScheduler.ts';
import { autopilotOrgIds } from '../../shared/leadProspecting.ts';

// Reviews leads and queues their next step.
// With org_id (+ optional lead_id) it works one org; with neither it sweeps every autopilot org.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { org_id, lead_id } = body || {};

    if (org_id) {
      const result = await scheduleActionsForOrg(base44, org_id, { leadId: lead_id });
      return Response.json(result);
    }

    const orgIds = await autopilotOrgIds(base44);
    const results = await scheduleActionsForOrgs(base44, orgIds);
    return Response.json({ ok: true, orgs: orgIds.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}