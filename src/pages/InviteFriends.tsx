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

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      t('invite.shareText', 'Registrati su SCOPAMI e preparati al lancio del 1 aprile 2026! Usa il mio link:') + ' ' + referralLink
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
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
            <div className="flex gap-2 mt-3">
              <Button onClick={shareLink} className="flex-1" variant="hero">
                <Share2 className="w-4 h-4 mr-2" />
                {t('invite.share', 'Condividi')}
              </Button>
              <Button onClick={shareWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </Button>
            </div>
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
