import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, X, Crown, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface MatchRequest {
  id: string;
  sender_id: string;
  message: string | null;
  created_at: string;
  expires_at: string | null;
  is_premium: boolean;
  selected_rate_id: string | null;
  sender: {
    full_name: string;
    birth_date: string;
    profile_photo_url: string | null;
  };
  premium_rate: {
    duration_hours: number;
    price_euros: number;
  } | null;
}

// Countdown component
const CountdownTimer = ({ expiresAt, t }: { expiresAt: string; t: (key: string) => string }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const deadline = new Date(expiresAt).getTime();
      const distance = deadline - now;

      if (distance < 0) {
        setTimeRemaining(t('premiumRequestsPage.expired'));
        setIsUrgent(true);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      setIsUrgent(hours < 6); // Urgent if less than 6 hours
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, t]);

  return (
    <div className={`flex items-center gap-2 p-2 rounded-md ${isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'}`}>
      <Clock className="h-4 w-4" />
      <div>
        <p className="text-xs font-medium">{t('premiumRequestsPage.timeToAccept')}</p>
        <p className="text-sm font-bold">{timeRemaining}</p>
      </div>
    </div>
  );
};

const PremiumRequests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadMyProfile();
    loadRequests();
  }, [user, navigate]);

  const loadMyProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setMyProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('match_requests')
        .select(`
          id,
          sender_id,
          message,
          created_at,
          expires_at,
          is_premium,
          selected_rate_id,
          sender:profiles!fk_match_requests_sender(
            full_name,
            birth_date,
            profile_photo_url
          ),
          premium_rate:premium_rates!fk_match_requests_selected_rate(
            duration_hours,
            price_euros
          )
        `)
        .eq('receiver_id', user?.id)
        .eq('status', 'pending')
        .eq('is_premium', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data as any) || []);
    } catch (error) {
      console.error('Error loading premium requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      // Get request data to send email
      const request = requests.find(r => r.id === requestId);
      
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 72); // 72 hours to schedule the appointment

      const { error } = await supabase
        .from('match_requests')
        .update({
          status: 'accepted',
          appointment_deadline: deadline.toISOString(),
          chat_status: 'active',
        })
        .eq('id', requestId);

      if (error) throw error;

      // Send acceptance email and push notification to sender and receiver
      if (request) {
        try {
          await supabase.functions.invoke('send-request-accepted-email', {
            body: {
              senderId: request.sender_id,
              receiverId: user?.id,
              senderName: request.sender?.full_name || 'Utente',
              receiverName: myProfile?.full_name || 'Utente'
            }
          });
        } catch (emailError) {
          console.error('Failed to send acceptance email:', emailError);
          // Don't fail the whole operation if email fails
        }
      }

      toast({
        title: t('premiumRequestsPage.requestAccepted'),
        description: t('premiumRequestsPage.chatNowActive'),
      });

      loadRequests();
    } catch (error) {
      toast({
        title: t('premiumRequestsPage.error'),
        description: t('premiumRequestsPage.acceptError'),
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      // Get request data to refund token to sender
      const { data: requestData, error: fetchError } = await supabase
        .from('match_requests')
        .select('sender_id, is_premium')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      // Update request status to rejected
      const { error } = await supabase
        .from('match_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      // Token refund for rejected premium requests is handled automatically
      // by the database trigger refund_token_on_premium_reject.

      toast({
        title: t('premiumRequestsPage.requestRejected'),
        description: t('premiumRequestsPage.tokenRefunded'),
      });

      loadRequests();
    } catch (error) {
      toast({
        title: t('premiumRequestsPage.error'),
        description: t('premiumRequestsPage.rejectError'),
        variant: "destructive",
      });
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              {t('premiumRequestsPage.title')}
            </h1>
            <p className="text-muted-foreground">{t('premiumRequestsPage.subtitle')}</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">{t('premiumRequestsPage.noRequests')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="border-2 border-yellow-500/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {request.sender.profile_photo_url ? (
                        <img
                          src={request.sender.profile_photo_url}
                          alt={request.sender.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-2xl">👤</span>
                        </div>
                      )}
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {request.sender.full_name}, {calculateAge(request.sender.birth_date)}
                          <Badge className="bg-yellow-500 text-black">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        </CardTitle>
                        
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.expires_at && (
                    <CountdownTimer expiresAt={request.expires_at} t={t} />
                  )}
                  {request.premium_rate && (
                    <div className="bg-yellow-500/10 p-3 rounded-lg">
                      <p className="font-semibold">{t('premiumRequestsPage.selectedRate')}:</p>
                      <p className="text-sm">{request.premium_rate.duration_hours} {request.premium_rate.duration_hours === 1 ? t('premiumRates.hour') : t('premiumRates.hours')} - €{request.premium_rate.price_euros}</p>
                    </div>
                  )}
                  {request.message && (
                    <div>
                      <p className="text-sm font-semibold mb-1">{t('premiumRequestsPage.message')}:</p>
                      <p className="text-sm text-muted-foreground">{request.message}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('premiumRequestsPage.expiryWarning')}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAccept(request.id)}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {t('browse.accept')}
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t('browse.reject')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumRequests;
