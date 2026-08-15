import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessagesSquare } from 'lucide-react';
import ProposalCard from '@/components/agent/ProposalCard';
import ActivityItem from '@/components/activity/ActivityItem';
import MessageBubble from '@/components/inbox/MessageBubble';
import { STAGES } from './stages';

export default function LeadDrawer({ lead, proposal, actions, messages, busyId, onApprove, onReject, onClose }) {
  const stage = STAGES.find((s) => s.id === (lead?.status || 'new'));
  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {lead && (
          <>
            <SheetHeader className="text-left">
              <SheetTitle className="font-heading">{lead.name}</SheetTitle>
              <p className="text-sm text-stone-500">{lead.title ? `${lead.title} · ` : ''}{lead.company}</p>
            </SheetHeader>

            <div className="mt-4 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize">{stage?.label}</Badge>
                <Badge variant="outline" className="capitalize">{lead.segment?.replace(/_/g, ' ')}</Badge>
                <span className="text-xs text-stone-400">Signal {Math.round(lead.signal_strength ?? 0)}/100</span>
              </div>

              {lead.signal && (
                <div className="bg-stone-50 rounded-xl p-3 text-sm text-stone-600">
                  <span className="font-medium text-stone-700">Why now: </span>{lead.signal}
                </div>
              )}

              {proposal && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Awaiting your decision</h3>
                  <ProposalCard action={proposal} busy={busyId === proposal.id} onApprove={onApprove} onReject={onReject} />
                </section>
              )}

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Conversation</h3>
                  <Button asChild variant="ghost" size="sm" className="text-xs">
                    <Link to="/inbox"><MessagesSquare className="w-3.5 h-3.5 mr-1.5" /> Open inbox</Link>
                  </Button>
                </div>
                {messages.length === 0 ? (
                  <p className="text-sm text-stone-400">No messages yet.</p>
                ) : (
                  <div className="bg-stone-50 rounded-xl p-3 space-y-3 max-h-72 overflow-y-auto">
                    {messages.map((m) => <MessageBubble key={m.id} message={m} leadName={lead.name} />)}
                  </div>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Agent history</h3>
                {actions.length === 0 ? (
                  <p className="text-sm text-stone-400">The agent hasn't worked this lead yet.</p>
                ) : (
                  <div className="space-y-2">
                    {actions.map((a) => <ActivityItem key={a.id} action={a} />)}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}