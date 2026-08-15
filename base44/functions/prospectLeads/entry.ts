import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sourceLeads } from '../../shared/leadProspecting.ts';

// On-demand prospecting from the Find leads button.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { org_id, count = 3 } = await req.json();
    if (!org_id) return Response.json({ error: 'org_id is required' }, { status: 400 });

    const leads = await sourceLeads(base44, org_id, count);
    return Response.json({ leads });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}