import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { getCurrentOrgId } from '@/lib/org';

// Persists in-progress onboarding answers so nothing is lost if the user
// closes the app before finishing. Drafts are CompanyProfile rows with
// completed: false — the wizard picks them back up on the next visit.
export function saveDraft({ existing, values, source }) {
  const payload = {
    ...values,
    org_id: getCurrentOrgId(),
    website: source?.website || values.website || '',
    source_text: source?.pastedInfo || '',
  };
  if (existing) return base44.entities.CompanyProfile.update(existing.id, payload);
  if (!payload.company_name) return Promise.resolve(null);
  return base44.entities.CompanyProfile.create({ ...payload, completed: false });
}

// Debounced autosave while the user edits the review step.
export function useDraftAutosave({ enabled, existing, values, source, onCreated }) {
  const first = useRef(true);
  useEffect(() => {
    if (!enabled) return;
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => {
      saveDraft({ existing, values, source }).then((row) => {
        if (!existing && row) onCreated?.(row);
      });
    }, 1200);
    return () => clearTimeout(t);
  }, [enabled, values, existing, source, onCreated]);
}