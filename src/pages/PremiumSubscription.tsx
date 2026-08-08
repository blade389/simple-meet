import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown, Check, Sparkles, BadgeCheck, ShieldOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const MONTHLY_PRICE_ID = "price_1SP4zjB786KnA0dn6gOddSAy";
const YEARLY_PRICE_ID = "price_1SP51aB786KnA0dnhrvYBz8l";

const PremiumSubscription = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isPremium, isSubscriber, badgeStatus, subscriptionEnd, checkPremiumStatus } = useAuth();
  const { toast } = useToast();
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingYearly, setLoadingYearly] = useState(false);

  const handleSubscribe = async (priceId: string, isYearly: boolean) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const setLoading = isYearly ? setLoadingYearly : setLoadingMonthly;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-premium-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        
        // Check premium status after a few seconds
        setTimeout(() => {
          checkPremiumStatus();
        }, 5000);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: t('premiumSubscription.error'),
        description: t('premiumSubscription.paymentError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: t('premiumSubscription.error'),
        description: t('premiumSubscription.portalError'),
        variant: "destructive",
      });
    }
  };

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
              {t('premiumSubscription.title')}
            </h1>
            <p className="text-muted-foreground">{t('premiumSubscription.subtitle')}</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-yellow-500" />
              {t('verifiedBadge.title', 'Badge verificato')}
            </CardTitle>
            <CardDescription>
              {badgeStatus === 'active'
                ? t('verifiedBadge.active', 'Il tuo badge verificato è attivo: il tuo profilo è in evidenza e visibile in tutto il mondo.')
                : badgeStatus === 'revoked'
                ? t('verifiedBadge.revoked', 'Il tuo badge verificato è stato revocato. Riattiva l\u2019abbonamento per riottenerlo.')
                : t('verifiedBadge.none', 'Non hai ancora il badge verificato. Attivalo con l\u2019abbonamento qui sotto.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Badge
              className={
                badgeStatus === 'active'
                  ? 'bg-yellow-500 text-black'
                  : badgeStatus === 'revoked'
                  ? 'bg-destructive text-destructive-foreground'
                  : ''
              }
              variant={badgeStatus === 'none' ? 'secondary' : 'default'}
            >
              {badgeStatus === 'active'
                ? t('verifiedBadge.statusActive', 'Attivo')
                : badgeStatus === 'revoked'
                ? t('verifiedBadge.statusRevoked', 'Revocato')
                : t('verifiedBadge.statusNone', 'Non attivo')}
            </Badge>
            {badgeStatus === 'active' && isSubscriber && (
              <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                <ShieldOff className="h-4 w-4 mr-2" />
                {t('verifiedBadge.revoke', 'Disattiva badge / annulla abbonamento')}
              </Button>
            )}
          </CardContent>
        </Card>

        {isPremium && (
          <Card className="mb-6 border-2 border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                {t('premiumSubscription.alreadyPremium')}
              </CardTitle>
              <CardDescription>
                {subscriptionEnd && t('premiumSubscription.activeUntil', { date: new Date(subscriptionEnd).toLocaleDateString(i18n.language) })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleManageSubscription} variant="outline">
                {t('premiumSubscription.manage')}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className={isPremium ? "opacity-50" : ""}>
            <CardHeader>
              <Badge className="w-fit mb-2">{t('premiumSubscription.monthly')}</Badge>
              <CardTitle className="text-3xl">€19,90</CardTitle>
              <CardDescription>{t('premiumSubscription.perMonth')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{t('premiumSubscription.feature1')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{t('premiumSubscription.feature2')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{t('premiumSubscription.feature3')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{t('premiumSubscription.feature4')}</span>
                </li>
              </ul>
              <Button
                className="w-full"
                onClick={() => handleSubscribe(MONTHLY_PRICE_ID, false)}
                disabled={loadingMonthly || isPremium}
              >
                {loadingMonthly ? t('premiumSubscription.loading') : t('premiumSubscription.subscribeMonthly')}
              </Button>
            </CardContent>
          </Card>

          <Card className={`border-2 border-yellow-500 ${isPremium ? "opacity-50" : ""}`}>
            <CardHeader>
              <Badge className="w-fit mb-2 bg-yellow-500 text-black">{t('premiumSubscription.yearlySave')}</Badge>
              <CardTitle className="text-3xl">€199</CardTitle>
              <CardDescription>{t('premiumSubscription.perYear')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{t('premiumSubscription.allMonthlyFeatures')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{t('premiumSubscription.savingsPerYear')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{t('premiumSubscription.prioritySupport')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{t('premiumSubscription.earlyAccess')}</span>
                </li>
              </ul>
              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={() => handleSubscribe(YEARLY_PRICE_ID, true)}
                disabled={loadingYearly || isPremium}
              >
                {loadingYearly ? t('premiumSubscription.loading') : t('premiumSubscription.subscribeYearly')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('premiumSubscription.faq')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t('premiumSubscription.faq1Title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('premiumSubscription.faq1Desc')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('premiumSubscription.faq2Title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('premiumSubscription.faq2Desc')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('premiumSubscription.faq3Title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('premiumSubscription.faq3Desc')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PremiumSubscription;
