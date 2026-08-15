import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { orgScope } from '@/lib/org';
import ActivityItem from '@/components/activity/ActivityItem';

export default function Activity() {
  const [actions, setActions] = useState(null);

  useEffect(() => {
    base44.entities.AgentAction.filter(orgScope(), '-created_date', 200).then(setActions);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">Activity trail</h1>
        <p className="text-sm text-stone-400 mt-1">Every action the agent has proposed or taken, with its reasoning, your feedback, and the outcome.</p>
      </header>
      {!actions ? (
        <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>
      ) : actions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 py-12 text-center text-sm text-stone-400">
          No activity yet — run an agent cycle from the Agent page.
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((a) => <ActivityItem key={a.id} action={a} />)}
        </div>
      )}
    </div>
  );
}