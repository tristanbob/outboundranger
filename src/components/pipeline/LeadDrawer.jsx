import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessagesSquare } from 'lucide-react';
import ProposalCard from '@/components/agent/ProposalCard';
import AwaitingResponseCard from '@/components/agent/AwaitingResponseCard';
import ScheduledCard from '@/components/agent/ScheduledCard';
import ActivityItem from '@/components/activity/ActivityItem';
import MessageBubble from '@/components/inbox/MessageBubble';
import { STAGES } from './stages';

export default function LeadDrawer({ lead, proposal, awaiting, actions, messages, busyId, onApprove, onReject, onGenerateResponse, onClose, onRefresh }) {
  const scheduled = actions.filter((a) => a.status === 'scheduled');
  const stage = STAGES.find((s) => s.id === (lead?.status || 'new'));
  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto pb-16">
        {lead && (
          <>
            <SheetHeader className="text-left pr-10">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <SheetTitle className="font-heading">{lead.name}</SheetTitle>
                  <p className="text-sm text-stone-500">{lead.title ? `${lead.title} · ` : ''}{lead.company}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs shrink-0">
                  <Link to="/leads"><MessagesSquare className="w-3.5 h-3.5 mr-1.5" /> Open in Customers</Link>
                </Button>
              </div>
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

              {lead.dossier && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">What the agent knows about them</h3>
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-700 whitespace-pre-line">{lead.dossier}</div>
                  {lead.dossier_do_not_repeat && (
                    <p className="text-xs text-stone-500"><span className="font-medium text-stone-600">Won't repeat: </span>{lead.dossier_do_not_repeat}</p>
                  )}
                </section>
              )}

              {proposal && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Awaiting your decision</h3>
                  <ProposalCard action={proposal} busy={busyId === proposal.id} onApprove={onApprove} onReject={onReject} />
                </section>
              )}

              {scheduled.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Scheduled to send</h3>
                  {scheduled.map((a) => <ScheduledCard key={a.id} action={a} onSent={onRefresh} />)}
                </section>
              )}

              {awaiting && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Awaiting customer response</h3>
                  <AwaitingResponseCard action={awaiting} busy={busyId === awaiting.id} onGenerate={onGenerateResponse} />
                </section>
              )}

              <section className="space-y-2">
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Conversation</h3>
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