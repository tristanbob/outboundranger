import { useState } from 'react';
import { useOrg } from '@/components/org/OrgContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';

export default function DeleteOrgCard() {
  const { currentOrg, deleteOrg } = useOrg();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    const name = currentOrg.name;
    await deleteOrg(currentOrg);
    setBusy(false);
    setOpen(false);
    toast({ title: `${name} deleted`, description: 'The business and everything in its pipeline are gone.' });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-stone-900">Delete this business</div>
          <div className="text-xs text-stone-500 mt-0.5">
            Permanently removes <span className="font-medium">{currentOrg.name}</span> with all its leads, conversations, actions and learnings.
          </div>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); setConfirm(''); }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete {currentOrg.name}?</DialogTitle>
              <DialogDescription>
                This can't be undone. Type the business name to confirm.
              </DialogDescription>
            </DialogHeader>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={currentOrg.name} />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={busy || confirm.trim() !== currentOrg.name}
                onClick={handleDelete}
              >
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {busy ? 'Deleting…' : 'Delete permanently'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}