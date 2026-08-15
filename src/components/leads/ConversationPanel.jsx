import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import MessageBubble from '@/components/inbox/MessageBubble';

export default function ConversationPanel({ lead, messages, onSend, replying }) {
  const [body, setBody] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length, replying]);

  const send = () => {
    if (!body.trim()) return;
    onSend(body.trim());
    setBody('');
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-3">
      {messages.length === 0 ? (
        <p className="text-sm text-stone-400">
          No messages yet — send a message and {lead.name} will respond in character.
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((m) => <MessageBubble key={m.id} message={m} leadName={lead.name} />)}
          {replying && (
            <div className="flex items-center gap-2 text-xs text-stone-400 px-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> {lead.name} is thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
      <div className="flex gap-2 pt-1">
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