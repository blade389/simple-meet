import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Crown, ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import ProfileDetailsDialog from '@/components/ProfileDetailsDialog';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Profile {
  id: string;
  full_name: string;
  birth_date: string;
  bio: string | null;
  profile_photo_url: string | null;
  is_premium: boolean;
  positive_reviews_count?: number;
  negative_reviews_count?: number;
  distance?: number;
}

interface PremiumRate {
  id: string;
  duration_hours: number;
  price_euros: number;
}

const PremiumProfiles = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (selectedProfile && user) {
      checkPendingRequest(selectedProfile.id);
    }
  }, [selectedProfile, user]);

  const checkPendingRequest = async (receiverId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('match_requests')
      .select('id')
      .eq('sender_id', user.id)
      .eq('receiver_id', receiverId)
      .eq('status', 'pending')
      .maybeSingle();

    setIsRequestPending(!!data);
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadMyProfile();
    loadProfiles();
    loadFavorites();
  }, [user, navigate]);

  const loadFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('favorites')
      .select('favorite_user_id')
      .eq('user_id', user.id);
    if (data) {
      setFavorites(data.map(f => f.favorite_user_id));
    }
  };

  const toggleFavorite = async (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const isFavorite = favorites.includes(profileId);
    
    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('favorite_user_id', profileId);
      
      if (!error) {
        setFavorites(prev => prev.filter(id => id !== profileId));
        sonnerToast.success(t('premiumProfiles.removedFromFavorites'));
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, favorite_user_id: profileId });
      
      if (!error) {
        setFavorites(prev => [...prev, profileId]);
        sonnerToast.success(t('premiumProfiles.addedToFavorites'));
      }
    }
  };

  const loadMyProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setMyProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('gender', 'female')
        .eq('is_premium', true)
        .eq('is_blocked', false);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading premium profiles:', error);
    } finally {
      setLoading(false);
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

  const handleSendRequest = async (selectedRateId?: string, message?: string) => {
    if (!user || !selectedProfile) return;

    try {
      // Check for existing pending request
      const { data: existingRequest, error: existingRequestError } = await supabase
        .from('match_requests')
        .select('id')
        .eq('sender_id', user.id)
        .eq('receiver_id', selectedProfile.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingRequestError) throw existingRequestError;

      if (existingRequest) {
        toast({
          title: t('premiumProfiles.requestAlreadySent'),
          description: t('premiumProfiles.requestAlreadySentDesc'),
          variant: "destructive"
        });
        return;
      }

      // Check token balance first
      const { data: tokenData, error: tokenFetchError } = await supabase
        .from('tokens')
        .select('amount')
        .eq('user_id', user.id)
        .single();

      if (tokenFetchError) throw tokenFetchError;

      if (!tokenData || tokenData.amount < 1) {
        toast({
          title: t('premiumProfiles.insufficientTokens'),
          description: t('premiumProfiles.insufficientTokensDesc'),
          variant: 'destructive',
        });
        return;
      }

      // Deduct 1 token
      const { error: tokenUpdateError } = await supabase
        .from('tokens')
        .update({ amount: tokenData.amount - 1, last_updated: new Date().toISOString() })
        .eq('user_id', user.id);

      if (tokenUpdateError) throw tokenUpdateError;

      // Create match request
      const { error: requestError } = await supabase
        .from('match_requests')
        .insert({
          sender_id: user.id,
          receiver_id: selectedProfile.id,
          is_premium: true,
          selected_rate_id: selectedRateId,
          message: message,
          status: 'pending',
          expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString() // 1 hour for testing (was 48 hours)
        });

      if (requestError) {
        // Rollback token deduction if request creation fails
        await supabase
          .from('tokens')
          .update({ amount: tokenData.amount, last_updated: new Date().toISOString() })
          .eq('user_id', user.id);
        throw requestError;
      }

      // Send email notification
      try {
        await supabase.functions.invoke('send-match-request-email', {
          body: {
            receiverId: selectedProfile.id,
            senderName: myProfile?.full_name || 'Utente',
            isPremium: true,
          },
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't throw - email failure shouldn't block the request
      }

      toast({
        title: t('premiumProfiles.requestSent'),
        description: t('premiumProfiles.requestSentDesc'),
      });
      setIsRequestPending(true);

      loadProfiles();
    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: t('common2.error'),
        description: t('premiumProfiles.requestError'),
        variant: 'destructive',
      });
    }
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              {t('premiumProfiles.title')}
            </h1>
            <p className="text-muted-foreground">{t('premiumProfiles.subtitle')}</p>
          </div>
        </div>

        {profiles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">{t('premiumProfiles.noProfiles')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <Card
                key={profile.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-2 border-yellow-500/20"
                onClick={() => {
                  setSelectedProfile(profile);
                  setDialogOpen(true);
                }}
              >
                <div className="aspect-square relative">
                  {profile.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <span className="text-4xl text-muted-foreground">👤</span>
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 bg-background/80 hover:bg-background"
                    onClick={(e) => toggleFavorite(profile.id, e)}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(profile.id) ? 'fill-primary text-primary' : ''}`} />
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{profile.full_name}, {calculateAge(profile.birth_date)}</span>
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 mb-1">
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{profile.positive_reviews_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-sm font-medium">{profile.negative_reviews_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.distance !== undefined ? `${profile.distance.toFixed(1)} km` : t('premiumProfiles.distanceNotAvailable')}
                  </div>
                </CardHeader>
                <CardContent>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedProfile && (
        <ProfileDetailsDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setSelectedProfile(null);
          }}
          profile={{
            id: selectedProfile.id,
            full_name: selectedProfile.full_name,
            bio: selectedProfile.bio,
            birth_date: selectedProfile.birth_date,
            profile_photo_url: selectedProfile.profile_photo_url,
            is_premium: selectedProfile.is_premium,
            distance: selectedProfile.distance,
            positive_reviews_count: selectedProfile.positive_reviews_count,
            negative_reviews_count: selectedProfile.negative_reviews_count
          }}
          onSendRequest={handleSendRequest}
          showSendRequest={true}
          isRequestPending={isRequestPending}
        />
      )}
    </div>
  );
};

export default PremiumProfiles;
