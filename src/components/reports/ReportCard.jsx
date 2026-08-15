export default function ReportCard({ title, subtitle, empty, children }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-4 md:p-6">
      <div className="mb-4">
        <h2 className="font-heading text-sm font-semibold text-stone-900">{title}</h2>
        {subtitle && <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>}
      </div>
      {empty ? <p className="text-sm text-stone-400 py-6 text-center">{empty}</p> : children}
    </div>
  );
}