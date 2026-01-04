import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, ArrowLeft, MapPin, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfileDetailsDialog from '@/components/ProfileDetailsDialog';
import { toast as sonnerToast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SwipeView from '@/components/SwipeView';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';

interface Profile {
  id: string;
  full_name: string;
  bio: string | null;
  birth_date: string;
  location_city: string;
  gender: string;
  profile_photo_url: string | null;
  photo_verification_status: string;
  location_lat: number | null;
  location_lon: number | null;
  is_premium?: boolean;
  distance?: number;
  positive_reviews_count?: number;
  negative_reviews_count?: number;
}

interface MatchRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  message: string | null;
  created_at: string;
  expires_at?: string;
  sender_profile?: Profile;
}

const RequestTimer = ({ createdAt, expiresAt, t }: { createdAt: string; expiresAt?: string; t: (key: string) => string }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      let expires;
      if (expiresAt) {
        expires = new Date(expiresAt).getTime();
      } else {
        const created = new Date(createdAt).getTime();
        expires = created + 1 * 60 * 60 * 1000;
      }

      const now = new Date().getTime();
      const difference = expires - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(t('browse.expired'));
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}g ${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [createdAt, expiresAt, t]);

  return (
    <div className={`text-sm font-medium mb-1 text-center ${isExpired ? 'text-destructive' : 'text-orange-500'}`}>
      {isExpired ? t('browse.expiredRequest') : `${t('browse.expiresIn')}: ${timeLeft}`}
    </div>
  );
};

const Browse = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [respondingToRequest, setRespondingToRequest] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [skippedProfiles, setSkippedProfiles] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadMyProfile();
      loadFavorites();
    }
  }, [user]);

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
        sonnerToast.success('Rimosso dai preferiti');
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, favorite_user_id: profileId });
      
      if (!error) {
        setFavorites(prev => [...prev, profileId]);
        sonnerToast.success('Aggiunto ai preferiti');
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

      if (data.gender === 'female') {
        loadNearbyProfiles(data);
      } else if (data.gender === 'male') {
        loadMatchRequests();
      }
    } catch (error: any) {
      toast({
        title: t('common2.error'),
        description: t('browse.loadProfileError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyProfiles = async (myProfile: Profile) => {
    if (!myProfile.location_lat || !myProfile.location_lon) {
      toast({
        title: t('browse.locationNotAvailable'),
        description: t('browse.updateLocationMessage'),
        variant: "destructive"
      });
      return;
    }

    try {
      // First, get users who have blocked me
      const { data: blockedByData } = await supabase
        .from('blocked_users')
        .select('blocker_id')
        .eq('blocked_id', user?.id);
      
      const blockedByIds = blockedByData?.map(b => b.blocker_id) || [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('gender', 'male')
        .eq('photo_verification_status', 'verified')
        .not('location_lat', 'is', null)
        .not('location_lon', 'is', null);

      if (error) throw error;

      const myAge = calculateAge(myProfile.birth_date);

      const profilesWithDistance = data
        .filter((profile: any) => !blockedByIds.includes(profile.id)) // Filter out users who blocked me
        .map((profile: any) => {
          const distance = calculateDistance(
            myProfile.location_lat!,
            myProfile.location_lon!,
            profile.location_lat,
            profile.location_lon
          );
          return { ...profile, distance };
        })
        .filter((profile: any) => {
          // Filter by distance
          if (profile.distance > 20) return false;

          // Filter by age preferences: check if my age falls within the profile's age preferences
          if (profile.min_age_preference !== null && myAge < profile.min_age_preference) {
            return false;
          }
          if (profile.max_age_preference !== null && myAge > profile.max_age_preference) {
            return false;
          }

          return true;
        })
        .sort((a: any, b: any) => a.distance - b.distance);

      setProfiles(profilesWithDistance);

      // Fetch pending requests sent by me to these profiles
      const profileIds = profilesWithDistance.map((p: any) => p.id);
      if (profileIds.length > 0) {
        const { data: requests, error: requestsError } = await supabase
          .from('match_requests')
          .select('receiver_id')
          .eq('sender_id', user?.id)
          .eq('status', 'pending')
          .in('receiver_id', profileIds);

        if (!requestsError && requests) {
          const pendingReceiverIds = requests.map((r: any) => r.receiver_id);
          setSentRequests(pendingReceiverIds);
        }
      }
    } catch (error: any) {
      toast({
        title: t('common2.error'),
        description: t('browse.loadProfilesError'),
        variant: "destructive"
      });
    }
  };

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

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const loadMatchRequests = async () => {
    try {
      const { data: requests, error: requestsError } = await supabase
        .from('match_requests')
        .select('*')
        .eq('receiver_id', user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      if (!requests || requests.length === 0) {
        setMatchRequests([]);
        return;
      }

      // Get sender profiles
      const senderIds = requests.map(r => r.sender_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', senderIds);

      if (profilesError) throw profilesError;

      // Merge requests with profiles
      const requestsWithProfiles = requests.map(request => ({
        ...request,
        sender_profile: profiles?.find(p => p.id === request.sender_id)
      }));

      setMatchRequests(requestsWithProfiles);
    } catch (error: any) {
      toast({
        title: t('common2.error'),
        description: t('browse.loadRequestsError'),
        variant: "destructive"
      });
    }
  };

  const sendMatchRequest = async (receiverId: string) => {
    setSendingRequest(receiverId);
    try {
      // Check if receiver has blocked me
      const { data: blockCheck } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', receiverId)
        .eq('blocked_id', user?.id)
        .maybeSingle();

      if (blockCheck) {
        toast({
          title: t('browse.cannotSendRequest'),
          description: t('browse.blockedByUser'),
          variant: "destructive"
        });
        // Remove from visible profiles
        setProfiles(prev => prev.filter(p => p.id !== receiverId));
        setSendingRequest(null);
        return;
      }

      // Check for existing pending request
      const { data: existingRequest, error: existingRequestError } = await supabase
        .from('match_requests')
        .select('id')
        .eq('sender_id', user?.id)
        .eq('receiver_id', receiverId)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingRequestError) throw existingRequestError;

      if (existingRequest) {
        toast({
          title: t('favorites.requestAlreadySent'),
          description: t('favorites.alreadyPendingRequest'),
          variant: "destructive"
        });
        setSendingRequest(null);
        return;
      }

      const { error } = await supabase
        .from('match_requests')
        .insert({
          sender_id: user?.id,
          receiver_id: receiverId,
          status: 'pending',
          expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString() // 1 hour for testing (was 48 hours)
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
        // Don't throw - email failure shouldn't block the request
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

  const handleSkipProfile = (profileId: string) => {
    setSkippedProfiles(prev => [...prev, profileId]);
  };

  const swipeProfiles = profiles.filter(p => !skippedProfiles.includes(p.id) && !sentRequests.includes(p.id));

  const respondToRequest = async (requestId: string, action: 'accepted' | 'rejected', blockUser: boolean = false) => {
    setRespondingToRequest(requestId);
    try {
      const request = matchRequests.find(r => r.id === requestId);
      if (!request) throw new Error("Richiesta non trovata");

      // Get full request details including is_premium flag
      const { data: requestData, error: requestFetchError } = await supabase
        .from('match_requests')
        .select('is_premium, sender_id')
        .eq('id', requestId)
        .single();

      if (requestFetchError) throw requestFetchError;

      // Update match request status
      const updateData: any = { status: action };

      if (action === 'accepted') {
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 1); // 1 hour for testing (was 72 hours)
        updateData.appointment_deadline = deadline.toISOString();
        updateData.chat_status = 'active';
      }

      const { error: updateError } = await supabase
        .from('match_requests')
        .update(updateData)
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If rejecting a premium request and the current user is premium, refund token to sender
      if (action === 'rejected' && requestData.is_premium && myProfile?.is_premium) {
        const { data: senderTokenData, error: senderTokenFetchError } = await supabase
          .from('tokens')
          .select('amount')
          .eq('user_id', requestData.sender_id)
          .single();

        if (senderTokenFetchError) {
          console.error("Error fetching sender tokens:", senderTokenFetchError);
        } else {
          const { error: tokenRefundError } = await supabase
            .from('tokens')
            .update({
              amount: senderTokenData.amount + 1,
              last_updated: new Date().toISOString()
            })
            .eq('user_id', requestData.sender_id);

          if (tokenRefundError) {
            console.error("Error refunding token:", tokenRefundError);
          }
        }
      }

      // If rejecting (non-premium request), deduct token from receiver
      if (action === 'rejected' && !requestData.is_premium) {
        const { data: tokenData, error: tokenFetchError } = await supabase
          .from('tokens')
          .select('amount')
          .eq('user_id', user?.id)
          .single();

        if (tokenFetchError) throw tokenFetchError;

        if (tokenData.amount < 1) {
          throw new Error(t('profile.notEnoughTokens'));
        }

        const { error: tokenUpdateError } = await supabase
          .from('tokens')
          .update({ amount: tokenData.amount - 1 })
          .eq('user_id', user?.id);

        if (tokenUpdateError) throw tokenUpdateError;
      }

      // If blocking, add to blocked_users
      if (blockUser) {
        const { error: blockError } = await supabase
          .from('blocked_users')
          .insert({
            blocker_id: user?.id,
            blocked_id: request.sender_id
          });

        if (blockError) throw blockError;
      }

      // Send email and push notification if accepted
      if (action === 'accepted') {
        try {
          await supabase.functions.invoke('send-request-accepted-email', {
            body: {
              senderId: request.sender_id,
              receiverId: user?.id,
              senderName: request.sender_profile?.full_name || 'Utente',
              receiverName: myProfile?.full_name || 'Utente'
            }
          });
        } catch (emailError) {
          console.error('Failed to send acceptance email:', emailError);
          // Don't fail the whole operation if email fails
        }
      }

      toast({
        title: action === 'accepted' ? t('browse.requestAccepted') : blockUser ? t('browse.userBlocked') : t('browse.requestRejected'),
        description: action === 'accepted'
          ? t('browse.canProceedAppointment')
          : blockUser
            ? t('browse.userBlockedDesc')
            : requestData.is_premium && myProfile?.is_premium
              ? t('browse.premiumRejectedRefunded')
              : t('browse.requestRejectedDesc')
      });

      loadMatchRequests();
    } catch (error: any) {
      toast({
        title: t('common2.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setRespondingToRequest(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <p className="text-lg">{t('common2.loading')}</p>
      </div>
    );
  }

  if (myProfile?.gender === 'male') {
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
            <LanguageSelector />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">{t('browse.incomingRequests')}</h2>

          {matchRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {t('browse.noRequestsFound')}
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchRequests.map((request) => (
                <Card
                  key={request.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    if (request.sender_profile) {
                      setSelectedProfile(request.sender_profile);
                      setShowProfileDialog(true);
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={request.sender_profile?.profile_photo_url || undefined} />
                        <AvatarFallback>
                          {request.sender_profile?.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-center">{request.sender_profile?.full_name}</CardTitle>
                    <div className="flex items-center justify-center gap-4 my-2">
                      <div className="flex items-center gap-1 text-green-600">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{request.sender_profile?.positive_reviews_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <ThumbsDown className="w-4 h-4" />
                        <span className="text-sm font-medium">{request.sender_profile?.negative_reviews_count || 0}</span>
                      </div>
                    </div>
                    <CardDescription className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" />
                        {request.sender_profile?.birth_date && calculateAge(request.sender_profile.birth_date)} {t('browse.years')}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {request.sender_profile?.distance !== undefined 
                          ? `${request.sender_profile.distance.toFixed(1)} ${t('browse.km')}`
                          : t('browse.distanceNotAvailable')}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent onClick={(e) => e.stopPropagation()}>
                    {request.sender_profile?.bio && (
                      <p className="text-sm text-muted-foreground mb-4 text-center line-clamp-2">
                        {request.sender_profile.bio}
                      </p>
                    )}
                    <div className="flex flex-col gap-2">
                      <RequestTimer createdAt={request.created_at} expiresAt={request.expires_at} t={t} />
                      <Button
                        onClick={() => respondToRequest(request.id, 'accepted', false)}
                        disabled={respondingToRequest === request.id}
                        className="w-full"
                        variant="default"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        {t('browse.accept')}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => respondToRequest(request.id, 'rejected', false)}
                          disabled={respondingToRequest === request.id}
                          className="flex-1"
                          variant="outline"
                        >
                          {t('browse.reject')}
                        </Button>
                        <Button
                          onClick={() => respondToRequest(request.id, 'rejected', true)}
                          disabled={respondingToRequest === request.id}
                          className="flex-1"
                          variant="destructive"
                        >
                          {t('browse.rejectAndBlock')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedProfile && (
            <ProfileDetailsDialog
              open={showProfileDialog}
              onOpenChange={setShowProfileDialog}
              profile={selectedProfile}
            />
          )}
        </main>
      </div>
    );
  }

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
          <LanguageSelector />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">{t('browse.nearbyProfiles')}</h2>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="grid">{t('browse.grid')}</TabsTrigger>
            <TabsTrigger value="swipe">{t('browse.swipe')}</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            {profiles.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {t('browse.noProfilesFound')}
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                  <Card
                    key={profile.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setSelectedProfile(profile);
                      setShowProfileDialog(true);
                    }}
                  >
                    <CardHeader className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10"
                        onClick={(e) => toggleFavorite(profile.id, e)}
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(profile.id) ? 'fill-primary text-primary' : ''}`} />
                      </Button>
                      <div className="flex justify-center mb-4">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={profile.profile_photo_url || undefined} />
                          <AvatarFallback>
                            {profile.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <CardTitle className="text-center">{profile.full_name}</CardTitle>
                      <div className="flex items-center justify-center gap-4 my-2">
                        <div className="flex items-center gap-1 text-green-600">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm font-medium">{profile.positive_reviews_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-sm font-medium">{profile.negative_reviews_count || 0}</span>
                        </div>
                      </div>
                      <CardDescription className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Calendar className="w-4 h-4" />
                          {calculateAge(profile.birth_date)} {t('browse.years')}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {profile.distance?.toFixed(1)} {t('browse.km')}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent onClick={(e) => e.stopPropagation()}>
                      {profile.bio && (
                        <p className="text-sm text-muted-foreground mb-4 text-center line-clamp-2">
                          {profile.bio}
                        </p>
                      )}
                      <Button
                        onClick={() => sendMatchRequest(profile.id)}
                        disabled={sendingRequest === profile.id || sentRequests.includes(profile.id)}
                        className="w-full"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        {sendingRequest === profile.id ? t('browse.sending') : sentRequests.includes(profile.id) ? t('browse.requestSent') : t('browse.sendRequest')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="swipe">
            <SwipeView
              profiles={swipeProfiles}
              sentRequests={sentRequests}
              onSendRequest={sendMatchRequest}
              onSkip={handleSkipProfile}
            />
          </TabsContent>
        </Tabs>

        {selectedProfile && (
          <ProfileDetailsDialog
            open={showProfileDialog}
            onOpenChange={setShowProfileDialog}
            profile={selectedProfile}
          />
        )}
      </main>
    </div>
  );
};

export default Browse;
