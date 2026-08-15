import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

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

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { org_id, count = 3 } = await req.json();
    if (!org_id) return Response.json({ error: 'org_id is required' }, { status: 400 });

    // Everything the prospector needs is loaded at once.
    const [configs, leads, memories, profiles] = await Promise.all([
      base44.entities.AgentConfig.filter({ org_id }),
      base44.entities.Lead.filter({ org_id }, '-created_date', 200),
      base44.entities.MemoryEntry.filter({ org_id }, '-created_date', 200),
      base44.entities.CompanyProfile.filter({ org_id }, '-created_date', 1),
    ]);

    const goal = configs?.[0]?.goal || 'Book qualified meetings with our ideal customers';
    const profile = profiles?.[0] || null;

    const targetingRules = memories
      .filter((m) => m.active && ['targeting', 'strategy'].includes(m.category))
      .map((m) => `- ${m.tier === 'operator_rule' ? '[MUST OBEY] ' : ''}${m.insight}${m.scope ? ` (applies to: ${m.scope})` : ''}`)
      .join('\n') || 'None yet.';

    const existing = leads.map((l) => `${l.name} — ${l.company}`).join('\n') || 'None yet.';

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the prospecting arm of an autonomous GTM sales agent. Goal: "${goal}".

THE COMPANY YOU PROSPECT FOR:
${profileBrief(profile)}

Find ${count} NEW leads worth working, based on real companies and plausible buying signals you can find right now.

TARGETING RULES YOU MUST RESPECT:
${targetingRules}

ALREADY IN THE PIPELINE — never return these people or companies again:
${existing}

For each lead give a real company, a realistic decision-maker name and title for that company, a plausible work email, the segment, and the concrete reason they are an opportunity RIGHT NOW (a hiring push, funding, launch, leadership change, expansion). signal_strength 0-100 reflects how strong and timely that reason is — be honest, not everything is a 90.
Also give a short "persona" describing how this buyer tends to communicate, and one line on why they fit the goal.`,
      add_context_from_internet: true,
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
    if (!fresh.length) return Response.json({ leads: [] });

    const created = await base44.entities.Lead.bulkCreate(
      fresh.map((l) => ({
        org_id,
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

    return Response.json({ leads: created || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}