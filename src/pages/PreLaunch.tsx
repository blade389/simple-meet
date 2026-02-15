import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Shield, Users, Trophy, Share2, Clock } from 'lucide-react';
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
      supabase.from('profiles').select('is_verified, referral_code').eq('id', user.id).single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  return (
    <>
      <SEOHead title="SCOPAMI - Lancio 1 Maggio 2026" description="Prepara il tuo profilo e invita amici per vincere premi!" canonicalPath="/prelaunch" noindex />
      <div className="min-h-screen bg-gradient-hero">
        <header className="border-b bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">SCOPAMI</span>
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
              {t('prelaunch.title', 'Il lancio è quasi qui!')}
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
              {t('prelaunch.launchDate', '1 Maggio 2026 - 00:00 (Europe/Rome)')}
            </p>
          </div>

          {/* Action cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="p-6 text-center hover:shadow-glow transition-shadow">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t('prelaunch.verifyProfile', 'Completa il profilo')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('prelaunch.verifyProfileDesc', 'Verifica la tua identità e foto per essere pronto al lancio')}
              </p>
              {user ? (
                profile?.is_verified === 'verified' ? (
                  <Button variant="outline" disabled>✓ {t('prelaunch.verified', 'Verificato')}</Button>
                ) : (
                  <Button asChild><Link to="/verify">{t('dashboard.completeVerify')}</Link></Button>
                )
              ) : (
                <Button variant="hero" asChild><Link to="/auth">{t('common.signup')}</Link></Button>
              )}
            </Card>

            <Card className="p-6 text-center hover:shadow-glow transition-shadow">
              <Share2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t('prelaunch.inviteFriends', 'Invita amici')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('prelaunch.inviteFriendsDesc', 'Guadagna punti per ogni amico che si registra e verifica')}
              </p>
              {user ? (
                <Button asChild><Link to="/invite">{t('prelaunch.inviteNow', 'Invita ora')}</Link></Button>
              ) : (
                <Button variant="hero" asChild><Link to="/auth">{t('common.signup')}</Link></Button>
              )}
            </Card>

            <Card className="p-6 text-center hover:shadow-glow transition-shadow">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t('prelaunch.leaderboard', 'Classifica')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('prelaunch.leaderboardDesc', 'Scopri i top referrer e i premi in palio')}
              </p>
              <Button variant="outline" asChild><Link to="/leaderboard">{t('prelaunch.viewLeaderboard', 'Vedi classifica')}</Link></Button>
            </Card>
          </div>

          {/* Prize summary */}
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-card shadow-card">
            <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              {t('prelaunch.prizes', 'Premi in palio')}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 rounded bg-primary/10">
                <span className="font-semibold">🥇 #1</span><span className="font-bold text-primary">1.000€</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-primary/5">
                <span className="font-semibold">🥈 #2</span><span className="font-bold">300€</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-primary/5">
                <span className="font-semibold">🥉 #3</span><span className="font-bold">200€</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded">
                <span>#4</span><span>100€</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded">
                <span>#5-8</span><span>50€</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded">
                <span>#9-12</span><span>25€</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded">
                <span>#13-20</span><span>{t('prelaunch.prize1320', '10 gettoni / 2 mesi premium')}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded">
                <span>#21-50</span><span>{t('prelaunch.prize2150', '5 gettoni / 1 mese premium')}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              {t('prelaunch.prizeNote', 'Premium donne applicabile solo agli account femminili. Per uomini: equivalente in gettoni.')}
            </p>
          </Card>
        </main>
      </div>
    </>
  );
};

export default PreLaunch;
