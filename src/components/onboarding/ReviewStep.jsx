import { Button } from '@/components/ui/button';
import { Check, ArrowLeft } from 'lucide-react';
import { PROFILE_FIELDS } from './fields';
import ExtractedField from './ExtractedField';

export default function ReviewStep({ values, summary, notes, missingKeys, onChange, onBack, onSave, saving }) {
  const missing = PROFILE_FIELDS.filter((f) => missingKeys.includes(f.key));
  const found = PROFILE_FIELDS.filter((f) => !missingKeys.includes(f.key));

  return (
    <div className="space-y-5">
      {summary && (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6">
          <div className="text-xs uppercase tracking-wide text-stone-400 mb-2">What the agent understood</div>
          <p className="text-sm text-stone-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {missing.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 space-y-5">
          <div>
            <h2 className="font-heading text-lg font-semibold text-stone-900">Your answers</h2>
            <p className="text-sm text-stone-500 mt-1">What you told the agent just now — hit edit on anything you want to change.</p>
          </div>
          {missing.map((f) => (
            <ExtractedField key={f.key} field={f} value={values[f.key]} onChange={onChange} />
          ))}
        </div>
      )}

      {found.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 space-y-5">
          <div>
            <h2 className="font-heading text-lg font-semibold text-stone-900">Extracted from your material</h2>
            <p className="text-sm text-stone-500 mt-1">The agent will treat this as fact — hit edit on anything that isn't right.</p>
          </div>
          {found.map((f) => (
            <ExtractedField key={f.key} field={f} value={values[f.key]} onChange={onChange} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onBack} className="rounded-full border-stone-300">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Start over
        </Button>
        <Button onClick={onSave} disabled={saving || !values.company_name?.trim()} className="bg-[#101418] hover:bg-stone-700 rounded-full">
          <Check className="w-4 h-4 mr-1.5" />
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </div>
  );
}