import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { orgScope } from '@/lib/org';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const CHANNELS = ['email', 'linkedin'];

export default function AgentSettingsForm() {
  const { toast } = useToast();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.AgentConfig.filter(orgScope()).then((cfgs) => setConfig(cfgs[0] || null));
  }, []);

  if (!config) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>;
  }

  const set = (k, v) => setConfig((c) => ({ ...c, [k]: v }));

  const save = async () => {
    setSaving(true);
    await base44.entities.AgentConfig.update(config.id, {
      goal: config.goal,
      daily_action_limit: Number(config.daily_action_limit) || 10,
      allowed_channels: config.allowed_channels || [],
    });
    setSaving(false);
    toast({ title: 'Settings saved', description: 'The agent will follow these guardrails on its next cycle.' });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 space-y-6">
      <div className="space-y-1.5">
        <Label>GTM goal</Label>
        <Textarea rows={2} value={config.goal || ''} onChange={(e) => set('goal', e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label>Daily action limit</Label>
          <Input type="number" min="1" max="100" value={config.daily_action_limit ?? 10} onChange={(e) => set('daily_action_limit', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Allowed channels</Label>
          <div className="flex gap-4 pt-1.5">
            {CHANNELS.map((ch) => (
              <label key={ch} className="flex items-center gap-2 text-sm capitalize text-stone-700">
                <Checkbox
                  checked={(config.allowed_channels || []).includes(ch)}
                  onCheckedChange={(v) => set('allowed_channels', v
                    ? [...(config.allowed_channels || []), ch]
                    : (config.allowed_channels || []).filter((c) => c !== ch))}
                />
                {ch}
              </label>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="bg-[#101418] hover:bg-stone-700 rounded-full">
        {saving ? 'Saving…' : 'Save settings'}
      </Button>
    </div>
  );
}