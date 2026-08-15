import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { orgScope } from '@/lib/org';
import { Switch } from '@/components/ui/switch';

// Autopilot switch for the sidebar.
export default function AutopilotToggle() {
  const [config, setConfig] = useState(null);

  const load = useCallback(async () => {
    const cfgs = await base44.entities.AgentConfig.filter(orgScope());
    setConfig(cfgs[0] || null);
  }, []);

  useEffect(() => {
    load();
    return base44.entities.AgentConfig.subscribe(() => load());
  }, [load]);

  if (!config) return null;

  const autopilot = config.mode === 'autopilot';

  const toggle = async (on) => {
    await base44.entities.AgentConfig.update(config.id, { mode: on ? 'autopilot' : 'propose', paused: false });
    await load();
  };

  return (
    <label className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2.5 cursor-pointer">
      <span className="flex items-center gap-2 min-w-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${autopilot ? 'bg-emerald-500 animate-pulse' : 'bg-white/30'}`} />
        <span className="text-sm text-white/80 truncate">Autopilot</span>
      </span>
      <Switch checked={autopilot} onCheckedChange={toggle} />
    </label>
  );
}