import { useEffect, useRef, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getCurrentOrgId } from '@/lib/org';
import { useOrg } from '@/components/org/OrgContext';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import ApprovalCard from '@/components/chat/ApprovalCard';
import SuggestedActions from '@/components/chat/SuggestedActions';
import { parseSuggestions } from '@/components/chat/suggestions';
import { useApprovals } from '@/components/chat/useApprovals';
import ChatHistoryMenu from '@/components/chat/ChatHistoryMenu';
import { Button } from '@/components/ui/button';
import { Radar, RotateCcw } from 'lucide-react';

const AGENT_NAME = 'gtm_agent';

export default function AgentChat() {
  const { currentOrg } = useOrg();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const { requests, busyId, resolve } = useApprovals();

  const loadHistory = useCallback(async () => {
    const convs = await base44.agents.listConversations({ agent_name: AGENT_NAME });
    const mine = convs
      .filter((c) => c.metadata?.description === getCurrentOrgId())
      .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
    setHistory(mine);
    return mine;
  }, []);

  const startConversation = useCallback(async () => {
    const conv = await base44.agents.createConversation({
      agent_name: AGENT_NAME,
      metadata: { name: `Chat — ${currentOrg.name}`, description: getCurrentOrgId() },
    });
    setConversation(conv);
    setMessages(conv.messages || []);
    await loadHistory();
    return conv;
  }, [currentOrg.name, loadHistory]);

  const openConversation = useCallback(async (conv) => {
    const full = await base44.agents.getConversation(conv.id);
    setConversation(full);
    setMessages(full.messages || []);
  }, []);

  const deleteConversation = useCallback(async (conv) => {
    await base44.agents.deleteConversation(conv.id);
    const mine = await loadHistory();
    if (conv.id === conversation?.id) {
      if (mine.length > 0) await openConversation(mine[0]);
      else await startConversation();
    }
  }, [conversation?.id, loadHistory, openConversation, startConversation]);

  useEffect(() => {
    (async () => {
      const mine = await loadHistory();
      if (mine.length > 0) {
        await openConversation(mine[0]);
      } else {
        await startConversation();
      }
    })();
  }, [loadHistory, openConversation, startConversation]);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, requests]);

  const lastMsg = messages[messages.length - 1];
  // Only the newest reply's suggestions stay clickable.
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const suggestions = lastAssistant ? parseSuggestions(lastAssistant.content || '').suggestions : [];
  const agentWorking = sending || (lastMsg && lastMsg.role !== 'assistant') ||
    (lastMsg?.tool_calls?.some((tc) => ['pending', 'running', 'in_progress'].includes(tc.status)));

  const handleSend = async (text) => {
    if (!conversation) return;
    setSending(true);
    try {
      const content = `[context org_id=${getCurrentOrgId()} company=${currentOrg.name}]\n${text}`;
      await base44.agents.addMessage(conversation, { role: 'user', content });
    } finally {
      setSending(false);
    }
  };

  if (!conversation) {
    return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] md:h-[calc(100vh-8rem)]">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-stone-900 tracking-tight">Talk to your agent</h1>
          <p className="text-sm text-stone-400 mt-1">Ask it why it did something, how the pipeline is going, or give it a new rule. Anything that changes how it works waits for your approval.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ChatHistoryMenu conversations={history} currentId={conversation?.id} onSelect={openConversation} onDelete={deleteConversation} />
          <Button variant="outline" size="sm" onClick={startConversation}>
            <RotateCcw className="w-3.5 h-3.5" /> New chat
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
        {messages.filter((m) => ['user', 'assistant'].includes(m.role)).length === 0 && (
          <div className="flex flex-col items-center text-center pt-16 px-6">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center mb-4">
              <Radar className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-stone-700">I'm the agent working your pipeline.</p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm">Try: "How is the pipeline going?" · "Why did you propose that message to Sarah?" · "Never mention pricing in a first touch." · "Go find your next move."</p>
          </div>
        )}
        {messages
          .filter((m) => ['user', 'assistant'].includes(m.role))
          .map((m, i) => <ChatBubble key={i} message={m} />)}
        {!agentWorking && (
          <SuggestedActions suggestions={suggestions} disabled={sending} onPick={handleSend} />
        )}
        {requests.map((r) => (
          <ApprovalCard key={r.id} request={r} busy={busyId === r.id} onResolve={resolve} />
        ))}
        {agentWorking && lastMsg?.role === 'user' && (
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse" /> Agent is thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  );
}