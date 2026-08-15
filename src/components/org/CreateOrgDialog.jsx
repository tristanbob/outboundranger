import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateOrgDialog({ open, onOpenChange, onCreate }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const create = async () => {
    setSaving(true);
    try {
      await onCreate(name.trim());
      setName('');
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-heading">New business</DialogTitle></DialogHeader>
        <div className="space-y-1.5">
          <Label>Business name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." autoFocus />
        </div>
        <p className="text-xs text-stone-400">It gets its own pipeline, agent, memory and company profile — fully separate from your other businesses.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!name.trim() || saving} onClick={create} className="bg-[#101418] hover:bg-stone-700">
            {saving ? 'Creating…' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}