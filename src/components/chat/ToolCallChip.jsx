import { useState } from 'react';
import { Loader2, Check, X, ChevronDown } from 'lucide-react';

const FRIENDLY = {
  runAgentCycle: 'Working the pipeline',
};

function parse(v) {
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return v; }
}

export default function ToolCallChip({ toolCall }) {
  const [open, setOpen] = useState(false);
  const status = toolCall.status;
  const results = parse(toolCall.results);
  const failed = ['failed', 'error'].includes(status) || (results && results.success === false);
  const running = ['pending', 'running', 'in_progress'].includes(status);

  const p = toolCall.display_projection;
  const hidden = p?.hide_details && p?.details_redacted;
  const label = hidden
    ? (running ? p.active_label : failed ? p.error_label : p.label)
    : (FRIENDLY[toolCall.name] || `Checking ${toolCall.name.replace(/^(read|filter|list|create|update)/i, '').replace(/([A-Z])/g, ' $1').trim().toLowerCase() || 'my records'}`);

  return (
    <div className="mt-1.5 text-xs">
      <button onClick={() => !hidden && setOpen(!open)} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-stone-100 text-stone-500">
        {running ? <Loader2 className="w-3 h-3 animate-spin" /> : failed ? <X className="w-3 h-3 text-red-500" /> : <Check className="w-3 h-3 text-emerald-600" />}
        {label}
        {!hidden && <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && !hidden && (
        <pre className="mt-1 p-2 rounded-md bg-stone-50 border border-stone-200 text-[10px] text-stone-500 overflow-x-auto max-h-40 whitespace-pre-wrap">
          {JSON.stringify({ input: parse(toolCall.arguments_string), result: results }, null, 2)}
        </pre>
      )}
    </div>
  );
}