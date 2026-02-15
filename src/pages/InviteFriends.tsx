import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, Share2, Copy, Check, Trophy, Users, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import { useTranslation } from 'react-i18next';

const InviteFriends = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [points, setPoints] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    try {
      // Get referral code
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user!.id)
        .single();

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      }

      // Count confirmed referrals
      const { count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_user_id', user!.id);

      setPoints(count || 0);
    } catch (err) {
      console.error('Error loading referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = `https://scopami.online/?ref=${referralCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success(t('invite.linkCopied', 'Link copiato!'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('invite.copyError', 'Impossibile copiare'));
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SCOPAMI - Unisciti a me!',
          text: t('invite.shareText', 'Registrati su SCOPAMI e preparati al lancio del 1 aprile 2026! Usa il mio link:'),
          url: referralLink,
        });
      } catch {}
    } else {
      copyLink();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Card className="p-8 text-center max-w-md">
          <Share2 className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{t('invite.loginRequired', 'Accedi per invitare amici')}</h2>
          <p className="text-muted-foreground mb-4">{t('invite.loginRequiredDesc', 'Registrati o accedi per ottenere il tuo link referral.')}</p>
          <Button variant="hero" asChild><Link to="/auth">{t('common.signup')}</Link></Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Invita Amici | SCOPAMI" description="Invita i tuoi amici su SCOPAMI e guadagna punti per vincere premi!" canonicalPath="/invite" noindex />
      <div className="min-h-screen bg-gradient-hero">
        <header className="border-b bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">SCOPAMI</span>
            </Link>
            <Button variant="ghost" asChild><Link to="/dashboard">← Dashboard</Link></Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <Share2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">{t('invite.title', 'Invita Amici')}</h1>
            <p className="text-muted-foreground">
              {t('invite.subtitle', 'Condividi il tuo link e guadagna 1 punto per ogni amico che si registra e verifica il profilo.')}
            </p>
          </div>

          {/* Points card */}
          <Card className="p-6 mb-6 bg-gradient-primary text-primary-foreground text-center">
            <div className="text-4xl font-bold mb-1">{points}</div>
            <div className="text-sm opacity-80">{t('invite.pointsEarned', 'punti guadagnati')}</div>
          </Card>

          {/* Referral link */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-3">{t('invite.yourLink', 'Il tuo link referral')}</h3>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono text-sm" />
              <Button onClick={copyLink} variant="outline" className="shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button onClick={shareLink} className="w-full mt-3" variant="hero">
              <Share2 className="w-4 h-4 mr-2" />
              {t('invite.share', 'Condividi')}
            </Button>
          </Card>

          {/* Rules */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              {t('invite.howItWorks', 'Come funziona')}
            </h3>
            <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
              <li>{t('invite.rule1', 'Condividi il tuo link con amici')}</li>
              <li>{t('invite.rule2', 'Il tuo amico si registra usando il tuo link')}</li>
              <li>{t('invite.rule3', 'Quando verifica il profilo (identità + foto), guadagni 1 punto')}</li>
              <li>{t('invite.rule4', 'Più punti = posizione più alta in classifica = premi migliori!')}</li>
            </ol>
          </Card>

          {/* Leaderboard link */}
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link to="/leaderboard">
                <Trophy className="w-4 h-4 mr-2" />
                {t('invite.viewLeaderboard', 'Vedi Classifica')}
              </Link>
            </Button>
          </div>
        </main>
      </div>
    </>
  );
};

export default InviteFriends;
