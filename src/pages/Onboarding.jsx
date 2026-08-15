import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import SourceStep from '@/components/onboarding/SourceStep';
import ReviewStep from '@/components/onboarding/ReviewStep';
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

  useEffect(() => {
    base44.entities.CompanyProfile.list('-created_date', 1).then((rows) => {
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        website: meta.source.website || values.website || '',
        source_text: meta.source.pastedInfo || '',
        completed: true,
      };
      if (existing) await base44.entities.CompanyProfile.update(existing.id, payload);
      else setExisting(await base44.entities.CompanyProfile.create(payload));

      if (values.goal?.trim()) {
        const cfgs = await base44.entities.AgentConfig.list();
        if (cfgs[0]) await base44.entities.AgentConfig.update(cfgs[0].id, { goal: values.goal.trim() });
      }
      toast({ title: 'Agent briefed', description: 'It will use your profile when prospecting and writing outreach.' });
      navigate('/');
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

      {step === 'source' ? (
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