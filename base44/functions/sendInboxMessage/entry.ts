import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { deliverMessage, generateCustomerResponse } from '../../shared/agentRuntime.ts';

// A human reply from the Inbox: logged, then the simulated customer answers.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { org_id, lead_id, body, subject, channel } = await req.json();
    if (!org_id || !lead_id || !body) {
      return Response.json({ error: 'org_id, lead_id and body are required' }, { status: 400 });
    }

    const lead = await base44.entities.Lead.get(lead_id);
    if (!lead || lead.org_id !== org_id) return Response.json({ error: 'Lead not found' }, { status: 404 });

    await deliverMessage(base44, org_id, { lead, sender: 'user', channel: channel || 'email', subject, body });
    const resp = await generateCustomerResponse(base44, org_id, { lead: { ...lead, status: lead.status === 'new' ? 'contacted' : lead.status }, channel: channel || 'email' });
    return Response.json(resp);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}