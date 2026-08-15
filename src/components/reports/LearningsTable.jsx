export default function LearningsTable({ rows }) {
  return (
    <ul className="divide-y divide-stone-100">
      {rows.map((m) => (
        <li key={m.id} className="py-3 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-stone-800">{m.insight}</p>
            <p className="text-xs text-stone-400 mt-0.5">
              {m.scope || 'all leads'} · {m.category}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-heading font-bold text-stone-900">{m.rate}%</div>
            <div className="text-xs text-stone-400">{m.positive_count || 0}/{m.applied_count}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}