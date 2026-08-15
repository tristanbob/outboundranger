import { STAGES } from '@/components/pipeline/stages';

export default function FunnelBars({ leads }) {
  const rows = STAGES.map((s) => ({ ...s, count: leads.filter((l) => l.status === s.id).length }));
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id}>
          <div className="flex items-baseline justify-between text-xs mb-1">
            <span className="text-stone-600 font-medium">{r.label}</span>
            <span className="text-stone-400">{r.count}</span>
          </div>
          <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
            <div className={`h-full rounded-full ${r.accent}`} style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}