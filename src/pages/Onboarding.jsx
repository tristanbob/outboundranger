import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { orgScope, getCurrentOrgId } from '@/lib/org';
import { useToast } from '@/components/ui/use-toast';
import SourceStep from '@/components/onboarding/SourceStep';
import ReviewStep from '@/components/onboarding/ReviewStep';
import SetupTimeline from '@/components/onboarding/SetupTimeline';
import { findNewLeads } from '@/components/agent/leadSourcing';
import { extractProfile } from '@/components/onboarding/profileExtraction';
import { PROFILE_FIELDS } from '@/components/onboarding/fields';

export default function Onboarding() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [existing, setExisting] = useState(null);
  const [step, setStep] = useState('source');
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({});
  const [meta, setMeta] = useState({ summary: '', notes: '', missingKeys: [], source: {} });
  const [steps, setSteps] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [setupDone, setSetupDone] = useState(false);

  useEffect(() => {
    base44.entities.CompanyProfile.filter(orgScope(), '-created_date', 1).then((rows) => {
      const p = rows[0] || null;
      setExisting(p);
      if (p) {
        const v = {};
        PROFILE_FIELDS.forEach((f) => { v[f.key] = p[f.key] || ''; });
        setValues(v);
        setMeta({
          summary: '',
          notes: '',
          missingKeys: PROFILE_FIELDS.filter((f) => !v[f.key]).map((f) => f.key),
          source: { website: p.website || '', pastedInfo: p.source_text || '' },
        });
        setStep('review');
      }
    });
  }, []);

  const handleExtract = async (source) => {
    setBusy(true);
    try {
      const { values: v, summary, notes } = await extractProfile(source);
      if (source.website && !v.website) v.website = source.website;
      setValues(v);
      setMeta({
        summary,
        notes,
        missingKeys: PROFILE_FIELDS.filter((f) => !v[f.key]).map((f) => f.key),
        source,
      });
      setStep('review');
    } finally {
      setBusy(false);
    }
  };

  // After the user submits, the wizard switches to a timeline so they can watch
  // each setup step the agent runs.
  const finishStep = (i, result) => {
    setSteps((s) => s.map((st, idx) => (idx === i ? { ...st, result } : st)));
    setActiveIndex(i + 1);
  };

  const handleSave = async () => {
    setSaving(true);
    setSteps([
      { key: 'profile', label: 'Saving your company profile', description: 'Storing what you sell, who you sell to and how you sound.' },
      { key: 'brief', label: 'Briefing the agent on your goal', description: 'Turning your goal into the agent’s working objective.' },
      { key: 'prospect', label: 'Finding your first leads', description: 'Searching for companies that match your ICP with a reason to talk now.' },
    ]);
    setActiveIndex(0);
    setSetupDone(false);
    setStep('setup');
    try {
      const payload = {
        ...values,
        org_id: getCurrentOrgId(),
        website: meta.source.website || values.website || '',
        source_text: meta.source.pastedInfo || '',
        completed: true,
      };
      let profile;
      if (existing) {
        profile = await base44.entities.CompanyProfile.update(existing.id, payload);
      } else {
        profile = await base44.entities.CompanyProfile.create(payload);
        setExisting(profile);
      }
      finishStep(0, `Profile saved for ${values.company_name || 'your company'}.`);

      const cfgs = await base44.entities.AgentConfig.filter(orgScope());
      let config = cfgs[0];
      const goal = values.goal?.trim();
      if (config && goal) {
        config = await base44.entities.AgentConfig.update(config.id, { goal });
      } else if (!config) {
        config = await base44.entities.AgentConfig.create({
          org_id: getCurrentOrgId(),
          goal: goal || 'Book qualified meetings with our ideal customers',
        });
      }
      finishStep(1, `Working toward: ${config.goal}`);

      const [leads, memories] = await Promise.all([
        base44.entities.Lead.filter(orgScope(), '-created_date', 200),
        base44.entities.MemoryEntry.filter(orgScope(), '-created_date', 200),
      ]);
      const found = await findNewLeads({ config, leads, memories, profile: { ...payload }, count: 3 });
      finishStep(2, found.length ? `Added ${found.length} lead${found.length > 1 ? 's' : ''} to your pipeline.` : 'No new leads found this time — you can prospect again from the pipeline.');
      setSetupDone(true);
      toast({ title: 'Agent briefed', description: 'It will use your profile when prospecting and writing outreach.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">Onboarding</h1>
        <p className="text-sm text-stone-400 mt-1">The agent builds your go-to-market profile from your own material, then asks you about whatever it couldn't determine.</p>
      </header>

      {step === 'setup' ? (
        <SetupTimeline steps={steps} activeIndex={activeIndex} done={setupDone} onContinue={() => navigate('/')} />
      ) : step === 'source' ? (
        <SourceStep onExtract={handleExtract} busy={busy} />
      ) : (
        <ReviewStep
          values={values}
          summary={meta.summary}
          notes={meta.notes}
          missingKeys={meta.missingKeys}
          onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))}
          onBack={() => setStep('source')}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}