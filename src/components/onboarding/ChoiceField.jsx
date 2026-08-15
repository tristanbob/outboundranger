import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, Plus } from 'lucide-react';

// Renders a question as selectable chips, with a free-form option last.
// The answer is stored as a single comma-separated string.
export default function ChoiceField({ field, value, onChange, asQuestion }) {
  const parts = (value || '').split(',').map((p) => p.trim()).filter(Boolean);
  const picked = parts.filter((p) => field.options.includes(p));
  const custom = parts.filter((p) => !field.options.includes(p)).join(', ');
  const [showCustom, setShowCustom] = useState(!!custom);

  const commit = (nextPicked, nextCustom) =>
    onChange(field.key, [...nextPicked, ...(nextCustom ? [nextCustom] : [])].join(', '));

  const toggle = (opt) => {
    if (field.multi) {
      const next = picked.includes(opt) ? picked.filter((p) => p !== opt) : [...picked, opt];
      commit(next, custom);
    } else {
      commit(picked.includes(opt) ? [] : [opt], custom);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{asQuestion ? field.question : field.label}</Label>
      <div className="flex flex-wrap gap-2">
        {field.options.map((opt) => {
          const on = picked.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                on
                  ? 'border-stone-800 bg-stone-900 text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              {on && <Check className="w-3.5 h-3.5" />}
              {opt}
            </button>
          );
        })}
        {!showCustom && (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50"
          >
            <Plus className="w-3.5 h-3.5" /> Something else
          </button>
        )}
      </div>
      {showCustom && (
        <Textarea
          rows={2}
          value={custom}
          placeholder="Your own answer…"
          onChange={(e) => commit(picked, e.target.value)}
        />
      )}
      {field.multi && <p className="text-xs text-stone-400">Pick as many as apply.</p>}
    </div>
  );
}