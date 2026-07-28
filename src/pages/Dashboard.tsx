import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Calendar, Star, LogOut, Shield, MapPin, Crown, Bell, Bookmark, Share2, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { HowItWorksDialog } from '@/components/HowItWorksDialog';
import { showOneSignalPrompt, loginOneSignal, isPushEnabled } from '@/lib/onesignal';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { getReferralCode, clearReferralCode } from '@/lib/referral';

interface Profile {
  full_name: string;
  gender: string;
  is_verified: string;
  location_lat: number | null;
  location_lon: number | null;
  is_paused: boolean;
}

interface TokenBalance {
  amount: number;
}
const Dashboard = () => {
  const { t } = useTranslation();
  const { user, signOut, isPremium } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tokens, setTokens] = useState<TokenBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [premiumRequestsCount, setPremiumRequestsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [receivedRequestsCount, setReceivedRequestsCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [togglingPause, setTogglingPause] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadTokens();
      checkAdminRole();
      loadPremiumRequestsCount();
      loadUnreadMessagesCount();
      loadReceivedRequestsCount();
      loadFavoritesCount();
      loginOneSignal(user.id);
      checkNotificationStatus();
      updateLocationSilent();
      processReferral();
    }
  }, [user]);

  const processReferral = async () => {
    if (!user) return;
    const refCode = getReferralCode();
    if (!refCode) return;

    try {
      // Check if user is verified
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('is_verified, gender')
        .eq('id', user.id)
        .single();

      if (myProfile?.gender !== 'female' && myProfile?.is_verified !== 'verified') return;

      // Check if already referred
      const { data: existingRef } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_user_id', user.id)
        .maybeSingle();

      if (existingRef) {
        clearReferralCode();
        return;
      }

      // Find referrer by code
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', refCode)
        .maybeSingle();

      if (!referrer || referrer.id === user.id) {
        clearReferralCode();
        return;
      }

      // Create referral
      await supabase.from('referrals').insert({
        referrer_user_id: referrer.id,
        referred_user_id: user.id,
      });

      clearReferralCode();
    } catch (err) {
      console.error('Error processing referral:', err);
    }
  };

  const checkNotificationStatus = async () => {
    const enabled = await isPushEnabled();
    setNotificationsEnabled(enabled);
  };

  useEffect(() => {
    if (!user) return;

    // Realtime subscription for premium requests
    const premiumRequestsChannel = supabase
      .channel('premium-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_requests',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          loadPremiumRequestsCount();
          loadReceivedRequestsCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(premiumRequestsChannel);
    };
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, gender, is_verified, location_lat, location_lon, is_paused')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Errore nel caricamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  const loadTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('amount')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setTokens(data);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const loadPremiumRequestsCount = async () => {
    try {
      const { count, error } = await supabase
        .from('match_requests')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user?.id)
        .eq('is_premium', true)
        .eq('status', 'pending');

      if (error) throw error;
      setPremiumRequestsCount(count || 0);
    } catch (error) {
      console.error('Error loading premium requests count:', error);
    }
  };

  const loadUnreadMessagesCount = async () => {
    try {
      // Get all accepted matches for the user
      const { data: matches, error: matchesError } = await supabase
        .from('match_requests')
        .select('id')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`);

      if (matchesError) throw matchesError;

      if (!matches || matches.length === 0) {
        setUnreadMessagesCount(0);
        return;
      }

      // Count messages where user is not the sender
      const matchIds = matches.map(m => m.id);
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .in('match_request_id', matchIds)
        .neq('sender_id', user?.id);

      if (error) throw error;
      setUnreadMessagesCount(count || 0);
    } catch (error) {
      console.error('Error loading unread messages count:', error);
    }
  };

  const loadReceivedRequestsCount = async () => {
    try {
      const { count, error } = await supabase
        .from('match_requests')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user?.id)
        .eq('status', 'pending');

      if (error) throw error;
      setReceivedRequestsCount(count || 0);
    } catch (error) {
      console.error('Error loading received requests count:', error);
    }
  };

  const loadFavoritesCount = async () => {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      if (error) throw error;
      setFavoritesCount(count || 0);
    } catch (error) {
      console.error('Error loading favorites count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout effettuato');
    } catch (error) {
      toast.error('Errore durante il logout');
    }
  };

  const updateLocation = async (silent = false) => {
    if (!silent) setUpdatingLocation(true);

    if (!navigator.geolocation) {
      if (!silent) toast.error('Geolocalizzazione non supportata dal browser');
      setUpdatingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              location_lat: position.coords.latitude,
              location_lon: position.coords.longitude
            })
            .eq('id', user?.id);

          if (error) throw error;

          if (!silent) {
            toast.success('Posizione aggiornata con successo');
          }
          loadProfile();
        } catch (error: any) {
          if (!silent) toast.error('Errore nell\'aggiornamento della posizione');
        } finally {
          setUpdatingLocation(false);
        }
      },
      (error) => {
        // In modalità silenziosa non mostrare errori (l'utente potrebbe non aver concesso i permessi)
        if (!silent) {
          toast.error('Impossibile ottenere la posizione. Assicurati di aver dato i permessi.');
        }
        setUpdatingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const updateLocationSilent = () => updateLocation(true);

  const togglePause = async () => {
    if (!user || !profile) return;
    setTogglingPause(true);
    try {
      const newPaused = !profile.is_paused;
      const { error } = await supabase
        .from('profiles')
        .update({ is_paused: newPaused })
        .eq('id', user.id);
      if (error) throw error;
      setProfile({ ...profile, is_paused: newPaused });
      toast.success(newPaused ? t('dashboard.pauseEnabled', 'Profilo in pausa - non riceverai nuove richieste') : t('dashboard.pauseDisabled', 'Profilo riattivato - sei di nuovo visibile'));
    } catch (error) {
      console.error('Error toggling pause:', error);
      toast.error('Errore nell\'aggiornamento');
    } finally {
      setTogglingPause(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Admin-only dashboard
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <header className="bg-card border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Heart className="w-8 h-8 text-primary fill-primary" />
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  FlashMatch
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSelector />
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('dashboard.logout')}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {t('dashboard.adminDashboard')}
            </h2>
            <p className="text-muted-foreground">
              {t('dashboard.adminWelcome')}
            </p>
          </div>

          <Card className="p-6 bg-gradient-primary text-white">
            <Link to="/admin" className="block">
              <div className="flex items-center gap-4">
                <Shield className="w-12 h-12" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t('dashboard.adminPanel')}</h3>
                  <p className="text-sm opacity-90">
                    {t('dashboard.adminPanelDesc')}
                  </p>
                </div>
              </div>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                FlashMatch
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {profile?.gender === 'male' && (
                <Button
                  variant={profile?.is_paused ? "destructive" : "outline"}
                  size="icon"
                  onClick={togglePause}
                  disabled={togglingPause}
                  title={profile?.is_paused ? t('dashboard.resumeProfile', 'Riattiva profilo') : t('dashboard.pauseProfile', 'Metti in pausa')}
                >
                  {profile?.is_paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
              )}
              <LanguageSelector />
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('dashboard.logout')}
              </Button>
            </div>
          </div>
          {profile?.gender === 'male' && profile?.is_paused && (
            <div className="mb-2 px-3 py-2 rounded-md bg-destructive/10 text-destructive text-sm text-center font-medium">
              ⏸️ {t('dashboard.pauseBanner', 'Profilo in pausa - Il tuo profilo non è visibile e non riceverai nuove richieste')}
            </div>
          )}
          <Button
            onClick={() => updateLocation()}
            disabled={updatingLocation}
            className="w-full"
            variant="outline"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {updatingLocation ? t('dashboard.updating') : t('dashboard.updateLocation')}
          </Button>
          {!notificationsEnabled && (
            <Button
              onClick={async () => {
                await showOneSignalPrompt();
                checkNotificationStatus();
              }}
              variant="outline"
              className="w-full mt-2"
            >
              <Bell className="w-4 h-4 mr-2" />
              {t('dashboard.enableNotifications')}
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {t('dashboard.welcome')}, {profile?.full_name || 'Utente'}!
            </h2>
            <p className="text-muted-foreground">
              {t('dashboard.welcomeSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {profile && <HowItWorksDialog gender={profile.gender as 'male' | 'female'} />}
          </div>
        </div>

        {/* Location Warning Banner */}
        {profile && (profile.location_lat === null || profile.location_lon === null) && (
          <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  {t('dashboard.enableLocation')}
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
                  {t('dashboard.enableLocationDesc')}
                </p>
                <Button 
                  onClick={() => updateLocation()}
                  disabled={updatingLocation}
                  variant="default"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {updatingLocation ? t('dashboard.activating') : t('dashboard.activateLocation')}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {profile?.gender !== 'female' && profile?.is_verified !== 'verified' && (
          <Card className="p-6 mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  {t('dashboard.verifyIdentity')}
                </h3>
                <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-4">
                  {t('dashboard.verifyIdentityDesc')}
                </p>
                <Button variant="default" asChild>
                  <Link to="/verify">{t('dashboard.completeVerify')}</Link>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {profile?.gender === 'male' && tokens && (
          <Card className="p-6 mb-6 bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">{t('dashboard.tokenBalance')}</h3>
                <p className="text-2xl font-bold">{tokens.amount}</p>
              </div>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/buy-tokens">{t('dashboard.buyTokens')}</Link>
              </Button>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-glow transition-shadow">
            <Link to="/browse" className="block">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-12 h-12 text-primary" />
                {profile?.gender === 'male' && receivedRequestsCount > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    {receivedRequestsCount}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {profile?.gender === 'female' ? t('dashboard.discoverProfiles') : t('dashboard.incomingRequests')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {profile?.gender === 'female'
                  ? t('dashboard.discoverProfilesDesc')
                  : t('dashboard.incomingRequestsDesc')}
              </p>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-shadow">
            <Link to="/appointments" className="block">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-12 h-12 text-primary" />
                {unreadMessagesCount > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    {unreadMessagesCount}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('dashboard.myAppointments')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.myAppointmentsDesc')}
              </p>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-shadow">
            <Link to="/profile" className="block">
              <Heart className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t('dashboard.myProfile')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.myProfileDesc')}
              </p>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-shadow">
            <Link to="/favorites" className="block">
              <div className="flex items-center justify-between mb-4">
                <Bookmark className="w-12 h-12 text-primary" />
                {favoritesCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground">
                    {favoritesCount}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('dashboard.favorites')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.favoritesDesc')}
              </p>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-shadow">
            <Link to="/invite" className="block">
              <Share2 className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t('dashboard.inviteFriends', 'Invita Amici')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.inviteFriendsDesc', 'Invita amici e scala la classifica!')}
              </p>
            </Link>
          </Card>
        </div>

        {/* Premium Section - Female Non-Premium */}
        {profile?.gender === 'female' && !isPremium && (
          <div className="space-y-4 mb-8">
            <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-2 border-yellow-500/20">
              <Link to="/premium-subscription" className="block">
                <div className="flex items-center gap-4">
                  <Crown className="w-12 h-12 text-yellow-500" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                      {t('dashboard.becomePremium')}
                      <Badge className="bg-yellow-500 text-black">{t('dashboard.new')}</Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.becomePremiumDesc')}
                    </p>
                  </div>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                    {t('common.learnMore')}
                  </Button>
                </div>
              </Link>
            </Card>
            <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/20">
              <Link to="/free-premium-request" className="block">
                <div className="flex items-center gap-4">
                  <Crown className="w-12 h-12 text-purple-500" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                      Premium Gratuito per Influencer
                      <Badge className="bg-purple-500 text-white">Gratis</Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Hai 200k+ follower su Instagram o 1k+ ❤️? Ottieni Premium a vita gratis!
                    </p>
                  </div>
                </div>
              </Link>
            </Card>
          </div>
        )}

        {/* Premium Section - Female Premium */}
        {profile?.gender === 'female' && isPremium && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-2 border-yellow-500/20">
            <div className="flex items-center gap-4">
              <Crown className="w-12 h-12 text-yellow-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                  {t('dashboard.premiumAccountActive')}
                  <Badge className="bg-yellow-500 text-black">Premium</Badge>
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('dashboard.managePremiumDesc')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/premium-rates">{t('dashboard.manageRates')}</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="relative">
                    <Link to="/premium-requests">
                      {t('dashboard.premiumRequests')}
                      {premiumRequestsCount > 0 && (
                        <Badge className="ml-2 bg-destructive text-destructive-foreground">
                          {premiumRequestsCount}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/premium-subscription">{t('dashboard.manageSubscription')}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {profile?.gender === 'male' && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-2 border-yellow-500/20">
            {profile?.is_verified === 'verified' ? (
              <Link to="/premium-profiles" className="block">
                <div className="flex items-center gap-4">
                  <Crown className="w-12 h-12 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('dashboard.premiumProfiles')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.premiumProfilesDesc')}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-4 opacity-60">
                <Crown className="w-12 h-12 text-yellow-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{t('dashboard.premiumProfiles')}</h3>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400">
                      {t('dashboard.verificationRequired')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.premiumProfilesVerifyDesc')}
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;