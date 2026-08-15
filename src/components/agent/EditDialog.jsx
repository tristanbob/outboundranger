import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function EditDialog({ action, open, onOpenChange, onSave }) {
  const [subject, setSubject] = useState(action.subject || '');
  const [message, setMessage] = useState(action.message || '');
  const [reason, setReason] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit before sending</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {action.subject !== undefined && (
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7} />
          </div>
          <div className="space-y-1.5">
            <Label>Why did you change it? <span className="text-stone-400 font-normal">(the agent learns from this)</span></Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="e.g. Too formal — our tone is casual and direct" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!message.trim() || !reason.trim()}
            onClick={() => onSave({ subject, message, reason })}
            className="bg-[#101418] hover:bg-stone-700"
          >
            Save & send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}