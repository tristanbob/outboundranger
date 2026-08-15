import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Loader2 } from 'lucide-react';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const submit = () => {
    const t = text.trim();
    if (!t || disabled) return;
    setText('');
    onSend(t);
  };

  return (
    <div className="flex items-end gap-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
        placeholder="Ask your agent anything — or give it a new rule…"
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm px-2 py-2 outline-none placeholder:text-stone-400 max-h-32"
      />
      <Button size="icon" onClick={submit} disabled={disabled || !text.trim()} className="rounded-xl shrink-0">
        {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizonal className="w-4 h-4" />}
      </Button>
    </div>
  );
}