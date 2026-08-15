const POSITIVE = ['reply', 'meeting_booked', 'conversion'];

const label = (s) => s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

export function buildReport(leads, actions, memories) {
  const completed = actions.filter((a) => a.outcome);
  const positive = completed.filter((a) => POSITIVE.includes(a.outcome));

  const byType = {};
  for (const a of completed) {
    const t = a.action_type || 'other';
    byType[t] = byType[t] || { name: label(t), sent: 0, positive: 0 };
    byType[t].sent += 1;
    if (POSITIVE.includes(a.outcome)) byType[t].positive += 1;
  }
  const actionTypes = Object.values(byType)
    .map((r) => ({ ...r, rate: r.sent ? Math.round((r.positive / r.sent) * 100) : 0 }))
    .sort((a, b) => b.rate - a.rate);

  const outcomeCounts = {};
  for (const a of completed) outcomeCounts[a.outcome] = (outcomeCounts[a.outcome] || 0) + 1;
  const outcomes = Object.entries(outcomeCounts)
    .map(([k, v]) => ({ name: label(k), value: v }))
    .sort((a, b) => b.value - a.value);

  const objections = {};
  for (const a of completed) {
    const o = (a.reply_objection || '').trim();
    if (o) objections[o] = (objections[o] || 0) + 1;
  }
  const topObjections = Object.entries(objections)
    .map(([k, v]) => ({ objection: k, count: v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const learnings = memories
    .filter((m) => m.active && (m.applied_count || 0) > 0)
    .map((m) => ({
      ...m,
      rate: Math.round(((m.positive_count || 0) / m.applied_count) * 100),
    }))
    .sort((a, b) => b.rate - a.rate || b.applied_count - a.applied_count);

  const predicted = completed.filter((a) => a.prediction_hit);
  const accuracy = predicted.length
    ? Math.round((predicted.filter((a) => a.prediction_hit === 'yes').length / predicted.length) * 100)
    : null;

  return {
    sent: completed.length,
    positiveRate: completed.length ? Math.round((positive.length / completed.length) * 100) : 0,
    meetings: leads.filter((l) => ['meeting_booked', 'converted'].includes(l.status)).length,
    accuracy,
    actionTypes,
    outcomes,
    topObjections,
    learnings: learnings.slice(0, 5),
    weakLearnings: learnings.filter((m) => m.applied_count >= 2 && m.rate === 0).slice(0, 3),
  };
}