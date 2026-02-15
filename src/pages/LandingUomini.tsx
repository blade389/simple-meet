import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Shield, Zap, Trophy, Users, Star, CheckCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { saveReferralCode } from '@/lib/referral';
import SEOHead from '@/components/SEOHead';
import { useTranslation } from 'react-i18next';
import { LAUNCH_AT } from '@/lib/prelaunch';

const LandingUomini = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) saveReferralCode(ref);
  }, [searchParams]);

  return (
    <>
      <SEOHead
        title={t('landingMen.seoTitle', 'SCOPAMI per Uomini | Registrazione Gratuita')}
        description={t('landingMen.seoDescription', 'Registrati gratuitamente su SCOPAMI. Paghi solo se rifiuti un appuntamento. Profili verificati, incontri reali.')}
        canonicalPath="/uomini"
        keywords={t('landingMen.seoKeywords', 'dating uomini, app incontri gratuita uomini, SCOPAMI uomini')}
      />
      <div className="min-h-screen">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">SCOPAMI</span>
            </Link>
            <div className="flex gap-2">
              <Link to="/donne"><Button variant="ghost" size="sm">{t('landingMen.forWomen', 'Per Donne')}</Button></Link>
              <Link to="/auth"><Button variant="hero">{t('common.signup')}</Button></Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-32 pb-20 px-4 bg-gradient-hero">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" /> {t('landingMen.badge', 'Registrazione 100% Gratuita')}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('landingMen.heroTitle', 'Incontri veri.')}{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">{t('landingMen.heroHighlight', 'Paghi solo se rifiuti.')}</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('landingMen.heroDescription', 'Su SCOPAMI ricevi richieste da donne verificate. Accettare è gratuito. Solo se rifiuti una richiesta ti viene scalato 1 gettone.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="xl">{t('landingMen.signupFree', 'Registrati Gratis')}</Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="outline" size="xl">
                  <Trophy className="w-5 h-5 mr-2" />
                  {t('landingMen.leaderboardPrizes', 'Classifica & Premi')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">{t('landingMen.howItWorksTitle', 'Come funziona per gli uomini')}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: t('landingMen.step1Title', 'Registrati e Verifica'), desc: t('landingMen.step1Desc', 'Crea il profilo, carica una foto e verifica la tua identità. Ricevi 1 gettone gratuito.') },
                { icon: Users, title: t('landingMen.step2Title', 'Ricevi Richieste'), desc: t('landingMen.step2Desc', 'Le donne sfogliano i profili e inviano richieste di appuntamento. Tu decidi se accettare.') },
                { icon: Star, title: t('landingMen.step3Title', 'Incontra'), desc: t('landingMen.step3Desc', "Accettare è gratuito! Solo rifiutare costa 1 gettone. Dopo l'incontro lasciate una recensione.") },
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
            <h2 className="text-2xl font-bold mb-8 text-center">{t('landingMen.whyDifferentTitle', 'Perché SCOPAMI è diverso')}</h2>
            <div className="space-y-4">
              {[
                t('landingMen.point1', 'Registrazione e profilo completamente gratuiti'),
                t('landingMen.point2', 'Accettare appuntamenti non costa nulla'),
                t('landingMen.point3', 'Paghi solo 1 gettone se rifiuti una richiesta'),
                t('landingMen.point4', 'Tutte le donne sono verificate con documento'),
                t('landingMen.point5', 'Sistema recensioni per massima trasparenza'),
                t('landingMen.point6', 'Richieste Premium: invia tu richieste a profili premium (1 gettone)'),
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-card rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pre-launch banner */}
        <section className="py-16 px-4 bg-gradient-primary text-primary-foreground">
          <div className="container mx-auto max-w-3xl text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">{t('landingMen.launchTitle', 'Lancio: 1 Maggio 2026')}</h2>
            <p className="text-lg mb-6 opacity-90">
              {t('landingMen.launchDesc', 'Registrati ora, verifica il profilo e invita amici. I top referrer vincono premi fino a 1.000€!')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="xl" className="bg-background text-foreground hover:bg-background/90">
                  {t('landingMen.signupFree', 'Registrati Gratis')}
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button size="xl" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                  {t('landingMen.viewPrizes', 'Vedi Premi')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 SCOPAMI. {t('common.allRightsReserved')}.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/privacy-policy" className="hover:text-foreground">{t('common.privacyPolicy')}</Link>
            <Link to="/terms-of-service" className="hover:text-foreground">{t('common.termsOfService')}</Link>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingUomini;
