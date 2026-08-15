import MemoryCard from './MemoryCard';

const CATEGORIES = ['targeting', 'messaging', 'channel', 'timing', 'strategy'];

// Entries grouped by what they govern, so the list reads as a structured rulebook.
export default function MemoryGroupedList({ entries, onToggle, onDelete }) {
  const groups = CATEGORIES
    .map((c) => ({ category: c, items: entries.filter((e) => (e.category || 'strategy') === c) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {groups.map(({ category, items }) => (
        <div key={category} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">{category}</span>
            <span className="text-xs text-stone-400">{items.length}</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>
          {items.map((e) => (
            <MemoryCard key={e.id} entry={e} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      ))}
    </div>
  );
}