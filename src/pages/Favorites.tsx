import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Crown, ThumbsUp, ThumbsDown, Heart, Trash2, Send } from 'lucide-react';
import ProfileDetailsDialog from '@/components/ProfileDetailsDialog';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

interface Profile {
  id: string;
  full_name: string;
  birth_date: string;
  bio: string | null;
  profile_photo_url: string | null;
  is_premium: boolean;
  gender: string;
  positive_reviews_count?: number;
  negative_reviews_count?: number;
  distance?: number;
}

interface PremiumRate {
  id: string;
  duration_hours: number;
  price_euros: number;
  description: string | null;
}

interface Favorite {
  id: string;
  favorite_user_id: string;
  created_at: string;
  profile: Profile;
}

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [myProfile, setMyProfile] = useState<{ gender: string; full_name: string; location_lat: number | null; location_lon: number | null } | null>(null);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  
  // Premium request dialog state (for male users)
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
  const [selectedPremiumProfile, setSelectedPremiumProfile] = useState<Profile | null>(null);
  const [premiumRates, setPremiumRates] = useState<PremiumRate[]>([]);
  const [selectedRateId, setSelectedRateId] = useState<string>('');
  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadMyProfile();
    loadFavorites();
  }, [user, navigate]);

  const loadMyProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('gender, full_name, location_lat, location_lon')
      .eq('id', user?.id)
      .single();
    if (data) setMyProfile(data);
  };

  const toRad = (deg: number) => deg * (Math.PI / 180);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const loadSentRequests = async (profileIds: string[]) => {
    if (profileIds.length === 0) return;
    const { data } = await supabase
      .from('match_requests')
      .select('receiver_id')
      .eq('sender_id', user?.id)
      .eq('status', 'pending')
      .in('receiver_id', profileIds);
    if (data) {
      setSentRequests(data.map(r => r.receiver_id));
    }
  };

  const loadFavorites = async () => {
    try {
      // First load my profile to get coordinates
      const { data: myProfileData } = await supabase
        .from('profiles')
        .select('location_lat, location_lon')
        .eq('id', user?.id)
        .single();

      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('id, favorite_user_id, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (favoritesError) throw favoritesError;

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Get profile details for each favorite
      const profileIds = favoritesData.map(f => f.favorite_user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds);

      if (profilesError) throw profilesError;

      const favoritesWithProfiles = favoritesData.map(fav => {
        const profile = profilesData?.find(p => p.id === fav.favorite_user_id);
        if (!profile) return null;
        
        // Calculate distance if both profiles have coordinates
        let distance: number | undefined = undefined;
        if (myProfileData?.location_lat && myProfileData?.location_lon && 
            profile.location_lat && profile.location_lon) {
          distance = calculateDistance(
            myProfileData.location_lat,
            myProfileData.location_lon,
            profile.location_lat,
            profile.location_lon
          );
        }
        
        return {
          ...fav,
          profile: { ...profile, distance }
        };
      }).filter(f => f !== null) as Favorite[];

      setFavorites(favoritesWithProfiles);
      
      // Load sent requests for these profiles
      await loadSentRequests(profileIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast({
        title: t('common2.error'),
        description: t('favorites.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovingId(favoriteId);
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({
        title: t('favorites.removedFromFavorites'),
        description: t('favorites.profileRemoved'),
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: t('common2.error'),
        description: t('favorites.removeError'),
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
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

  // Send normal request (for female users)
  const sendNormalRequest = async (receiverId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSendingRequest(receiverId);
    try {
      // Check for existing pending request
      const { data: existingRequest } = await supabase
        .from('match_requests')
        .select('id')
        .eq('sender_id', user?.id)
        .eq('receiver_id', receiverId)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingRequest) {
        toast({
          title: t('favorites.requestAlreadySent'),
          description: t('favorites.alreadyPendingRequest'),
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('match_requests')
        .insert({
          sender_id: user?.id,
          receiver_id: receiverId,
          status: 'pending',
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke('send-match-request-email', {
          body: {
            receiverId,
            senderName: myProfile?.full_name || 'Utente'
          }
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }

      toast({
        title: t('browse.requestSentTitle'),
        description: t('browse.requestSentDesc')
      });
      setSentRequests(prev => [...prev, receiverId]);
    } catch (error: any) {
      toast({
        title: t('common2.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSendingRequest(null);
    }
  };

  // Open premium request dialog (for male users)
  const openPremiumDialog = async (profile: Profile, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPremiumProfile(profile);
    setLoadingRates(true);
    setPremiumDialogOpen(true);

    // Load premium rates for this profile
    const { data: rates } = await supabase
      .from('premium_rates')
      .select('*')
      .eq('user_id', profile.id)
      .order('duration_hours', { ascending: true });

    setPremiumRates(rates || []);
    setLoadingRates(false);
  };

  // Send premium request (for male users)
  const sendPremiumRequest = async () => {
    if (!selectedPremiumProfile || !selectedRateId) return;
    
    setSendingRequest(selectedPremiumProfile.id);
    try {
      // Check token balance
      const { data: tokenData, error: tokenError } = await supabase
        .from('tokens')
        .select('amount')
        .eq('user_id', user?.id)
        .single();

      if (tokenError) throw tokenError;
      if (!tokenData || tokenData.amount < 1) {
        toast({
          title: t('profile.notEnoughTokensTitle'),
          description: t('favorites.needOneToken'),
          variant: "destructive"
        });
        return;
      }

      // Check for existing pending request
      const { data: existingRequest } = await supabase
        .from('match_requests')
        .select('id')
        .eq('sender_id', user?.id)
        .eq('receiver_id', selectedPremiumProfile.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingRequest) {
        toast({
          title: t('favorites.requestAlreadySent'),
          description: t('favorites.alreadyPendingRequest'),
          variant: "destructive"
        });
        return;
      }

      // Deduct token
      const { error: tokenUpdateError } = await supabase
        .from('tokens')
        .update({ amount: tokenData.amount - 1, last_updated: new Date().toISOString() })
        .eq('user_id', user?.id);

      if (tokenUpdateError) throw tokenUpdateError;

      // Create premium request
      const { error: requestError } = await supabase
        .from('match_requests')
        .insert({
          sender_id: user?.id,
          receiver_id: selectedPremiumProfile.id,
          status: 'pending',
          is_premium: true,
          selected_rate_id: selectedRateId,
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        });

      if (requestError) {
        // Rollback token
        await supabase
          .from('tokens')
          .update({ amount: tokenData.amount, last_updated: new Date().toISOString() })
          .eq('user_id', user?.id);
        throw requestError;
      }

      // Send email notification
      try {
        await supabase.functions.invoke('send-match-request-email', {
          body: {
            receiverId: selectedPremiumProfile.id,
            senderName: myProfile?.full_name || 'Utente',
            isPremium: true
          }
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }

      toast({
        title: t('favorites.premiumRequestSent'),
        description: t('favorites.premiumRequestSentDesc')
      });
      setSentRequests(prev => [...prev, selectedPremiumProfile.id]);
      setPremiumDialogOpen(false);
      setSelectedPremiumProfile(null);
      setSelectedRateId('');
    } catch (error: any) {
      toast({
        title: t('common2.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSendingRequest(null);
    }
  };

  const canSendRequest = (profile: Profile): boolean => {
    // Can't send to profiles that already have pending requests
    if (sentRequests.includes(profile.id)) return false;
    
    // Female users can send to male profiles
    if (myProfile?.gender === 'female' && profile.gender === 'male') return true;
    
    // Male users can send premium requests to premium female profiles
    if (myProfile?.gender === 'male' && profile.gender === 'female' && profile.is_premium) return true;
    
    return false;
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
              <Heart className="h-8 w-8 text-primary fill-primary" />
              {t('favorites.title')}
            </h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? t('favorites.savedProfile') : t('favorites.savedProfiles')}
            </p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-4">{t('favorites.noFavorites')}</p>
              <Button asChild>
                <Link to="/browse">{t('favorites.discoverProfiles')}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((favorite) => (
              <Card
                key={favorite.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
                onClick={() => {
                  setSelectedProfile(favorite.profile);
                  setDialogOpen(true);
                }}
              >
                <div className="aspect-square relative">
                  {favorite.profile.profile_photo_url ? (
                    <img
                      src={favorite.profile.profile_photo_url}
                      alt={favorite.profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <span className="text-4xl text-muted-foreground">👤</span>
                    </div>
                  )}
                  {favorite.profile.is_premium && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 left-2 h-8 w-8"
                    onClick={(e) => removeFavorite(favorite.id, e)}
                    disabled={removingId === favorite.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{favorite.profile.full_name}, {calculateAge(favorite.profile.birth_date)}</span>
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 mb-1">
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{favorite.profile.positive_reviews_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-sm font-medium">{favorite.profile.negative_reviews_count || 0}</span>
                    </div>
                  </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {favorite.profile.distance !== undefined 
                        ? `${favorite.profile.distance.toFixed(1)} ${t('browse.km')}`
                        : t('browse.distanceNotAvailable')}
                    </div>
                </CardHeader>
                <CardContent>
                  {favorite.profile.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{favorite.profile.bio}</p>
                  )}
                  
                  {canSendRequest(favorite.profile) && (
                    <Button
                      className="w-full"
                      size="sm"
                      disabled={sendingRequest === favorite.profile.id || sentRequests.includes(favorite.profile.id)}
                      onClick={(e) => {
                        if (myProfile?.gender === 'female') {
                          sendNormalRequest(favorite.profile.id, e);
                        } else {
                          openPremiumDialog(favorite.profile, e);
                        }
                      }}
                    >
                      {sendingRequest === favorite.profile.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : sentRequests.includes(favorite.profile.id) ? (
                        t('browse.requestSent')
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {myProfile?.gender === 'male' ? t('favorites.sendPremiumRequest') : t('favorites.sendRequest')}
                        </>
                      )}
                    </Button>
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
        />
      )}

      <Dialog open={premiumDialogOpen} onOpenChange={setPremiumDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('favorites.sendPremiumRequest')}</DialogTitle>
            <DialogDescription>
              {t('favorites.selectRateDesc')} {selectedPremiumProfile?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {loadingRates ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : premiumRates.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {t('favorites.noRatesAvailable')}
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>{t('favorites.selectRate')}</Label>
                <Select value={selectedRateId} onValueChange={setSelectedRateId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('favorites.selectRate')} />
                  </SelectTrigger>
                  <SelectContent>
                    {premiumRates.map(rate => (
                      <SelectItem key={rate.id} value={rate.id}>
                        {rate.duration_hours}h - €{rate.price_euros} {rate.description ? `(${rate.description})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPremiumDialogOpen(false)}>
              {t('favorites.cancel')}
            </Button>
            <Button 
              onClick={sendPremiumRequest}
              disabled={!selectedRateId || sendingRequest === selectedPremiumProfile?.id}
            >
              {sendingRequest === selectedPremiumProfile?.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : null}
              {t('favorites.send')} (1 {t('dashboard.tokens').toLowerCase().slice(0, -1)})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Favorites;