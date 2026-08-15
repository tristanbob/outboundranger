import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function RejectDialog({ open, onOpenChange, onReject }) {
  const [reason, setReason] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Reject this action</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Why? <span className="text-stone-400 font-normal">(the agent learns from this)</span></Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. This lead is too early-stage for outreach — nurture instead"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" disabled={!reason.trim()} onClick={() => onReject(reason)}>
            Reject & teach agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}