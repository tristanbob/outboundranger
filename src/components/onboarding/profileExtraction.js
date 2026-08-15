import { base44 } from '@/api/base44Client';
import { getCurrentOrgId } from '@/lib/org';

// Runs server-side so it completes even if the user closes the app mid-read,
// and so the extracted profile is saved as a draft the moment it's ready.
export async function extractProfile({ website, pastedInfo }) {
  const res = await base44.functions.invoke('extractCompanyProfile', {
    org_id: getCurrentOrgId(),
    website: website || '',
    pastedInfo: pastedInfo || '',
  });
  const data = res.data || {};
  if (data.error) throw new Error(data.error);
  return {
    values: data.values || {},
    summary: data.summary || '',
    notes: data.notes || '',
    profile: data.profile || null,
  };
}