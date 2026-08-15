import { useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import ProfileField from './ProfileField';

// Extracted answers read as plain text until the user chooses to edit them.
export default function ExtractedField({ field, value, onChange }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="space-y-2">
        <ProfileField field={field} value={value} onChange={onChange} />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900"
        >
          <Check className="w-3.5 h-3.5" /> Done
        </button>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <div className="text-xs uppercase tracking-wide text-stone-400">{field.label}</div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-900"
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
      </div>
      <p className="text-sm text-stone-700 mt-1 whitespace-pre-wrap">
        {value || <span className="text-stone-400">Not set</span>}
      </p>
    </div>
  );
}