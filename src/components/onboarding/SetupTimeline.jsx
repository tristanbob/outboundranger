import { Check, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Row({ step, state, isLast }) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
            state === 'done'
              ? 'bg-stone-900 border-stone-900 text-white'
              : state === 'running'
              ? 'bg-white border-stone-900 text-stone-900'
              : 'bg-white border-stone-200 text-stone-300'
          }`}
        >
          {state === 'done' ? (
            <Check className="w-3.5 h-3.5" />
          ) : state === 'running' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
          )}
        </div>
        {!isLast && <div className={`w-px flex-1 my-1 ${state === 'done' ? 'bg-stone-900' : 'bg-stone-200'}`} />}
      </div>
      <div className="pb-6 min-w-0">
        <div className={`text-sm font-medium ${state === 'pending' ? 'text-stone-400' : 'text-stone-900'}`}>
          {step.label}
        </div>
        <p className="text-xs text-stone-500 mt-0.5">
          {state === 'done' && step.result ? step.result : step.description}
        </p>
      </div>
    </li>
  );
}

export default function SetupTimeline({ steps, activeIndex, done, onContinue }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6">
      <h2 className="font-heading text-base font-semibold text-stone-900">Setting up your agent</h2>
      <p className="text-sm text-stone-500 mt-1 mb-6">Follow along as the agent gets itself ready.</p>
      <ol>
        {steps.map((s, i) => (
          <Row
            key={s.key}
            step={s}
            isLast={i === steps.length - 1}
            state={i < activeIndex ? 'done' : i === activeIndex ? (done ? 'done' : 'running') : 'pending'}
          />
        ))}
      </ol>
      {onContinue && (
        <Button disabled={!done} onClick={onContinue} className="bg-[#101418] hover:bg-stone-700 rounded-full">
          Go to pipeline <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      )}
    </div>
  );
}