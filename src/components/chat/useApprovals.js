import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { orgScope } from '@/lib/org';

// Approval requests the agent queued for this org, newest last.
export function useApprovals() {
  const [requests, setRequests] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const rows = await base44.entities.ApprovalRequest.filter(orgScope(), '-created_date', 20);
    setRequests(rows.reverse());
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = base44.entities.ApprovalRequest.subscribe(() => load());
    return unsubscribe;
  }, [load]);

  const resolve = async (request, approve) => {
    setBusyId(request.id);
    try {
      await base44.functions.invoke('resolveApproval', { request_id: request.id, approve });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return { requests, busyId, resolve };
}