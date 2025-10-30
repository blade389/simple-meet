import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from './ChatMessage';
import { AppointmentForm } from './AppointmentForm';
import { Send, Calendar } from 'lucide-react';

interface MatchChatProps {
  matchRequestId: string;
  otherUserName: string;
  otherUserId: string;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export const MatchChat = ({ matchRequestId, otherUserName, otherUserId }: MatchChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [hasAppointment, setHasAppointment] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!matchRequestId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('match_request_id', matchRequestId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
    };

    const checkAppointment = async () => {
      const { data } = await supabase
        .from('appointments')
        .select('id')
        .eq('match_request_id', matchRequestId)
        .single();
      
      setHasAppointment(!!data);
    };

    fetchMessages();
    checkAppointment();

    const channel = supabase
      .channel(`chat:${matchRequestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `match_request_id=eq.${matchRequestId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchRequestId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          match_request_id: matchRequestId,
          sender_id: currentUserId,
          message: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Errore',
        description: 'Non è stato possibile inviare il messaggio.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="border-b p-4 flex justify-between items-center">
        <h3 className="font-semibold">Chat con {otherUserName}</h3>
        {!hasAppointment && !showAppointmentForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAppointmentForm(true)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Registra Appuntamento
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            isMine={msg.sender_id === currentUserId}
            timestamp={msg.created_at}
          />
        ))}
      </ScrollArea>

      <form onSubmit={sendMessage} className="border-t p-4 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Scrivi un messaggio..."
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !newMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {showAppointmentForm && !hasAppointment && (
        <div className="p-4 border-t">
          <AppointmentForm
            matchRequestId={matchRequestId}
            otherUserId={otherUserId}
            onSuccess={() => {
              setShowAppointmentForm(false);
              setHasAppointment(true);
            }}
          />
        </div>
      )}
    </Card>
  );
};
