import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BadgeCheck, Globe, Sparkles, Info, Crown, Loader2, Settings, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const MONTHLY_PRICE_ID = 'price_1SP4zjB786KnA0dn6gOddSAy';

interface PremiumExplainerProps {
  gender?: string | null;
  className?: string;
}

const PremiumExplainer = ({ gender, className }: PremiumExplainerProps) => {
  const { t } = useTranslation();
  const { user, isSubscriber, badgeStatus, subscriptionEnd, checkPremiumStatus } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isFemale = gender === 'female';

  const daysLeft = subscriptionEnd
    ? Math.ceil((new Date(subscriptionEnd).getTime() - Date.now()) / 86400000)
    : null;
  const isExpiring = isSubscriber && daysLeft !== null && daysLeft <= 7;
  const state: 'none' | 'active' | 'expiring' = !isSubscriber
    ? 'none'
    : isExpiring
      ? 'expiring'
      : 'active';

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setLoading(true);
    try {
      if (state === 'active') {
        const { data, error } = await supabase.functions.invoke('customer-portal');
        if (error) throw error;
        if (data?.url) window.open(data.url, '_blank');
        return;
      }
      const { data, error } = await supabase.functions.invoke('create-premium-checkout', {
        body: { priceId: MONTHLY_PRICE_ID },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        setTimeout(() => checkPremiumStatus(), 5000);
      }
    } catch (e) {
      toast({
        title: t('premiumSubscription.error', 'Errore'),
        description: t('premiumSubscription.paymentError', 'Impossibile avviare il pagamento. Riprova.'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-yellow-500 shrink-0" />
          <span>{t('premiumExplainer.title', "Cosa abilita l'abbonamento premium")}</span>
          {state === 'active' && (
            <Badge className="bg-yellow-500 text-black">
              {t('premiumExplainer.activeBadge', 'Attivo')}
            </Badge>
          )}
          {state === 'expiring' && (
            <Badge variant="destructive">
              {t('premiumExplainer.expiringBadge', 'In scadenza')}
            </Badge>
          )}
          {state === 'none' && (
            <Badge variant="outline">
              {t('premiumExplainer.inactiveBadge', 'Non attivo')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <ul className="space-y-3">
          <li className="flex gap-3">
            <BadgeCheck className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <span>
              <strong>{t('premiumExplainer.badgeTitle', 'Badge Premium')}</strong>{' '}
              — {t('premiumExplainer.badgeDesc', 'un badge che rende subito riconoscibili i vantaggi attivi sul tuo profilo.')}
            </span>
          </li>
          <li className="flex gap-3">
            <Sparkles className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <span>
              <strong>{t('premiumExplainer.featuredTitle', 'Profilo in evidenza')}</strong>{' '}
              — {t('premiumExplainer.featuredDesc', 'il tuo profilo appare in cima ai risultati di ricerca, prima degli altri.')}
            </span>
          </li>
          <li className="flex gap-3">
            <Globe className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <span>
              <strong>{t('premiumExplainer.worldwideTitle', 'Visibilità mondiale')}</strong>{' '}
              — {t('premiumExplainer.worldwideDesc', 'sei visibile anche agli utenti oltre il raggio standard di 50 km, in tutto il mondo.')}
            </span>
          </li>
        </ul>

        <div className="rounded-md bg-muted/60 p-3 space-y-2 text-muted-foreground">
          <p className="flex gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-medium text-foreground">
              {t('premiumExplainer.conditionsTitle', 'Da quali condizioni dipende')}
            </span>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t('premiumExplainer.cond1', 'I vantaggi restano attivi solo finché l\u2019abbonamento è in corso: se scade o viene annullato, badge, evidenza e visibilità mondiale si disattivano.')}</li>
            <li>{t('premiumExplainer.cond2', 'Il badge può essere revocato dallo staff in caso di violazione delle regole o di segnalazioni fondate.')}</li>
            <li>{t('premiumExplainer.cond3', 'Senza abbonamento resti comunque visibile agli utenti entro 50 km dalla tua posizione.')}</li>
            {isFemale && (
              <li>{t('premiumExplainer.cond4', 'Tutte le altre funzioni (tariffe, richieste, chat) restano gratuite per gli account donna: l\u2019abbonamento aggiunge solo badge, evidenza e visibilità mondiale.')}</li>
            )}
          </ul>
          {badgeStatus === 'revoked' && (
            <p className="text-destructive">
              {t('premiumExplainer.revoked', 'Il tuo Badge Premium è attualmente disattivato.')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {isSubscriber && subscriptionEnd && (
            <p className="text-xs text-muted-foreground">
              {state === 'expiring'
                ? t('premiumExplainer.expiringOn', 'Scade il {{date}} ({{days}} giorni)', {
                    date: new Date(subscriptionEnd).toLocaleDateString(),
                    days: Math.max(daysLeft ?? 0, 0),
                  })
                : t('premiumExplainer.renewsOn', 'Attivo fino al {{date}}', {
                    date: new Date(subscriptionEnd).toLocaleDateString(),
                  })}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={state === 'active' ? 'outline' : 'default'}
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : state === 'active' ? (
                <Settings className="h-4 w-4 mr-2" />
              ) : state === 'expiring' ? (
                <RefreshCw className="h-4 w-4 mr-2" />
              ) : (
                <Crown className="h-4 w-4 mr-2" />
              )}
              {state === 'active'
                ? t('premiumExplainer.manage', 'Gestisci')
                : state === 'expiring'
                  ? t('premiumExplainer.renew', 'Rinnova')
                  : t('premiumExplainer.subscribeNow', 'Attiva l\u2019abbonamento')}
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/premium-subscription">
                {t('premiumExplainer.cta', 'Scopri l\u2019abbonamento')}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumExplainer;