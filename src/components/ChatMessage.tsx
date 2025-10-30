import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ChatMessageProps {
  message: string;
  isMine: boolean;
  timestamp: string;
}

export const ChatMessage = ({ message, isMine, timestamp }: ChatMessageProps) => {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] ${isMine ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg px-4 py-2`}>
        <p className="text-sm">{message}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {format(new Date(timestamp), 'HH:mm', { locale: it })}
        </span>
      </div>
    </div>
  );
};
