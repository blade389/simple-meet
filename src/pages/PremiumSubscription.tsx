import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown, Check, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MONTHLY_PRICE_ID = "price_1SP4zjB786KnA0dn6gOddSAy";
const YEARLY_PRICE_ID = "price_1SP51aB786KnA0dnhrvYBz8l";

const PremiumSubscription = () => {
  const navigate = useNavigate();
  const { user, isPremium, subscriptionEnd, checkPremiumStatus } = useAuth();
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
        title: "Errore",
        description: "Impossibile avviare il pagamento.",
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
        title: "Errore",
        description: "Impossibile aprire il portale di gestione.",
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
              Abbonamento Premium
            </h1>
            <p className="text-muted-foreground">Diventa un profilo premium e aumenta la tua visibilità</p>
          </div>
        </div>

        {isPremium && (
          <Card className="mb-6 border-2 border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Sei già Premium!
              </CardTitle>
              <CardDescription>
                {subscriptionEnd && `Il tuo abbonamento è attivo fino al ${new Date(subscriptionEnd).toLocaleDateString('it-IT')}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleManageSubscription} variant="outline">
                Gestisci Abbonamento
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className={isPremium ? "opacity-50" : ""}>
            <CardHeader>
              <Badge className="w-fit mb-2">Mensile</Badge>
              <CardTitle className="text-3xl">€19,90</CardTitle>
              <CardDescription>al mese</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Profilo visibile nella sezione Premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Imposta le tue tariffe personalizzate</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Ricevi richieste da utenti verificati</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Badge Premium sul profilo</span>
                </li>
              </ul>
              <Button
                className="w-full"
                onClick={() => handleSubscribe(MONTHLY_PRICE_ID, false)}
                disabled={loadingMonthly || isPremium}
              >
                {loadingMonthly ? "Caricamento..." : "Abbonati Mensilmente"}
              </Button>
            </CardContent>
          </Card>

          <Card className={`border-2 border-yellow-500 ${isPremium ? "opacity-50" : ""}`}>
            <CardHeader>
              <Badge className="w-fit mb-2 bg-yellow-500 text-black">Annuale - Risparmia €39</Badge>
              <CardTitle className="text-3xl">€199</CardTitle>
              <CardDescription>all'anno</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Tutti i vantaggi del piano mensile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Risparmio di €39 all'anno</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Supporto prioritario</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Accesso anticipato a nuove funzionalità</span>
                </li>
              </ul>
              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={() => handleSubscribe(YEARLY_PRICE_ID, true)}
                disabled={loadingYearly || isPremium}
              >
                {loadingYearly ? "Caricamento..." : "Abbonati Annualmente"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Domande Frequenti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Come funziona l'abbonamento Premium?</h3>
              <p className="text-sm text-muted-foreground">
                Con l'abbonamento Premium, il tuo profilo diventa visibile nella sezione dedicata agli utenti maschili, 
                che pagheranno 1 gettone per inviarti una richiesta di appuntamento.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Come imposto le mie tariffe?</h3>
              <p className="text-sm text-muted-foreground">
                Una volta attivato l'abbonamento, potrai impostare le tue tariffe dal tuo profilo. 
                Gli utenti vedranno queste tariffe quando visiteranno il tuo profilo Premium.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Posso cancellare in qualsiasi momento?</h3>
              <p className="text-sm text-muted-foreground">
                Sì, puoi cancellare il tuo abbonamento in qualsiasi momento dal portale di gestione. 
                Continuerai ad avere accesso Premium fino alla fine del periodo pagato.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PremiumSubscription;
