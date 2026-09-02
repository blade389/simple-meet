import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Users, Trophy, Share2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LAUNCH_AT } from '@/lib/prelaunch';
import SEOHead from '@/components/SEOHead';
import { useTranslation } from 'react-i18next';

const PreLaunch = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, LAUNCH_AT.getTime() - Date.now());
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('referral_code').eq('id', user.id).single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  return (
    <>
      <SEOHead title="FlashMatch - Lancio 10 Luglio 2026" description="Prepara il tuo profilo e invita amici per vincere premi!" canonicalPath="/prelaunch" noindex />
      <div className="min-h-screen bg-gradient-hero">
        <header className="border-b bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">FlashMatch</span>
            </Link>
            {user ? (
              <Link to="/profile"><Button variant="outline">{t('dashboard.myProfile')}</Button></Link>
            ) : (
              <Link to="/auth"><Button variant="hero">{t('common.signup')}</Button></Link>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          {/* Countdown */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              FlashMatch — {t('prelaunch.title', 'Il lancio è quasi qui!')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('prelaunch.subtitle', 'Prepara il tuo profilo, invita amici e vinci premi!')}
            </p>
            <div className="flex justify-center gap-4 mb-8">
              {[
                { val: countdown.days, label: t('prelaunch.days', 'Giorni') },
                { val: countdown.hours, label: t('prelaunch.hours', 'Ore') },
                { val: countdown.minutes, label: t('prelaunch.minutes', 'Minuti') },
                { val: countdown.seconds, label: t('prelaunch.seconds', 'Secondi') },
              ].map(({ val, label }) => (
                <Card key={label} className="p-4 min-w-[80px] bg-card shadow-card">
                  <div className="text-3xl font-bold text-primary">{val}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <Clock className="inline w-4 h-4 mr-1" />
              {t('prelaunch.launchDate', '10 Luglio 2026 - 00:00 (Europe/Rome)')}
            </p>
          </div>

          {/* Action cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="p-6 text-center hover:shadow-glow transition-shadow">
              <Share2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t('prelaunch.inviteFriends', 'Invita amici')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                 {t('prelaunch.inviteFriendsDesc', 'Guadagna punti per ogni amico che si registra')}
              </p>
              {user ? (
                <Button asChild><Link to="/invite">{t('prelaunch.inviteNow', 'Invita ora')}</Link></Button>
              ) : (
                <Button variant="hero" asChild><Link to="/auth">{t('common.signup')}</Link></Button>
              )}
            </Card>

            <Card className="p-6 text-center hover:shadow-glow transition-shadow">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t('founder.title', 'Premium a vita per le prime 200 iscritte')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('founder.shortDesc', 'Le prime 200 donne registrate ottengono Premium gratuito per sempre.')}
              </p>
              <Button variant="outline" asChild><Link to="/auth">{t('founder.cta', 'Prendi il tuo posto')}</Link></Button>
            </Card>
          </div>

          <div className="max-w-3xl mx-auto">
            <FounderOffer />
          </div>

        </main>
      </div>
    </>
  );
};

export default PreLaunch;
