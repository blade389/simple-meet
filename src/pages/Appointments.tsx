import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Heart, ArrowLeft, MessageCircle, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MatchChat } from '@/components/MatchChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface AcceptedMatch {
  id: string;
  sender_id: string;
  receiver_id: string;
  is_premium: boolean;
  senderName?: string;
  receiverName?: string;
  senderPositiveReviews?: number;
  senderNegativeReviews?: number;
  receiverPositiveReviews?: number;
  receiverNegativeReviews?: number;
}

const Appointments = () => {
  const [acceptedMatches, setAcceptedMatches] = useState<AcceptedMatch[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setCurrentUserId(user.id);

        const { data, error } = await supabase
          .from('match_requests')
          .select('id, sender_id, receiver_id, is_premium')
          .eq('status', 'accepted')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (error) throw error;

        // Fetch profiles for all users
        if (data && data.length > 0) {
          const userIds = [...new Set(data.flatMap(m => [m.sender_id, m.receiver_id]))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, positive_reviews_count, negative_reviews_count')
            .in('id', userIds);

          const profileMap = new Map(profiles?.map(p => [p.id, {
            name: p.full_name,
            positiveReviews: p.positive_reviews_count || 0,
            negativeReviews: p.negative_reviews_count || 0,
          }]));
          
          const matchesWithNames = data.map(match => {
            const sender = profileMap.get(match.sender_id);
            const receiver = profileMap.get(match.receiver_id);
            return {
              ...match,
              senderName: sender?.name,
              senderPositiveReviews: sender?.positiveReviews,
              senderNegativeReviews: sender?.negativeReviews,
              receiverName: receiver?.name,
              receiverPositiveReviews: receiver?.positiveReviews,
              receiverNegativeReviews: receiver?.negativeReviews,
            };
          });

          setAcceptedMatches(matchesWithNames);
          setSelectedMatch(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const getOtherUser = (match: AcceptedMatch) => {
    const isUserSender = match.sender_id === currentUserId;
    return {
      id: isUserSender ? match.receiver_id : match.sender_id,
      name: isUserSender ? match.receiverName : match.senderName,
      positiveReviews: isUserSender ? match.receiverPositiveReviews : match.senderPositiveReviews,
      negativeReviews: isUserSender ? match.receiverNegativeReviews : match.senderNegativeReviews,
    };
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
        <h2 className="text-3xl font-bold mb-6">I Miei Appuntamenti</h2>
        
        {loading ? (
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Caricamento...</p>
            </Card>
          </div>
        ) : acceptedMatches.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nessun match accettato. Vai su Browse per trovare persone!
              </p>
            </Card>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <Tabs value={selectedMatch || ''} onValueChange={setSelectedMatch}>
              <TabsList className="mb-4 flex-wrap h-auto">
                {acceptedMatches.map((match) => {
                  const otherUser = getOtherUser(match);
                  return (
                    <TabsTrigger key={match.id} value={match.id} className="flex items-center gap-2">
                      <span>{otherUser.name}</span>
                      {match.is_premium && (
                        <Badge className="bg-yellow-500 text-black text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      <span className="text-xs">
                        👍🏼 {otherUser.positiveReviews || 0} 👎🏼 {otherUser.negativeReviews || 0}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {acceptedMatches.map((match) => {
                const otherUser = getOtherUser(match);
                return (
                  <TabsContent key={match.id} value={match.id}>
                    <MatchChat
                      matchRequestId={match.id}
                      otherUserName={otherUser.name}
                      otherUserId={otherUser.id}
                      isPremium={match.is_premium}
                    />
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default Appointments;
