export default function StatCards({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon: Icon, accent }) => (
        <div key={label} className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
            <Icon className="w-4.5 h-4.5 w-4 h-4" />
          </div>
          <div className="text-2xl font-heading font-bold text-stone-900">{value}</div>
          <div className="text-xs text-stone-400 mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}