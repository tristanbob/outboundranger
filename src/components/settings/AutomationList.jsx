import { Clock, Zap } from 'lucide-react';

// What runs on its own behind the scenes. Kept in sync with base44/workflows.
const AUTOMATIONS = [
  {
    name: 'Daily growth run',
    when: 'Every day at 7:00 AM (America/Denver)',
    what: 'Finds new leads, then reviews every lead without a next step and queues one.',
    scheduled: true,
  },
  {
    name: 'Send scheduled actions',
    when: 'Every hour, on the hour',
    what: 'Sends any approved action whose scheduled send time has arrived.',
    scheduled: true,
  },
  {
    name: 'Schedule next step after send',
    when: 'Right after a message is sent',
    what: "Queues that lead's next step as soon as the previous one completes.",
    scheduled: false,
  },
];

export default function AutomationList() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-400">
        These run on their own. Sending only happens when Autopilot is on or after you approve an action.
      </p>
      {AUTOMATIONS.map((a) => (
        <div key={a.name} className="bg-white rounded-xl border border-stone-200/80 px-5 py-4 flex items-start gap-3">
          {a.scheduled ? (
            <Clock className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
          ) : (
            <Zap className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
          )}
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-stone-900">{a.name}</p>
            <p className="text-xs text-stone-500">{a.when}</p>
            <p className="text-sm text-stone-600 leading-relaxed">{a.what}</p>
          </div>
        </div>
      ))}
    </div>
  );
}