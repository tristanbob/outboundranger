import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { getCurrentOrgId } from '@/lib/org';

// The agent brain lives on the backend: once a call is made, the send, the
// customer reaction and the learning pass finish even if the app is closed.
async function call(name, payload) {
  const res = await base44.functions.invoke(name, { org_id: getCurrentOrgId(), ...payload });
  return res.data || {};
}

export function useAgentLoop(reload) {
  const [running, setRunning] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function runCycle() {
    setRunning(true);
    try {
      return await call('runAgentCycle', {});
    } finally {
      setRunning(false);
      await reload();
    }
  }

  async function approve(action, edits) {
    setBusyId(action.id);
    try {
      await call('decideAction', { action_id: action.id, decision: 'approve', edits: edits || null });
    } finally {
      setBusyId(null);
      await reload();
    }
  }

  async function reject(action, reason) {
    setBusyId(action.id);
    try {
      await call('decideAction', { action_id: action.id, decision: 'reject', reason });
    } finally {
      setBusyId(null);
      await reload();
    }
  }

  async function generateResponse(action) {
    setBusyId(action.id);
    try {
      await call('generateCustomerReply', { action_id: action.id });
    } finally {
      setBusyId(null);
      await reload();
    }
  }

  return { running, busyId, runCycle, approve, reject, generateResponse };
}