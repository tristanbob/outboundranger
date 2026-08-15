import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { History, Check } from 'lucide-react';
import { format } from 'date-fns';

function label(conv) {
  const first = (conv.messages || []).find((m) => m.role === 'user');
  const text = (first?.content || '').replace(/^\[context[^\]]*\]\s*/, '').trim();
  return text ? text.slice(0, 44) : 'Empty chat';
}

export default function ChatHistoryMenu({ conversations, currentId, onSelect }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0">
          <History className="w-3.5 h-3.5" /> History
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-h-80 overflow-y-auto">
        <DropdownMenuLabel className="text-xs text-stone-400 font-normal">Past chats</DropdownMenuLabel>
        {conversations.length === 0 && (
          <div className="px-2 py-3 text-xs text-stone-400">No past chats yet.</div>
        )}
        {conversations.map((c) => (
          <DropdownMenuItem key={c.id} onClick={() => onSelect(c)} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-stone-700 truncate">{label(c)}</div>
              {c.created_date && (
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {format(new Date(c.created_date), 'MMM d, h:mm a')}
                </div>
              )}
            </div>
            {c.id === currentId && <Check className="w-3.5 h-3.5 text-stone-500 mt-0.5 shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}