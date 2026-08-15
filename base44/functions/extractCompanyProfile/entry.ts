import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// The GTM profile is extracted in two halves that run at the same time:
// what the company sells, and who they sell to / how they sound.
// Two smaller parallel reads finish noticeably faster than one big one.
const OFFER_KEYS = ['company_name', 'what_we_sell', 'value_prop', 'differentiators', 'proof_points'];
const ICP_KEYS = ['icp_titles', 'icp_segments', 'icp_industries', 'goal', 'tone', 'avoid'];

const HONESTY = `Fill each field ONLY if the source material genuinely supports it. This is critical: if the website or notes do not tell you the answer, return an EMPTY STRING for that field. Never guess, never fill a field with generic marketing filler, never infer anything that isn't evidenced. Empty is the correct answer when you don't know — a human will be asked.`;

function sourceBlock(website, pastedInfo) {
  return `${website ? `THEIR WEBSITE: ${website} — look it up and read it.` : ''}
${pastedInfo ? `INFO THEY PASTED:\n"""\n${pastedInfo}\n"""` : ''}`;
}

function schemaFor(keys, extra) {
  const properties = {};
  keys.forEach((k) => { properties[k] = { type: 'string' }; });
  Object.assign(properties, extra);
  return { type: 'object', properties };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { org_id, website = '', pastedInfo = '' } = await req.json();
    if (!org_id) return Response.json({ error: 'org_id is required' }, { status: 400 });
    if (!website && !pastedInfo) return Response.json({ error: 'Provide a website or pasted info' }, { status: 400 });

    const llm = base44.asServiceRole.integrations.Core.InvokeLLM;
    const common = { add_context_from_internet: !!website, model: 'gemini_3_flash' };

    const [offer, icp, existingRows] = await Promise.all([
      llm({
        ...common,
        prompt: `You are onboarding a new customer onto an autonomous GTM sales agent. From the source material below, describe WHAT THIS COMPANY SELLS.

${sourceBlock(website, pastedInfo)}

${HONESTY}

Fields:
- company_name: their company name
- what_we_sell: the actual product or service, concretely
- value_prop: the problem they solve and the outcome for the buyer
- differentiators: why buyers choose them over alternatives
- proof_points: named customers, metrics or results usable in outreach

Also return "summary": two sentences describing what you learned about this company.`,
        response_json_schema: schemaFor(OFFER_KEYS, { summary: { type: 'string' } }),
      }),
      llm({
        ...common,
        prompt: `You are onboarding a new customer onto an autonomous GTM sales agent. From the source material below, describe WHO THEY SELL TO and HOW THEY SOUND.

${sourceBlock(website, pastedInfo)}

${HONESTY}

Fields:
- icp_titles: the job titles they sell to
- icp_segments: company sizes they target (startup / SMB / mid-market / enterprise)
- icp_industries: industries or verticals
- goal: what their GTM motion is optimising for, if stated
- tone: the voice their own writing uses
- avoid: anything they state they don't do or don't want

Also return "notes_for_user": a short list of what you could NOT determine.`,
        response_json_schema: schemaFor(ICP_KEYS, { notes_for_user: { type: 'string' } }),
      }),
      base44.entities.CompanyProfile.filter({ org_id }, '-created_date', 1),
    ]);

    const values = {};
    OFFER_KEYS.forEach((k) => { values[k] = (offer?.[k] || '').trim(); });
    ICP_KEYS.forEach((k) => { values[k] = (icp?.[k] || '').trim(); });

    // Persist right away so the extraction survives the user closing the app.
    const draft = { ...values, org_id, website: website || '', source_text: pastedInfo || '' };
    const existing = existingRows?.[0];
    let profile;
    if (existing) {
      profile = await base44.entities.CompanyProfile.update(existing.id, draft);
    } else if (draft.company_name) {
      profile = await base44.entities.CompanyProfile.create({ ...draft, completed: false });
    }

    return Response.json({
      values,
      summary: offer?.summary || '',
      notes: icp?.notes_for_user || '',
      profile: profile || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}