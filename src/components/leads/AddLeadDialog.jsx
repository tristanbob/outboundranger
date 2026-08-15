import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EMPTY = { name: '', company: '', title: '', segment: 'smb', signal: '', signal_strength: 50 };

export default function AddLeadDialog({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    await base44.entities.Lead.create({ ...form, signal_strength: Number(form.signal_strength), status: 'new' });
    setSaving(false);
    setForm(EMPTY);
    setOpen(false);
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full bg-[#101418] hover:bg-stone-700"><Plus className="w-4 h-4 mr-1.5" /> Add lead</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-heading">Add lead</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Company</Label><Input value={form.company} onChange={(e) => set('company', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => set('title', e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Segment</Label>
            <Select value={form.segment} onValueChange={(v) => set('segment', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="smb">SMB</SelectItem>
                <SelectItem value="mid_market">Mid-market</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5"><Label>Buying signal</Label><Textarea rows={2} value={form.signal} onChange={(e) => set('signal', e.target.value)} placeholder="e.g. Visited pricing page 5 times this week" /></div>
          <div className="col-span-2 space-y-1.5"><Label>Signal strength (0–100)</Label><Input type="number" min="0" max="100" value={form.signal_strength} onChange={(e) => set('signal_strength', e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!form.name || !form.company || saving} onClick={save} className="bg-[#101418] hover:bg-stone-700">{saving ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}