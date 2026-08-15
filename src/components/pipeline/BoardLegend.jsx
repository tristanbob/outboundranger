import { CARD_STATES } from './cardState';

const ORDER = ['needs_you', 'awaiting_customer', 'agent_working', 'closed'];

export default function BoardLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {ORDER.map((key) => {
        const s = CARD_STATES[key];
        return (
          <div key={key} className="flex items-center gap-2" title={s.hint}>
            <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
            <span className="text-xs font-medium text-stone-600">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}