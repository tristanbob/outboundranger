import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { orgScope } from '@/lib/org';
import { Send, Target, CalendarCheck, Crosshair } from 'lucide-react';
import StatCards from '@/components/agent/StatCards';
import ReportCard from '@/components/reports/ReportCard';
import FunnelBars from '@/components/reports/FunnelBars';
import ChannelPerformance from '@/components/reports/ChannelPerformance';
import OutcomeChart from '@/components/reports/OutcomeChart';
import LearningsTable from '@/components/reports/LearningsTable';
import { buildReport } from '@/components/reports/reportMath';

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const [leads, actions, memories] = await Promise.all([
        base44.entities.Lead.filter(orgScope(), '-created_date', 500),
        base44.entities.AgentAction.filter(orgScope(), '-created_date', 500),
        base44.entities.MemoryEntry.filter(orgScope(), '-created_date', 200),
      ]);
      setData({ leads, report: buildReport(leads, actions, memories) });
    })();
  }, []);

  if (!data) {
    return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" /></div>;
  }

  const { leads, report } = data;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-stone-900 tracking-tight">Reporting</h1>
        <p className="text-sm text-stone-400 mt-1">What the agent has actually produced — which moves earn replies, where customers push back, and which learnings are paying off.</p>
      </header>

      <StatCards stats={[
        { label: 'Messages sent', value: report.sent, icon: Send },
        { label: 'Positive response rate', value: `${report.positiveRate}%`, icon: Target },
        { label: 'Meetings & conversions', value: report.meetings, icon: CalendarCheck },
        { label: 'Prediction accuracy', value: report.accuracy === null ? '—' : `${report.accuracy}%`, icon: Crosshair },
      ]} />

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        <ReportCard title="Pipeline funnel" subtitle="Where every lead currently sits">
          <FunnelBars leads={leads} />
        </ReportCard>

        <ReportCard
          title="What works by move"
          subtitle="Share of each action type that earned a reply, meeting or conversion"
          empty={report.actionTypes.length ? null : 'No completed actions yet.'}
        >
          <ChannelPerformance rows={report.actionTypes} />
        </ReportCard>

        <ReportCard
          title="Outcomes"
          subtitle="How conversations have ended so far"
          empty={report.outcomes.length ? null : 'No outcomes recorded yet.'}
        >
          <OutcomeChart data={report.outcomes} />
        </ReportCard>

        <ReportCard
          title="Most common objections"
          subtitle="What customers push back on"
          empty={report.topObjections.length ? null : 'No objections captured yet.'}
        >
          <ul className="space-y-2">
            {report.topObjections.map((o) => (
              <li key={o.objection} className="flex items-start gap-3 text-sm">
                <span className="flex-1 text-stone-700">{o.objection}</span>
                <span className="text-xs text-stone-400 shrink-0 mt-0.5">×{o.count}</span>
              </li>
            ))}
          </ul>
        </ReportCard>

        <ReportCard
          title="Best performing learnings"
          subtitle="Playbook rules ranked by the outcomes they produced"
          empty={report.learnings.length ? null : 'No learnings have been applied to a completed action yet.'}
        >
          <LearningsTable rows={report.learnings} />
        </ReportCard>

        <ReportCard
          title="Learnings to reconsider"
          subtitle="Applied more than once with nothing to show for it"
          empty={report.weakLearnings.length ? null : 'Nothing underperforming right now.'}
        >
          <LearningsTable rows={report.weakLearnings} />
        </ReportCard>
      </div>
    </div>
  );
}