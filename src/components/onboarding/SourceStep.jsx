import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';

export default function SourceStep({ onExtract, busy }) {
  const [website, setWebsite] = useState('');
  const [pastedInfo, setPastedInfo] = useState('');
  const canGo = website.trim() || pastedInfo.trim();

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 space-y-6">
      <div>
        <h2 className="font-heading text-lg font-semibold text-stone-900">Tell the agent about your company</h2>
        <p className="text-sm text-stone-500 mt-1">Give it your website, paste a deck, a one-pager or some notes — or both. It will fill in what it can and ask you about the rest.</p>
      </div>

      <div className="space-y-1.5">
        <Label>Website</Label>
        <Input placeholder="https://yourcompany.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>Or paste info about your company</Label>
        <Textarea
          rows={8}
          placeholder="What you sell, who buys it, why they buy, notable customers, how you like to sound…"
          value={pastedInfo}
          onChange={(e) => setPastedInfo(e.target.value)}
        />
      </div>

      <Button
        onClick={() => onExtract({ website: website.trim(), pastedInfo: pastedInfo.trim() })}
        disabled={!canGo || busy}
        className="bg-[#101418] hover:bg-stone-700 rounded-full"
      >
        {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1.5" />}
        {busy ? 'Reading and extracting…' : 'Extract my profile'}
      </Button>
    </div>
  );
}