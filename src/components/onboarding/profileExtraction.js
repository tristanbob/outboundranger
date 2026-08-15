import { base44 } from '@/api/base44Client';
import { PROFILE_FIELDS } from './fields';

const KEYS = PROFILE_FIELDS.map((f) => f.key);

// Reads a website and/or pasted notes and fills in as much of the GTM profile
// as the source honestly supports. Anything it can't support is left empty —
// the wizard then asks the user directly rather than inventing an answer.
export async function extractProfile({ website, pastedInfo }) {
  const props = {};
  KEYS.forEach((k) => {
    props[k] = { type: 'string' };
  });

  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `You are onboarding a new customer onto an autonomous GTM sales agent. Build their go-to-market profile from the source material below.

${website ? `THEIR WEBSITE: ${website} — look it up and read it.` : ''}
${pastedInfo ? `INFO THEY PASTED:\n"""\n${pastedInfo}\n"""` : ''}

Fill each field ONLY if the source material genuinely supports it. This is critical: if the website or notes do not tell you the answer, return an EMPTY STRING for that field. Never guess, never fill a field with generic marketing filler, never infer an ICP that isn't evidenced. Empty is the correct answer when you don't know — a human will be asked.

Fields:
- company_name: their company name
- what_we_sell: the actual product or service, concretely
- value_prop: the problem they solve and the outcome for the buyer
- icp_titles: the job titles they sell to
- icp_segments: company sizes they target (startup / SMB / mid-market / enterprise)
- icp_industries: industries or verticals
- differentiators: why buyers choose them over alternatives
- proof_points: named customers, metrics or results usable in outreach
- goal: what their GTM motion is optimising for, if stated
- tone: the voice their own writing uses
- avoid: anything they state they don't do or don't want

Also return "summary": two sentences describing what you learned about this company, and "notes_for_user": a short list of what you could NOT determine.`,
    add_context_from_internet: !!website,
    model: 'gemini_3_flash',
    response_json_schema: {
      type: 'object',
      properties: {
        ...props,
        summary: { type: 'string' },
        notes_for_user: { type: 'string' },
      },
    },
  });

  const values = {};
  KEYS.forEach((k) => {
    values[k] = (res?.[k] || '').trim();
  });
  return { values, summary: res?.summary || '', notes: res?.notes_for_user || '' };
}