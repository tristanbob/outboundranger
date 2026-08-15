import { base44 } from '@/api/base44Client';
import { getCurrentOrgId } from '@/lib/org';

// Prospecting runs server-side: it loads the goal, pipeline, memory and profile
// in parallel, then creates the new leads. Returns the created leads.
export async function findNewLeads({ count = 3 } = {}) {
  const res = await base44.functions.invoke('prospectLeads', {
    org_id: getCurrentOrgId(),
    count,
  });
  const data = res.data || {};
  if (data.error) throw new Error(data.error);
  return data.leads || [];
}