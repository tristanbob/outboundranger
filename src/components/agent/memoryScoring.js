import { base44 } from '@/api/base44Client';

export const POSITIVE_OUTCOMES = ['reply', 'meeting_booked', 'conversion'];

// Rules only accumulate credit if they were actually applied. A playbook tactic
// that keeps failing gets retired — operator rules are never retired.
export async function scoreAppliedMemories(ids = [], outcome) {
  if (!ids.length) return;
  const positive = POSITIVE_OUTCOMES.includes(outcome);

  await Promise.all(ids.map(async (id) => {
    const entry = await base44.entities.MemoryEntry.get(id).catch(() => null);
    if (!entry) return;

    const applied_count = (entry.applied_count || 0) + 1;
    const positive_count = (entry.positive_count || 0) + (positive ? 1 : 0);
    const patch = {
      applied_count,
      positive_count,
      ...(positive ? { last_confirmed: new Date().toISOString() } : {}),
    };

    const failing = entry.tier !== 'operator_rule' && applied_count >= 3 && positive_count / applied_count < 0.34;
    if (failing && entry.active) {
      patch.active = false;
      patch.retire_reason = `Retired automatically — only ${positive_count} of ${applied_count} actions using this rule went anywhere.`;
    }

    await base44.entities.MemoryEntry.update(id, patch);
  }));
}