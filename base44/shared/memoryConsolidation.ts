// Nightly maintenance of the agent's playbook memory:
// merges near-duplicate learnings and retires the ones outcomes never confirmed.
// Operator rules (the user's own non-negotiables) are never touched.

const STALE_DAYS = 21;

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  return (Date.now() - new Date(dateStr).getTime()) / 86400000;
}

async function mergeDuplicates(base44, orgId, entries) {
  if (entries.length < 3) return [];
  const list = entries
    .map((m, i) => `${i + 1}. [${m.category}] (applied ${m.applied_count || 0}, worked ${m.positive_count || 0}) ${m.insight}`)
    .join('\n');

  const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are cleaning up a GTM agent's learned playbook. Below are its active learnings.

${list}

Find groups of learnings that say essentially the same thing. For each group, write one sharper merged learning that keeps the specifics. Only group items that truly overlap — if nothing overlaps, return an empty list.`,
    response_json_schema: {
      type: 'object',
      properties: {
        groups: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              numbers: { type: 'array', items: { type: 'number' } },
              merged_insight: { type: 'string' },
            },
          },
        },
      },
    },
  });

  const merged = [];
  for (const g of res?.groups || []) {
    const members = (g.numbers || []).map((n) => entries[n - 1]).filter(Boolean);
    if (members.length < 2 || !g.merged_insight) continue;
    const keeper = members.reduce((a, b) => ((b.positive_count || 0) > (a.positive_count || 0) ? b : a));
    await base44.asServiceRole.entities.MemoryEntry.update(keeper.id, {
      insight: g.merged_insight,
      applied_count: members.reduce((s, m) => s + (m.applied_count || 0), 0),
      positive_count: members.reduce((s, m) => s + (m.positive_count || 0), 0),
    });
    for (const m of members.filter((m) => m.id !== keeper.id)) {
      await base44.asServiceRole.entities.MemoryEntry.update(m.id, {
        active: false,
        retire_reason: 'Merged into a broader learning that said the same thing',
      });
    }
    merged.push(g.merged_insight);
  }
  return merged;
}

async function retireWeak(base44, entries) {
  const retired = [];
  for (const m of entries) {
    let reason = null;
    if ((m.applied_count || 0) >= 3 && (m.positive_count || 0) === 0) {
      reason = `Applied ${m.applied_count} times without a single reply or meeting`;
    } else if (
      (m.applied_count || 0) === 0 &&
      daysSince(m.last_confirmed || m.created_date) > STALE_DAYS
    ) {
      reason = `Never applied in ${STALE_DAYS}+ days — no evidence it helps`;
    }
    if (!reason) continue;
    await base44.asServiceRole.entities.MemoryEntry.update(m.id, { active: false, retire_reason: reason });
    retired.push(m.insight);
  }
  return retired;
}

export async function consolidateOrgMemory(base44, orgId) {
  const all = await base44.asServiceRole.entities.MemoryEntry.filter(
    { org_id: orgId, tier: 'playbook', active: true },
    '-created_date',
    200
  );
  const retired = await retireWeak(base44, all);
  const remaining = all.filter((m) => !retired.includes(m.insight));
  const merged = await mergeDuplicates(base44, orgId, remaining);
  return { reviewed: all.length, retired, merged };
}

// Every org that has learned something worth maintaining.
export async function orgIdsWithMemory(base44) {
  const entries = await base44.asServiceRole.entities.MemoryEntry.filter({ tier: 'playbook', active: true }, '-created_date', 1000);
  return [...new Set(entries.map((m) => m.org_id).filter(Boolean))];
}