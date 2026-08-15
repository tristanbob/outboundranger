import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessagesSquare } from 'lucide-react';
import ProposalCard from '@/components/agent/ProposalCard';
import AwaitingResponseCard from '@/components/agent/AwaitingResponseCard';
import ActivityItem from '@/components/activity/ActivityItem';
import MessageBubble from '@/components/inbox/MessageBubble';
import { STAGES } from '@/components/pipeline/stages';

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs text-stone-400">{label}</div>
      <div className="text-sm text-stone-800 mt-0.5 whitespace-pre-line">{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{title}</h3>
      {children}
    </section>
  );
}

export default function LeadProfile({ lead, proposal, awaiting, actions, messages, busyId, onApprove, onReject, onGenerateResponse }) {
  const stage = STAGES.find((s) => s.id === (lead.status || 'new'));
  const completed = actions.filter((a) => a.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 space-y-5">
        <div>
          <h2 className="font-heading text-lg font-bold text-stone-900">{lead.name}</h2>
          <p className="text-sm text-stone-500">{lead.title ? `${lead.title} · ` : ''}{lead.company}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{stage?.label}</Badge>
          <Badge variant="outline" className="capitalize">{lead.segment?.replace(/_/g, ' ')}</Badge>
          <span className="text-xs text-stone-400">Signal {Math.round(lead.signal_strength ?? 0)}/100</span>
          <span className="text-xs text-stone-400">{completed.length} action{completed.length === 1 ? '' : 's'} taken</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email" value={lead.email} />
          <Field label="Why now" value={lead.signal} />
          <Field label="Persona" value={lead.persona} />
          <Field label="Notes" value={lead.notes} />
        </div>
      </div>

      {(lead.dossier || lead.dossier_do_not_repeat) && (
        <Section title="What the agent knows about them">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-3">
            <Field label="Dossier" value={lead.dossier} />
            <Field label="Angles it won't repeat" value={lead.dossier_do_not_repeat} />
          </div>
        </Section>
      )}

      {proposal && (
        <Section title="Awaiting your decision">
          <ProposalCard action={proposal} busy={busyId === proposal.id} onApprove={onApprove} onReject={onReject} />
        </Section>
      )}

      {awaiting && (
        <Section title="Awaiting customer response">
          <AwaitingResponseCard action={awaiting} busy={busyId === awaiting.id} onGenerate={onGenerateResponse} />
        </Section>
      )}

      <Section title="Conversation">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-stone-400">No messages yet.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((m) => <MessageBubble key={m.id} message={m} leadName={lead.name} />)}
            </div>
          )}
          <Button asChild variant="ghost" size="sm" className="text-xs mt-2">
            <Link to="/inbox"><MessagesSquare className="w-3.5 h-3.5 mr-1.5" /> Open inbox</Link>
          </Button>
        </div>
      </Section>

      <Section title="Agent history">
        {actions.length === 0 ? (
          <p className="text-sm text-stone-400">The agent hasn't worked this customer yet.</p>
        ) : (
          <div className="space-y-2">
            {actions.map((a) => <ActivityItem key={a.id} action={a} />)}
          </div>
        )}
      </Section>
    </div>
  );
}