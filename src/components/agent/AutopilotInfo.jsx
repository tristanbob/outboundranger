import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Explains what turning autopilot on actually changes.
export default function AutopilotInfo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label="What does autopilot do?"
          className="text-white/40 hover:text-white transition-colors shrink-0"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-72 text-sm space-y-2">
        <p className="font-heading font-semibold text-stone-900">Autopilot</p>
        <p className="text-stone-600 leading-relaxed">
          On: the agent sends its own outreach and follow-ups at the times it picked, without waiting for you.
        </p>
        <p className="text-stone-600 leading-relaxed">
          Off: everything it drafts waits in Approvals until you approve, edit or reject it.
        </p>
      </PopoverContent>
    </Popover>
  );
}