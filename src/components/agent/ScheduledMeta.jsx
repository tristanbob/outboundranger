import { Mail, MessageSquare, Share2, Phone, Linkedin, Send, CalendarClock } from 'lucide-react';

const ICONS = {
  email: Mail,
  sms: MessageSquare,
  linkedin: Linkedin,
  social: Share2,
  twitter: Share2,
  call: Phone,
  phone: Phone,
};

function formatWhen(value) {
  if (!value) return 'Sending shortly';
  const d = new Date(value);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Highlights the two things that matter about a queued action: when it sends and how.
export default function ScheduledMeta({ channel, scheduledFor }) {
  const Icon = ICONS[(channel || '').toLowerCase()] || Send;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-900">
        <CalendarClock className="w-4 h-4" />
        {formatWhen(scheduledFor)}
      </span>
      <span className="text-blue-300">·</span>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-900 capitalize">
        <Icon className="w-4 h-4" />
        {channel || 'email'}
      </span>
    </div>
  );
}