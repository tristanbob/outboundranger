import { base44 } from '@/api/base44Client';

// Prospecting step: the agent goes looking for new leads that fit the goal.
// In production this runs on a schedule; in the demo it's triggered by hand.
export async function findNewLeads({ config, leads, memories, count = 3 }) {
  const targetingRules = memories
    .filter((m) => m.active && ['targeting', 'strategy'].includes(m.category))
    .map((m) => `- ${m.tier === 'operator_rule' ? '[MUST OBEY] ' : ''}${m.insight}${m.scope ? ` (applies to: ${m.scope})` : ''}`)
    .join('\n') || 'None yet.';

  const existing = leads.map((l) => `${l.name} — ${l.company}`).join('\n') || 'None yet.';

  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `You are the prospecting arm of an autonomous GTM sales agent. Goal: "${config.goal}".

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
  if (!fresh.length) return [];

  return base44.entities.Lead.bulkCreate(
    fresh.map((l) => ({
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
}