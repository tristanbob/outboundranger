import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Local datetime string for <input type="datetime-local">
const toLocalInput = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function ScheduledEditDialog({ action, open, onOpenChange, onSaved }) {
  const [subject, setSubject] = useState(action.subject || '');
  const [message, setMessage] = useState(action.message || '');
  const [sendAt, setSendAt] = useState(toLocalInput(action.scheduled_for));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const patch = {
      subject,
      message,
      scheduled_for: new Date(sendAt).toISOString(),
      was_edited: true,
      original_message: action.original_message || action.message,
    };
    await base44.entities.AgentAction.update(action.id, patch);
    setSaving(false);
    onOpenChange(false);
    onSaved?.(patch);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit scheduled message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Send at</Label>
            <Input type="datetime-local" value={sendAt} onChange={(e) => setSendAt(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea rows={8} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || !message.trim() || !sendAt}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}