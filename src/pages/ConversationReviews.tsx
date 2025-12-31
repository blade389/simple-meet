import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, ArrowLeft, AlertTriangle, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface Review {
  id: string;
  match_request_id: string;
  created_at: string;
  action_taken: string | null;
  admin_notes: string | null;
  match_request: {
    sender_id: string;
    receiver_id: string;
    is_premium: boolean;
  };
  sender_profile: {
    full_name: string;
    gender: string;
  };
  receiver_profile: {
    full_name: string;
    gender: string;
  };
  messages?: ChatMessage[];
}

const ConversationReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
    loadReviews();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) {
      navigate('/dashboard');
    }
  };

  const loadReviews = async () => {
    try {
      console.log('Loading conversation reviews...');
      
      // First, get all pending conversation reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('conversation_reviews')
        .select('*')
        .is('action_taken', null)
        .order('created_at', { ascending: false });

      console.log('Reviews data:', reviewsData, 'Error:', reviewsError);

      if (reviewsError) throw reviewsError;

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      // Get match request IDs
      const matchRequestIds = reviewsData.map(r => r.match_request_id);
      
      // Fetch match requests separately
      const { data: matchRequests, error: matchError } = await supabase
        .from('match_requests')
        .select('id, sender_id, receiver_id, is_premium')
        .in('id', matchRequestIds);

      console.log('Match requests:', matchRequests, 'Error:', matchError);

      if (matchError) throw matchError;

      const matchRequestMap = new Map(matchRequests?.map(mr => [mr.id, mr]));

      // Get all user IDs from match requests
      const userIds = [...new Set(matchRequests?.flatMap(mr => [mr.sender_id, mr.receiver_id]) || [])];

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, gender')
        .in('id', userIds);

      console.log('Profiles:', profiles, 'Error:', profilesError);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map(p => [p.id, p]));

      // Fetch chat messages for all match requests
      const { data: allMessages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('id, match_request_id, sender_id, message, created_at')
        .in('match_request_id', matchRequestIds)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      }

      // Group messages by match_request_id
      const messagesMap = new Map<string, ChatMessage[]>();
      allMessages?.forEach(msg => {
        const existing = messagesMap.get(msg.match_request_id) || [];
        existing.push(msg);
        messagesMap.set(msg.match_request_id, existing);
      });

      // Combine data
      const reviewsWithProfiles = reviewsData.map(review => {
        const matchRequest = matchRequestMap.get(review.match_request_id);
        return {
          ...review,
          match_request: matchRequest || { sender_id: '', receiver_id: '', is_premium: false },
          sender_profile: matchRequest ? profileMap.get(matchRequest.sender_id) : undefined,
          receiver_profile: matchRequest ? profileMap.get(matchRequest.receiver_id) : undefined,
          messages: messagesMap.get(review.match_request_id) || [],
        };
      }).filter(r => r.match_request.sender_id); // Filter out reviews without valid match requests

      console.log('Final reviews with profiles:', reviewsWithProfiles);

      setReviews(reviewsWithProfiles as Review[]);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le revisioni',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to get male/female user IDs based on request type
  const getUserIds = (review: Review) => {
    // For premium requests: sender is male (uomo), receiver is female (donna)
    // For non-premium requests: sender is female (donna), receiver is male (uomo)
    if (review.match_request.is_premium) {
      return {
        maleUserId: review.match_request.sender_id,
        femaleUserId: review.match_request.receiver_id,
        maleName: review.sender_profile?.full_name,
        femaleName: review.receiver_profile?.full_name,
      };
    } else {
      return {
        maleUserId: review.match_request.receiver_id,
        femaleUserId: review.match_request.sender_id,
        maleName: review.receiver_profile?.full_name,
        femaleName: review.sender_profile?.full_name,
      };
    }
  };

  const handleAction = async (reviewId: string, action: 'deduct_token_male' | 'block_female' | 'no_action') => {
    setProcessing(true);
    try {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      const { maleUserId, femaleUserId } = getUserIds(review);

      // Update the review
      const { error: reviewError } = await supabase
        .from('conversation_reviews')
        .update({
          action_taken: action,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes,
        })
        .eq('id', reviewId);

      if (reviewError) throw reviewError;

      // Execute the action
      if (action === 'deduct_token_male') {
        const { data: tokens, error: fetchError } = await supabase
          .from('tokens')
          .select('amount')
          .eq('user_id', maleUserId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (tokens) {
          const { error: updateError } = await supabase
            .from('tokens')
            .update({
              amount: Math.max(0, (tokens.amount || 0) - 1),
              last_updated: new Date().toISOString(),
            })
            .eq('user_id', maleUserId);

          if (updateError) throw updateError;
        }

        toast({
          title: 'Azione eseguita',
          description: 'Gettone scalato all\'utente uomo',
        });
      } else if (action === 'block_female') {
        const { error: blockError } = await supabase
          .from('profiles')
          .update({ is_blocked: true })
          .eq('id', femaleUserId);

        if (blockError) throw blockError;

        toast({
          title: 'Azione eseguita',
          description: 'Account donna bloccato',
        });
      } else {
        toast({
          title: 'Azione eseguita',
          description: 'Nessuna azione intrapresa',
        });
      }

      // Close the match request
      await supabase
        .from('match_requests')
        .update({ 
          status: 'rejected',
          chat_status: 'blocked' 
        })
        .eq('id', review.match_request_id);

      setAdminNotes('');
      setSelectedReview(null);
      loadReviews();
    } catch (error) {
      console.error('Error processing action:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eseguire l\'azione',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            Admin
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
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold">Revisioni Conversazioni</h2>
        </div>

        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Caricamento...</p>
          </Card>
        ) : reviews.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nessuna revisione in sospeso</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {review.sender_profile?.full_name} → {review.receiver_profile?.full_name}
                        </h3>
                        {review.match_request.is_premium && (
                          <Badge className="bg-yellow-500 text-black">Premium</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Richiesta da: {review.sender_profile?.gender === 'female' ? 'Donna' : 'Uomo'} • 
                        Ricevuta da: {review.receiver_profile?.gender === 'male' ? 'Uomo' : 'Donna'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Data: {new Date(review.created_at).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Chat Messages Section */}
                  <div className="border rounded-lg">
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-between p-4"
                      onClick={() => setExpandedChat(expandedChat === review.id ? null : review.id)}
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        <span>Visualizza conversazione ({review.messages?.length || 0} messaggi)</span>
                      </div>
                      {expandedChat === review.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                    
                    {expandedChat === review.id && (
                      <div className="border-t">
                        <ScrollArea className="h-[300px] p-4">
                          {review.messages && review.messages.length > 0 ? (
                            <div className="space-y-3">
                              {review.messages.map((msg) => {
                                const isSender = msg.sender_id === review.match_request.sender_id;
                                const senderName = isSender 
                                  ? review.sender_profile?.full_name 
                                  : review.receiver_profile?.full_name;
                                const senderGender = isSender
                                  ? review.sender_profile?.gender
                                  : review.receiver_profile?.gender;
                                
                                return (
                                  <div 
                                    key={msg.id} 
                                    className={`p-3 rounded-lg ${
                                      isSender 
                                        ? 'bg-primary/10 ml-0 mr-12' 
                                        : 'bg-muted ml-12 mr-0'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm">
                                        {senderName}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {senderGender === 'female' ? 'Donna' : 'Uomo'}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground ml-auto">
                                        {new Date(msg.created_at).toLocaleString('it-IT', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-sm">{msg.message}</p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-center text-muted-foreground py-8">
                              Nessun messaggio in questa conversazione
                            </p>
                          )}
                        </ScrollArea>
                      </div>
                    )}
                  </div>

                  {selectedReview === review.id ? (
                    <div className="space-y-4 pt-4 border-t">
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Note amministrative (opzionale)"
                        rows={3}
                      />
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => handleAction(review.id, 'deduct_token_male')}
                          disabled={processing}
                          variant="destructive"
                        >
                          Scala gettone a {getUserIds(review).maleName} (Uomo)
                        </Button>
                        <Button
                          onClick={() => handleAction(review.id, 'block_female')}
                          disabled={processing}
                          variant="destructive"
                        >
                          Blocca {getUserIds(review).femaleName} (Donna)
                        </Button>
                        <Button
                          onClick={() => handleAction(review.id, 'no_action')}
                          disabled={processing}
                          variant="outline"
                        >
                          Nessuna azione
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedReview(null);
                            setAdminNotes('');
                          }}
                          disabled={processing}
                          variant="ghost"
                        >
                          Annulla
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => setSelectedReview(review.id)}>
                      Revisiona
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ConversationReviews;
