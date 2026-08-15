import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { getCurrentOrgId } from '@/lib/org';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Sends a queued action immediately: delivers it, lets the customer react,
// then queues that customer's next step.
export default function SendNowButton({ action, onSent }) {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  async function send() {
    setSending(true);
    try {
      const res = await base44.functions.invoke('sendActionNow', {
        org_id: getCurrentOrgId(),
        action_id: action.id,
      });
      const data = res.data || {};
      toast({
        title: data.error ? 'Could not send' : 'Sent',
        description: data.error || (data.outcome_details || `Outcome: ${(data.outcome || '').replace(/_/g, ' ')}`),
      });
      if (onSent) await onSent();
    } finally {
      setSending(false);
    }
  }

  return (
    <Button size="sm" onClick={send} disabled={sending}>
      {sending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
      {sending ? 'Sending…' : 'Send now'}
    </Button>
  );
}