import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendDueActions } from '../../shared/agentRuntime.ts';

// Runs on a schedule (and on demand): sends every queued action that is now due.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const result = await sendDueActions(base44);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}