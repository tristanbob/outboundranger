import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { orgScope, getCurrentOrgId } from '@/lib/org';
import { useToast } from '@/components/ui/use-toast';
import SourceStep from '@/components/onboarding/SourceStep';
import ReviewStep from '@/components/onboarding/ReviewStep';
import QuestionsStep from '@/components/onboarding/QuestionsStep';
import SetupTimeline from '@/components/onboarding/SetupTimeline';
import { findNewLeads } from '@/components/agent/leadSourcing';
import { extractProfile } from '@/components/onboarding/profileExtraction';
import { PROFILE_FIELDS } from '@/components/onboarding/fields';
import { saveDraft, useDraftAutosave } from '@/components/onboarding/useProfileDraft';

export default function Onboarding({ embedded = false }) {
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
    // Show the tracker right away instead of leaving them on the form.
    setSteps([
      {
        key: 'read',
        label: source.website ? 'Reading your website' : 'Reading what you shared',
        description: 'Pulling out what you sell, who you sell to and how you sound.',
      },
    ]);
    setActiveIndex(0);
    setSetupDone(false);
    setStep('setup');
    try {
      const { values: v, summary, notes, profile } = await extractProfile(source);
      if (source.website && !v.website) v.website = source.website;
      setValues(v);
      if (profile) setExisting(profile);
      const missingKeys = PROFILE_FIELDS.filter((f) => !v[f.key]).map((f) => f.key);
      setMeta({ summary, notes, missingKeys, source });
      // Ask the open questions one at a time first — only then show the profile.
      setStep(missingKeys.length ? 'questions' : 'review');
    } catch (e) {
      setStep('source');
      throw e;
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

  // Keep saving answers as they're typed, so closing the app loses nothing.
  useDraftAutosave({
    enabled: (step === 'review' || step === 'questions') && !saving,
    existing,
    values,
    source: meta.source,
    onCreated: setExisting,
  });

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
      // Profile and goal don't depend on each other — save both at once.
      const goal = values.goal?.trim();
      const [profile, config] = await Promise.all([
        existing
          ? base44.entities.CompanyProfile.update(existing.id, payload)
          : base44.entities.CompanyProfile.create(payload),
        base44.entities.AgentConfig.filter(orgScope()).then((cfgs) => {
          const cfg = cfgs[0];
          if (cfg) return goal ? base44.entities.AgentConfig.update(cfg.id, { goal }) : cfg;
          return base44.entities.AgentConfig.create({
            org_id: getCurrentOrgId(),
            goal: goal || 'Book qualified meetings with our ideal customers',
          });
        }),
      ]);
      if (!existing) setExisting(profile);
      finishStep(0, `Profile saved for ${values.company_name || 'your company'}.`);
      finishStep(1, `Working toward: ${config.goal}`);

      const found = await findNewLeads({ count: 3 });
      finishStep(2, found.length ? `Added ${found.length} lead${found.length > 1 ? 's' : ''} to your pipeline.` : 'No new leads found this time — you can prospect again from the pipeline.');
      setSetupDone(true);
      toast({ title: 'Agent briefed', description: 'It will use your profile when prospecting and writing outreach.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {embedded ? (
        <p className="text-sm text-stone-400">Your go-to-market profile — what you sell, who you sell to, and how the agent should sound.</p>
      ) : (
        <header>
          <h1 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">Onboarding</h1>
          <p className="text-sm text-stone-400 mt-1">The agent builds your go-to-market profile from your own material, then asks you about whatever it couldn't determine.</p>
        </header>
      )}

      {step === 'setup' ? (
        <SetupTimeline steps={steps} activeIndex={activeIndex} done={setupDone} onContinue={busy ? null : () => navigate('/')} />
      ) : step === 'source' ? (
        <SourceStep onExtract={handleExtract} busy={busy} />
      ) : step === 'questions' ? (
        <QuestionsStep
          fields={PROFILE_FIELDS.filter((f) => meta.missingKeys.includes(f.key))}
          values={values}
          notes={meta.notes}
          onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))}
          onBack={() => setStep('source')}
          onDone={() => setStep('review')}
        />
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