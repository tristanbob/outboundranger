import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { orgScope } from '@/lib/org';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Play, Loader2 } from 'lucide-react';
import { useAgentLoop } from '@/components/agent/useAgentLoop';

// One agent status strip for the whole app.
export default function GlobalAgentBar() {
  const { toast } = useToast();
  const [config, setConfig] = useState(null);

  const load = useCallback(async () => {
    const cfgs = await base44.entities.AgentConfig.filter(orgScope());
    setConfig(cfgs[0] || null);
  }, []);

  useEffect(() => {
    load();
    return base44.entities.AgentConfig.subscribe(() => load());
  }, [load]);

  const { running, runCycle } = useAgentLoop(load);

  if (!config) return null;

  const handleRun = async () => {
    const res = await runCycle();
    toast({ title: res.ok ? 'Agent cycle complete' : 'Agent stopped', description: res.message });
  };

  const autopilot = config.mode === 'autopilot';

  const toggleAutopilot = async (on) => {
    await base44.entities.AgentConfig.update(config.id, { mode: on ? 'autopilot' : 'propose', paused: false });
    await load();
  };

  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className={`w-2 h-2 rounded-full shrink-0 ${autopilot ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
      <span className="text-sm font-medium text-stone-800 shrink-0">{autopilot ? 'Autopilot' : 'Propose mode'}</span>
      <span className="text-xs text-stone-400 truncate hidden lg:block">{config.goal}</span>
      <div className="ml-auto flex items-center gap-3 shrink-0">
        <label className="flex items-center gap-2 text-xs text-stone-500">
          <Switch checked={autopilot} onCheckedChange={toggleAutopilot} />
          <span className="hidden sm:inline">Autopilot</span>
        </label>
        <Button size="sm" onClick={handleRun} disabled={running} className="rounded-full bg-[#101418] hover:bg-stone-700">
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{running ? 'Thinking…' : 'Run cycle'}</span>
        </Button>
      </div>
    </div>
  );
}