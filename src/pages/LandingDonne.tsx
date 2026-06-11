import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Shield, Crown, Trophy, Users, Star, CheckCircle, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { saveReferralCode } from '@/lib/referral';
import SEOHead from '@/components/SEOHead';
import { useTranslation } from 'react-i18next';

const LandingDonne = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) saveReferralCode(ref);
  }, [searchParams]);

  return (
    <>
      <SEOHead
        title={t('landingWomen.seoTitle', 'FlashMatch per Donne | 100% Gratuito')}
        description={t('landingWomen.seoDescription', 'Su FlashMatch le donne comandano. Scegli chi incontrare, dove e quando. Completamente gratuito. Upgrade premium per guadagnare.')}
        canonicalPath="/donne"
        keywords={t('landingWomen.seoKeywords', 'dating donne, app incontri donne gratuita, FlashMatch donne')}
      />
      <div className="min-h-screen">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">FlashMatch</span>
            </Link>
            <div className="flex gap-2">
              <Link to="/uomini"><Button variant="ghost" size="sm">{t('landingWomen.forMen', 'Per Uomini')}</Button></Link>
              <Link to="/auth"><Button variant="hero">{t('common.signup')}</Button></Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-32 pb-20 px-4 bg-gradient-hero">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> {t('landingWomen.badge', '100% Gratuito per le Donne')}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('landingWomen.heroTitle', 'Tu comandi.')}{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">{t('landingWomen.heroHighlight', 'Sempre.')}</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('landingWomen.heroDescription', 'Su FlashMatch sei tu a decidere chi incontrare. Scegli profili verificati, decidi dove e quando. Puoi rifiutare sempre, senza costi.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="xl">{t('landingWomen.signupFree', 'Registrati Gratis')}</Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="outline" size="xl">
                  <Trophy className="w-5 h-5 mr-2" />
                  {t('landingWomen.leaderboardPrizes', 'Classifica & Premi')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">{t('landingWomen.howItWorksTitle', 'Come funziona per le donne')}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: t('landingWomen.step1Title', 'Registrati e Verifica'), desc: t('landingWomen.step1Desc', 'Crea il profilo e verifica la tua identità. Tutto gratuito, sempre.') },
                { icon: Users, title: t('landingWomen.step2Title', 'Scopri e Scegli'), desc: t('landingWomen.step2Desc', 'Sfoglia i profili verificati nella tua zona. Invia richieste a chi ti piace. Gratis.') },
                { icon: Star, title: t('landingWomen.step3Title', 'Incontra in Sicurezza'), desc: t('landingWomen.step3Desc', "Scegli luogo e ora. Puoi sempre rifiutare. Dopo l'incontro, lascia una recensione.") },
              ].map(({ icon: Icon, title, desc }, i) => (
                <Card key={i} className="p-6 text-center hover:shadow-glow transition-shadow">
                  <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Key points */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold mb-8 text-center">{t('landingWomen.controlTitle', 'Tutto sotto il tuo controllo')}</h2>
            <div className="space-y-4">
              {[
                t('landingWomen.point1', "Registrazione, profilo e uso dell'app 100% gratuiti"),
                t('landingWomen.point2', 'Solo profili maschili verificati con documento'),
                t('landingWomen.point3', 'Tu scegli chi incontrare, dove e quando'),
                t('landingWomen.point4', 'Puoi rifiutare qualsiasi richiesta, sempre'),
                t('landingWomen.point5', 'Sistema recensioni per la massima trasparenza'),
                t('landingWomen.point6', 'Nessun messaggio indesiderato: sei tu a fare il primo passo'),
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-card rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium upgrade */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <Card className="p-8 bg-gradient-card shadow-card border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-8 h-8 text-yellow-500" />
                <h2 className="text-2xl font-bold">{t('landingWomen.premiumTitle', 'Upgrade Premium (opzionale)')}</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                {t('landingWomen.premiumDesc', 'Vuoi ricevere richieste di appuntamento a pagamento? Con Premium imposti le tue tariffe e ricevi richieste da uomini disposti a pagare per incontrarti.')}
              </p>
              <div className="space-y-3 mb-6">
                {[
                  t('landingWomen.premiumPoint1', 'Imposta le tue tariffe personalizzate'),
                  t('landingWomen.premiumPoint2', 'Ricevi richieste premium da profili verificati'),
                  t('landingWomen.premiumPoint3', 'Badge Premium per maggiore visibilità'),
                  t('landingWomen.premiumPoint4', 'Mantieni sempre il controllo totale'),
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <Link to="/auth">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Crown className="w-4 h-4 mr-2" />
                  {t('landingWomen.discoverPremium', 'Scopri Premium')}
                </Button>
              </Link>
            </Card>
          </div>
        </section>

        {/* Pre-launch banner */}
        <section className="py-16 px-4 bg-gradient-primary text-primary-foreground">
          <div className="container mx-auto max-w-3xl text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2"><h2 className="text-3xl font-bold mb-2">{t('landingWomen.launchTitle', 'Lancio: 1 Giugno 2026')}</h2></h2>
            <p className="text-sm opacity-80 mb-4">{t('landingWomen.contestDeadline', '🏆 Concorso premi referral: fino al 30 Agosto 2026')}</p>
            <p className="text-lg mb-6 opacity-90">
              {t('landingWomen.launchDesc', 'Registrati ora, verifica il profilo e invita le amiche. Le top referrer vincono premi fino a 1.000€ o mesi di Premium gratuito!')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="xl" className="bg-background text-foreground hover:bg-background/90">
                  {t('landingWomen.signupFree', 'Registrati Gratis')}
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button size="xl" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                  {t('landingWomen.viewPrizes', 'Vedi Premi')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 FlashMatch. {t('common.allRightsReserved')}.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/privacy-policy" className="hover:text-foreground">{t('common.privacyPolicy')}</Link>
            <Link to="/terms-of-service" className="hover:text-foreground">{t('common.termsOfService')}</Link>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingDonne;
