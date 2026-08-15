import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { orgScope } from '@/lib/org';
import ThreadList from '@/components/inbox/ThreadList';
import ThreadView from '@/components/inbox/ThreadView';
import { deliverAndRespond } from '@/components/customer/customerAgent';

export default function Inbox() {
  const [leads, setLeads] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [replying, setReplying] = useState(false);

  const load = useCallback(async () => {
    const [ls, ms] = await Promise.all([
      base44.entities.Lead.filter(orgScope(), '-signal_strength', 200),
      base44.entities.Message.filter(orgScope(), 'created_date', 500),
    ]);
    setLeads(ls);
    setMessages(ms);
    return { ls, ms };
  }, []);

  useEffect(() => {
    load().then(({ ls, ms }) => {
      if (ms.length) setSelectedId(ms[ms.length - 1].lead_id);
      else if (ls.length) setSelectedId(ls[0].id);
    });
  }, [load]);

  const selected = leads?.find((l) => l.id === selectedId);
  const thread = messages.filter((m) => m.lead_id === selectedId);

  const send = async (body) => {
    if (!selected || replying) return;
    setReplying(true);
    setMessages((prev) => [...prev, { id: `tmp-${Date.now()}`, lead_id: selected.id, sender: 'user', body }]);
    try {
      await deliverAndRespond({ lead: selected, sender: 'user', channel: 'email', body });
    } finally {
      await load();
      setReplying(false);
    }
  };

  if (!leads) {
    return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">Inbox</h1>
        <p className="text-sm text-stone-400 mt-1">Conversations with your leads. Each lead is a simulated customer who responds in character to you and to the GTM agent.</p>
      </header>
      <div className="grid md:grid-cols-[16rem_1fr] gap-4 items-start">
        <ThreadList leads={leads} messages={messages} selectedId={selectedId} onSelect={setSelectedId} />
        {selected ? (
          <ThreadView lead={selected} messages={thread} onSend={send} replying={replying} />
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 py-12 text-center text-sm text-stone-400">
            Select a lead to start a conversation.
          </div>
        )}
      </div>
    </div>
  );
}