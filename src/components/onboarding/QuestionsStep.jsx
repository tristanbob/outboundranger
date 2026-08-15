import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import ProfileField from './ProfileField';

// Asks the agent's open questions one at a time — the user only sees the full
// profile once they've answered everything.
export default function QuestionsStep({ fields, values, notes, onChange, onBack, onDone }) {
  const [index, setIndex] = useState(0);
  const field = fields[index];
  const isLast = index === fields.length - 1;

  const back = () => (index === 0 ? onBack() : setIndex(index - 1));
  const next = () => (isLast ? onDone() : setIndex(index + 1));

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>Question {index + 1} of {fields.length}</span>
          <span>{fields.length - index - 1} left</span>
        </div>
        <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
          <div className="h-full bg-stone-800 transition-all" style={{ width: `${((index + 1) / fields.length) * 100}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 space-y-5">
        {index === 0 && notes && <p className="text-sm text-stone-500">{notes}</p>}
        <ProfileField key={field.key} field={field} value={values[field.key]} onChange={onChange} asQuestion />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={back} className="rounded-full border-stone-300">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Button>
        <Button onClick={next} className="bg-[#101418] hover:bg-stone-700 rounded-full">
          {isLast ? <><Check className="w-4 h-4 mr-1.5" /> Review profile</> : <>Next <ArrowRight className="w-4 h-4 ml-1.5" /></>}
        </Button>
      </div>
    </div>
  );
}