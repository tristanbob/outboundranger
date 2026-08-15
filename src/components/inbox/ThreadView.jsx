import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function ThreadView({ lead, messages, onSend, replying }) {
  const [body, setBody] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, replying]);

  const send = () => {
    if (!body.trim()) return;
    onSend(body.trim());
    setBody('');
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 flex flex-col h-[calc(100vh-14rem)] min-h-[24rem]">
      <div className="px-5 py-4 border-b border-stone-100">
        <div className="text-sm font-medium text-stone-900">{lead.name}</div>
        <div className="text-xs text-stone-400">{lead.title} · {lead.company}</div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-stone-50/50">
        {messages.length === 0 && (
          <p className="text-sm text-stone-400 text-center py-8">No conversation yet — send a message and {lead.name} will respond in character.</p>
        )}
        {messages.map((m) => <MessageBubble key={m.id} message={m} leadName={lead.name} />)}
        {replying && (
          <div className="flex items-center gap-2 text-xs text-stone-400 px-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> {lead.name} is thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-stone-100 flex gap-2">
        <Textarea
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Message ${lead.name}…`}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <Button onClick={send} disabled={replying || !body.trim()} className="bg-[#101418] hover:bg-stone-700 self-end">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}