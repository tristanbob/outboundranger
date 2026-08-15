import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

// The agent moves cards from the backend, so the board listens for changes
// instead of waiting for the user to refresh.
export function useLiveBoard(reload) {
  const timer = useRef(null);

  useEffect(() => {
    // Several records often change in one agent step — coalesce into one reload.
    const schedule = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(reload, 300);
    };
    const unsubscribers = [
      base44.entities.Lead.subscribe(schedule),
      base44.entities.AgentAction.subscribe(schedule),
      base44.entities.Message.subscribe(schedule),
    ];
    return () => {
      clearTimeout(timer.current);
      unsubscribers.forEach((u) => u());
    };
  }, [reload]);
}