import { Zap, User, Bot } from 'lucide-react';
import { format } from 'date-fns';

const META = {
  customer: { align: 'items-start', bubble: 'bg-white border border-stone-200 text-stone-800', icon: User },
  gtm_agent: { align: 'items-end', bubble: 'bg-[#101418] text-white', icon: Bot, label: 'GTM Agent' },
  user: { align: 'items-end', bubble: 'bg-indigo-600 text-white', icon: Zap, label: 'You' },
};

export default function MessageBubble({ message, leadName }) {
  const meta = META[message.sender] || META.customer;
  return (
    <div className={`flex flex-col ${meta.align}`}>
      <span className="text-[11px] text-stone-400 mb-1 px-1">
        {message.sender === 'customer' ? leadName : meta.label}
        {message.created_date ? ` · ${format(new Date(message.created_date), 'MMM d, HH:mm')}` : ''}
      </span>
      <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${meta.bubble}`}>
        {message.subject && <div className="font-semibold mb-1">{message.subject}</div>}
        {message.body}
      </div>
    </div>
  );
}