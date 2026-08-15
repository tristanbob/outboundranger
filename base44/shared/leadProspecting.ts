// Web-sourced prospecting. Shared by the on-demand button and the daily run.

function profileBrief(profile) {
  if (!profile) return 'No company profile yet — the user has not completed onboarding.';
  const line = (label, v) => (v ? `${label}: ${v}\n` : '');
  return (
    line('Company', profile.company_name) +
    line('What they sell', profile.what_we_sell) +
    line('Value proposition', profile.value_prop) +
    line('Buyer titles', profile.icp_titles) +
    line('Target company sizes', profile.icp_segments) +
    line('Target industries', profile.icp_industries) +
    line('Why they win', profile.differentiators)
  ).trim();
}

// Demo mode: leads are invented by the AI. Flip USE_WEB_SEARCH to true to source real
// companies from live web results instead (the prompt/model swap below is kept for that).
const USE_WEB_SEARCH = false;

export async function sourceLeads(base44, orgId, count = 3) {
  const db = base44.asServiceRole.entities;
  const [configs, leads, memories, profiles] = await Promise.all([
    db.AgentConfig.filter({ org_id: orgId }),
    db.Lead.filter({ org_id: orgId }, '-created_date', 200),
    db.MemoryEntry.filter({ org_id: orgId }, '-created_date', 200),
    db.CompanyProfile.filter({ org_id: orgId }, '-created_date', 1),
  ]);

  const goal = configs?.[0]?.goal || 'Book qualified meetings with our ideal customers';
  const profile = profiles?.[0] || null;

  const targetingRules = memories
    .filter((m) => m.active && ['targeting', 'strategy'].includes(m.category))
    .map((m) => `- ${m.tier === 'operator_rule' ? '[MUST OBEY] ' : ''}${m.insight}${m.scope ? ` (applies to: ${m.scope})` : ''}`)
    .join('\n') || 'None yet.';

  const existing = leads.map((l) => `${l.name} — ${l.company}`).join('\n') || 'None yet.';

  const sourcingLine = USE_WEB_SEARCH
    ? `Find ${count} NEW leads worth working, based on real companies and plausible buying signals you can find right now.`
    : `INVENT ${count} NEW realistic but entirely fictional leads for a product demo. Do NOT use real companies or real people — make up company names that sound credible for the target industries, and fictional decision-makers at them.`;

  const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are the prospecting arm of an autonomous GTM sales agent. Goal: "${goal}".

THE COMPANY YOU PROSPECT FOR:
${profileBrief(profile)}

${sourcingLine}

TARGETING RULES YOU MUST RESPECT:
${targetingRules}

ALREADY IN THE PIPELINE — never return these people or companies again:
${existing}

For each lead give a ${USE_WEB_SEARCH ? 'real' : 'plausible fictional'} company, a realistic decision-maker name and title for that company, a plausible work email, the segment, and the concrete reason they are an opportunity RIGHT NOW (a hiring push, funding, launch, leadership change, expansion). signal_strength 0-100 reflects how strong and timely that reason is — be honest, not everything is a 90.
Also give a short "persona" describing how this buyer tends to communicate, and one line on why they fit the goal.`,
    add_context_from_internet: USE_WEB_SEARCH,
    model: 'gemini_3_flash',
    response_json_schema: {
      type: 'object',
      properties: {
        leads: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              company: { type: 'string' },
              title: { type: 'string' },
              email: { type: 'string' },
              segment: { type: 'string', enum: ['startup', 'smb', 'mid_market', 'enterprise'] },
              signal: { type: 'string' },
              signal_strength: { type: 'number' },
              persona: { type: 'string' },
              notes: { type: 'string' },
            },
            required: ['name', 'company', 'signal', 'signal_strength'],
          },
        },
      },
      required: ['leads'],
    },
  });

  const known = new Set(leads.map((l) => (l.company || '').trim().toLowerCase()));
  const fresh = (res?.leads || []).filter((l) => l.company && !known.has(l.company.trim().toLowerCase()));
  if (!fresh.length) return [];

  const created = await db.Lead.bulkCreate(
    fresh.map((l) => ({
      org_id: orgId,
      name: l.name,
      company: l.company,
      title: l.title || '',
      email: l.email || '',
      segment: l.segment || 'smb',
      signal: l.signal,
      signal_strength: Math.max(0, Math.min(100, Math.round(l.signal_strength || 0))),
      persona: l.persona || '',
      notes: l.notes || '',
      status: 'new',
    }))
  );
  return created || [];
}

// Orgs whose agent is allowed to act on its own.
export async function autopilotOrgIds(base44) {
  const cfgs = await base44.asServiceRole.entities.AgentConfig.filter({ mode: 'autopilot' }, '-created_date', 500);
  return cfgs.filter((c) => !c.paused).map((c) => c.org_id).filter(Boolean);
}