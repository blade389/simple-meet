import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, Coins, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface TokenPackage {
  tokens: number;
  price: number;
  priceId: string;
  popular?: boolean;
  savings?: string;
}

const BuyTokens = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const packages: TokenPackage[] = [
    {
      tokens: 1,
      price: 10,
      priceId: 'price_1SO2WUB786KnA0dnmufrco1Q',
    },
    {
      tokens: 5,
      price: 40,
      priceId: 'price_1SO2WlB786KnA0dnzgSTyYkd',
      savings: t('buyTokens.save', { amount: '€10' }),
    },
    {
      tokens: 10,
      price: 65,
      priceId: 'price_1SO2XHB786KnA0dnqRmNBobB',
      popular: true,
      savings: t('buyTokens.save', { amount: '€35' }),
    },
    {
      tokens: 100,
      price: 500,
      priceId: 'price_1SO2XSB786KnA0dnKEnJzWwH',
      savings: t('buyTokens.save', { amount: '€500' }),
    },
  ];

  const handlePurchase = async (priceId: string, tokens: number) => {
    if (!user) {
      toast({
        title: t('buyTokens.error'),
        description: t('buyTokens.loginRequired'),
        variant: "destructive"
      });
      return;
    }

    setLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke('create-token-payment', {
        body: { priceId, tokens }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: t('buyTokens.error'),
        description: error.message || t('buyTokens.paymentError'),
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

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
          <div className="w-20"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Coins className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-4xl font-bold mb-4">{t('buyTokens.title')}</h2>
            <p className="text-muted-foreground text-lg">
              {t('buyTokens.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <Card 
                key={pkg.priceId} 
                className={`relative ${pkg.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      {t('buyTokens.mostPopular')}
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-3xl font-bold mb-2">
                    {pkg.tokens} {pkg.tokens === 1 ? t('buyTokens.token') : t('buyTokens.tokens')}
                  </CardTitle>
                  <div className="text-4xl font-bold text-primary mb-2">
                    €{pkg.price}
                  </div>
                  {pkg.savings && (
                    <CardDescription className="text-green-600 font-semibold">
                      {pkg.savings}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span>{pkg.tokens} {pkg.tokens === 1 ? t('buyTokens.token').toLowerCase() : t('buyTokens.tokens').toLowerCase()}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span>{t('buyTokens.noExpiry')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span>{t('buyTokens.securePayment')}</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => handlePurchase(pkg.priceId, pkg.tokens)}
                    disabled={loading === pkg.priceId}
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                  >
                    {loading === pkg.priceId ? t('buyTokens.loading') : t('buyTokens.buy')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-12 bg-muted/50">
            <CardHeader>
              <CardTitle>{t('buyTokens.howItWorks')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t('buyTokens.howItWorksDesc')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>{t('buyTokens.acceptFree')}</li>
                <li>{t('buyTokens.rejectCost')}</li>
                <li>{t('buyTokens.noExpiry')}</li>
                <li>{t('buyTokens.buyMoreSave')}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BuyTokens;
