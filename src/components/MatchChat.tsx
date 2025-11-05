import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from './ChatMessage';
import { AppointmentForm } from './AppointmentForm';
import { AppointmentInfo } from './AppointmentInfo';
import { ReviewForm } from './ReviewForm';
import { Send, Calendar, MessageCircleOff, Crown, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MatchChatProps {
  matchRequestId: string;
  otherUserName: string;
  otherUserId: string;
  isPremium?: boolean;
  premiumRate?: {
    price_euros: number;
    duration_hours: number;
    description?: string;
  };
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  location: string;
  status: string;
  review_deadline: string | null;
  is_premium: boolean;
}

export const MatchChat = ({ matchRequestId, otherUserName, otherUserId, isPremium, premiumRate }: MatchChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isFemaleUser, setIsFemaleUser] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [appointmentDeadline, setAppointmentDeadline] = useState<string | null>(null);
  const [chatStatus, setChatStatus] = useState<string>('active');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Fetch user profile to check gender
        const { data: profile } = await supabase
          .from('profiles')
          .select('gender')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setIsFemaleUser(profile.gender === 'female');
        }
      }
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

    const checkMatchStatus = async () => {
      const { data: matchData } = await supabase
        .from('match_requests')
        .select('appointment_deadline, chat_status')
        .eq('id', matchRequestId)
        .single();

      if (matchData) {
        setAppointmentDeadline(matchData.appointment_deadline);
        setChatStatus(matchData.chat_status || 'active');
      }
    };

    const checkAppointment = async () => {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('match_request_id', matchRequestId)
        .maybeSingle();
      
      if (data) {
        setAppointment(data);
        
        // Check if appointment is completed and within review period
        const now = new Date();
        const appointmentDate = new Date(data.appointment_date);
        const oneHourAfter = new Date(appointmentDate.getTime() + 60 * 60 * 1000);
        const reviewDeadline = data.review_deadline ? new Date(data.review_deadline) : null;
        
        const isAfterOneHour = now >= oneHourAfter;
        const isWithinReviewPeriod = reviewDeadline ? now <= reviewDeadline : false;
        
        setCanReview(isAfterOneHour && isWithinReviewPeriod);
        
        // Check if user has already reviewed
        if (isAfterOneHour && currentUserId) {
          const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('appointment_id', data.id)
            .eq('reviewer_id', currentUserId)
            .maybeSingle();
          
          setHasReviewed(!!existingReview);
        }
      }
    };

    fetchMessages();
    checkMatchStatus();
    if (currentUserId) {
      checkAppointment();
    }

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
  }, [matchRequestId, currentUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Countdown timer for appointment deadline
  useEffect(() => {
    if (!appointmentDeadline || appointment || chatStatus !== 'active') return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const deadline = new Date(appointmentDeadline).getTime();
      const distance = deadline - now;

      if (distance < 0) {
        setTimeRemaining('Scaduto');
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [appointmentDeadline, appointment, chatStatus]);

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

  // Check if appointment deadline has passed
  const isDeadlinePassed = !appointment && appointmentDeadline && new Date(appointmentDeadline) < new Date();
  
  const isChatDisabled = canReview || (appointment?.status === 'completed' && !canReview) || isDeadlinePassed || chatStatus !== 'active';

  if (canReview && !hasReviewed && showReviewForm) {
    return (
      <ReviewForm
        appointmentId={appointment!.id}
        reviewedUserId={otherUserId}
        reviewedUserName={otherUserName}
        onSuccess={() => {
          setHasReviewed(true);
          setShowReviewForm(false);
          toast({
            title: 'Recensione inviata',
            description: 'La tua recensione è stata registrata con successo.',
          });
        }}
      />
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="border-b p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">Chat con {otherUserName}</h3>
            {isPremium && (
              <Badge className="bg-yellow-500 text-black text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
            {isPremium && premiumRate && (
              <span className="text-sm text-muted-foreground">
                €{premiumRate.price_euros} • {premiumRate.duration_hours}h
                {premiumRate.description && ` • ${premiumRate.description}`}
              </span>
            )}
          </div>
          {!appointment && !showAppointmentForm && isFemaleUser && chatStatus === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAppointmentForm(true)}
              disabled={isDeadlinePassed}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Registra Appuntamento
            </Button>
          )}
        </div>

        {/* Countdown timer */}
        {!appointment && chatStatus === 'active' && appointmentDeadline && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Tempo per fissare l'appuntamento</p>
                <p className="text-lg font-bold text-primary">{timeRemaining}</p>
              </div>
            </div>
          </div>
        )}

        {chatStatus === 'under_review' && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Conversazione in revisione da parte dell'amministratore
              </p>
            </div>
          </div>
        )}

        {chatStatus === 'blocked' && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm font-medium text-destructive">
              🚫 Conversazione bloccata
            </p>
          </div>
        )}

        {appointment && (
          <AppointmentInfo
            date={appointment.appointment_date}
            location={appointment.location}
            isPremium={appointment.is_premium}
          />
        )}

        {canReview && !hasReviewed && (
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => setShowReviewForm(true)}
          >
            Lascia una recensione
          </Button>
        )}

        {hasReviewed && (
          <p className="text-sm text-muted-foreground text-center">
            Hai già lasciato una recensione per questo appuntamento.
          </p>
        )}
      </div>

      {(isChatDisabled || chatStatus !== 'active') ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <MessageCircleOff className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              {chatStatus === 'under_review' 
                ? 'Conversazione in attesa di revisione amministrativa' 
                : chatStatus === 'blocked'
                ? 'Conversazione bloccata'
                : 'La chat è stata chiusa dopo l\'appuntamento.'}
            </p>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}

      {showAppointmentForm && !appointment && (
        <div className="p-4 border-t">
          <AppointmentForm
            matchRequestId={matchRequestId}
            otherUserId={otherUserId}
            onSuccess={() => {
              setShowAppointmentForm(false);
              window.location.reload();
            }}
          />
        </div>
      )}
    </Card>
  );
};
