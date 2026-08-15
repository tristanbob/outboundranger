import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Loader2, Zap, Eye } from 'lucide-react';

export default function AgentStatusBar({ config, running, onRun, onTogglePause }) {
  if (!config) return null;
  const autopilot = config.mode === 'autopilot';
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm px-5 py-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2.5">
        <span className={`w-2.5 h-2.5 rounded-full ${config.paused ? 'bg-stone-300' : 'bg-emerald-500 animate-pulse'}`} />
        <span className="text-sm font-medium text-stone-800">{config.paused ? 'Paused' : 'Active'}</span>
      </div>
      <Badge variant="outline" className={autopilot ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-indigo-200 bg-indigo-50 text-indigo-700'}>
        {autopilot ? <Zap className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
        {autopilot ? 'Autopilot' : 'Propose mode'}
      </Badge>
      <span className="text-xs text-stone-400 hidden sm:block truncate max-w-xs">Goal: {config.goal}</span>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onTogglePause} className="rounded-full">
          {config.paused ? <Play className="w-3.5 h-3.5 mr-1.5" /> : <Pause className="w-3.5 h-3.5 mr-1.5" />}
          {config.paused ? 'Resume' : 'Pause'}
        </Button>
        <Button size="sm" onClick={onRun} disabled={running || config.paused} className="rounded-full bg-[#101418] hover:bg-stone-700">
          {running ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
          {running ? 'Thinking…' : 'Run agent cycle'}
        </Button>
      </div>
    </div>
  );
}