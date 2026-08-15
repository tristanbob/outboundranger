import { ArrowUpRight } from 'lucide-react';

export default function SuggestedActions({ suggestions, disabled, onPick }) {
  if (!suggestions.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onPick(s)}
          className="flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-stone-500 hover:text-stone-900 disabled:opacity-50 transition-colors"
        >
          {s} <ArrowUpRight className="w-3 h-3 text-stone-400" />
        </button>
      ))}
    </div>
  );
}