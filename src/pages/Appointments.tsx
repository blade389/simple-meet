import { Card } from '@/components/ui/card';
import { Heart, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface MatchRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  sender_profile: {
    full_name: string;
    profile_photo_url: string | null;
  };
  receiver_profile: {
    full_name: string;
    profile_photo_url: string | null;
  };
}

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

const Appointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchRequest[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchRequest | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentLocation, setAppointmentLocation] = useState('');

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  useEffect(() => {
    if (selectedMatch) {
      fetchMessages(selectedMatch.id);
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`chat:${selectedMatch.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `match_request_id=eq.${selectedMatch.id}`
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as ChatMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedMatch]);

  const fetchMatches = async () => {
    const { data: matchRequests, error } = await supabase
      .from('match_requests')
      .select('id, sender_id, receiver_id, created_at')
      .eq('status', 'accepted')
      .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
      return;
    }

    if (!matchRequests) {
      setMatches([]);
      return;
    }

    // Fetch profiles for all matches
    const userIds = new Set<string>();
    matchRequests.forEach((req) => {
      userIds.add(req.sender_id);
      userIds.add(req.receiver_id);
    });

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, profile_photo_url')
      .in('id', Array.from(userIds));

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    const profilesMap = new Map(profiles?.map(p => [p.id, p]));

    const matchesWithProfiles = matchRequests.map((req) => ({
      ...req,
      sender_profile: profilesMap.get(req.sender_id) || { full_name: 'Utente', profile_photo_url: null },
      receiver_profile: profilesMap.get(req.receiver_id) || { full_name: 'Utente', profile_photo_url: null }
    }));

    setMatches(matchesWithProfiles);
  };

  const fetchMessages = async (matchRequestId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('match_request_id', matchRequestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch || !user) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        match_request_id: selectedMatch.id,
        sender_id: user.id,
        message: newMessage.trim()
      });

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile inviare il messaggio',
        variant: 'destructive'
      });
      return;
    }

    setNewMessage('');
  };

  const createAppointment = async () => {
    if (!selectedMatch || !user || !appointmentDate || !appointmentTime || !appointmentLocation) {
      toast({
        title: 'Errore',
        description: 'Compila tutti i campi',
        variant: 'destructive'
      });
      return;
    }

    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);

    const { error } = await supabase
      .from('appointments')
      .insert({
        match_request_id: selectedMatch.id,
        female_user_id: selectedMatch.sender_id,
        male_user_id: selectedMatch.receiver_id,
        appointment_date: appointmentDateTime.toISOString(),
        location: appointmentLocation,
        status: 'scheduled'
      });

    if (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile creare l\'appuntamento',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Successo',
      description: 'Appuntamento registrato!'
    });

    setAppointmentDate('');
    setAppointmentTime('');
    setAppointmentLocation('');
  };

  const getOtherUser = (match: MatchRequest) => {
    return match.sender_id === user?.id
      ? match.receiver_profile
      : match.sender_profile;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SCOPAMI
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">I Miei Match</h2>
        
        <div className="max-w-6xl mx-auto">
          {matches.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Nessun match attivo
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {matches.map((match) => {
                const otherUser = getOtherUser(match);
                return (
                  <Card 
                    key={match.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="flex items-center gap-3">
                      {otherUser.profile_photo_url ? (
                        <img 
                          src={otherUser.profile_photo_url}
                          alt={otherUser.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Heart className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{otherUser.full_name}</h3>
                        <p className="text-sm text-muted-foreground">Clicca per chattare</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {selectedMatch && (
          <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Chat con {getOtherUser(selectedMatch).full_name}</DialogTitle>
              </DialogHeader>
              
              <div className="flex flex-col h-[60vh]">
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Scrivi un messaggio..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Registra Appuntamento</h4>
                    <div className="grid gap-3">
                      <div>
                        <Label htmlFor="date">Data</Label>
                        <Input
                          id="date"
                          type="date"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Ora</Label>
                        <Input
                          id="time"
                          type="time"
                          value={appointmentTime}
                          onChange={(e) => setAppointmentTime(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Luogo</Label>
                        <Input
                          id="location"
                          placeholder="Es. Caffè Centrale, Via Roma 10"
                          value={appointmentLocation}
                          onChange={(e) => setAppointmentLocation(e.target.value)}
                        />
                      </div>
                      <Button onClick={createAppointment} className="w-full">
                        Conferma Appuntamento
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default Appointments;