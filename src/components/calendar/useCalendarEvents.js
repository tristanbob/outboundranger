import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Two kinds of dated things the agent produces: queued sends and booked meetings.
export function useCalendarEvents(orgId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const actions = await base44.entities.AgentAction.filter({ org_id: orgId }, '-created_date', 300);
      const out = [];
      actions.forEach((a) => {
        if (a.status === 'scheduled' && a.scheduled_for) {
          out.push({
            id: `s-${a.id}`,
            kind: 'scheduled',
            date: a.scheduled_for,
            title: a.lead_name || 'Lead',
            detail: `${(a.action_type || '').replace(/_/g, ' ')} via ${a.channel || 'email'}`,
            note: a.timing_reason,
          });
        }
        if (a.outcome === 'meeting_booked') {
          out.push({
            id: `m-${a.id}`,
            kind: 'meeting',
            date: a.executed_at || a.updated_date,
            title: a.lead_name || 'Lead',
            detail: 'Meeting booked',
            note: a.outcome_details,
          });
        }
      });
      if (alive) {
        setEvents(out.filter((e) => e.date).sort((a, b) => new Date(a.date) - new Date(b.date)));
        setLoading(false);
      }
    };
    load();
    const unsub = base44.entities.AgentAction.subscribe(() => load());
    return () => { alive = false; unsub(); };
  }, [orgId]);

  return { events, loading };
}