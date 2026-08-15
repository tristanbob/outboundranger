import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/components/org/OrgContext';

export default function ApprovalsBadge() {
  const { currentOrg } = useOrg();
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    const [actions, requests] = await Promise.all([
      base44.entities.AgentAction.filter({ org_id: currentOrg.id, status: 'proposed' }, '-created_date', 200),
      base44.entities.ApprovalRequest.filter({ org_id: currentOrg.id, status: 'pending' }, '-created_date', 200),
    ]);
    setCount(actions.length + requests.length);
  }, [currentOrg.id]);

  useEffect(() => {
    load();
    const unsubA = base44.entities.AgentAction.subscribe(load);
    const unsubR = base44.entities.ApprovalRequest.subscribe(load);
    return () => { unsubA(); unsubR(); };
  }, [load]);

  if (!count) return null;

  return (
    <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-white/15 text-white text-[11px] font-medium flex items-center justify-center">
      {count}
    </span>
  );
}