import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const CHANNELS = ['email', 'linkedin'];

export default function Settings() {
  const { toast } = useToast();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.AgentConfig.list().then((cfgs) => setConfig(cfgs[0] || null));
  }, []);

  if (!config) {
    return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>;
  }

  const set = (k, v) => setConfig((c) => ({ ...c, [k]: v }));

  const save = async () => {
    setSaving(true);
    await base44.entities.AgentConfig.update(config.id, {
      goal: config.goal,
      mode: config.mode,
      paused: config.paused,
      daily_action_limit: Number(config.daily_action_limit) || 10,
      allowed_channels: config.allowed_channels || [],
    });
    setSaving(false);
    toast({ title: 'Settings saved', description: 'The agent will follow these guardrails on its next cycle.' });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">Agent settings</h1>
        <p className="text-sm text-stone-400 mt-1">Scope, autonomy, and guardrails. High-risk actions always require your approval — even on autopilot.</p>
      </header>

      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 space-y-6">
        <div className="space-y-1.5">
          <Label>GTM goal</Label>
          <Textarea rows={2} value={config.goal || ''} onChange={(e) => set('goal', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Autonomy mode</Label>
          <RadioGroup value={config.mode} onValueChange={(v) => set('mode', v)} className="space-y-2">
            <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer ${config.mode === 'propose' ? 'border-indigo-300 bg-indigo-50/50' : 'border-stone-200'}`}>
              <RadioGroupItem value="propose" className="mt-0.5" />
              <div>
                <div className="text-sm font-medium text-stone-900">Propose</div>
                <div className="text-xs text-stone-500 mt-0.5">Every action waits for your approval. You see the target, reasoning, and expected effect before anything is sent.</div>
              </div>
            </label>
            <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer ${config.mode === 'autopilot' ? 'border-amber-300 bg-amber-50/50' : 'border-stone-200'}`}>
              <RadioGroupItem value="autopilot" className="mt-0.5" />
              <div>
                <div className="text-sm font-medium text-stone-900">Autopilot</div>
                <div className="text-xs text-stone-500 mt-0.5">Low-risk actions on allowed channels execute automatically within the daily limit. Sensitive or high-risk actions still come to you.</div>
              </div>
            </label>
          </RadioGroup>
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

        <div className="flex items-center justify-between rounded-xl border border-stone-200 p-4">
          <div>
            <div className="text-sm font-medium text-stone-900">Pause agent</div>
            <div className="text-xs text-stone-500 mt-0.5">Stops all cycles and executions immediately.</div>
          </div>
          <Switch checked={!!config.paused} onCheckedChange={(v) => set('paused', v)} />
        </div>

        <Button onClick={save} disabled={saving} className="bg-[#101418] hover:bg-stone-700 rounded-full">
          {saving ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </div>
  );
}