import ReactMarkdown from 'react-markdown';
import ToolCallChip from '@/components/chat/ToolCallChip';

function stripContext(text) {
  return text.replace(/^\[context[^\]]*\]\s*/i, '');
}

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] md:max-w-[70%] ${isUser ? 'bg-stone-900 text-white rounded-2xl rounded-br-md px-4 py-2.5' : ''}`}>
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{stripContext(message.content)}</p>
        ) : (
          <>
            {message.content && (
              <div className="text-sm text-stone-800 prose prose-sm prose-stone max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}
            {message.tool_calls?.map((tc, i) => <ToolCallChip key={i} toolCall={tc} />)}
          </>
        )}
      </div>
    </div>
  );
}