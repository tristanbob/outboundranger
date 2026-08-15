export default function ChannelPerformance({ rows }) {
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-3">
          <div className="w-32 shrink-0 text-xs text-stone-600 font-medium truncate">{r.name}</div>
          <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
            <div className="h-full rounded-full bg-stone-800" style={{ width: `${r.rate}%` }} />
          </div>
          <div className="w-24 shrink-0 text-right text-xs text-stone-400">
            <span className="text-stone-900 font-semibold">{r.rate}%</span> of {r.sent}
          </div>
        </div>
      ))}
    </div>
  );
}