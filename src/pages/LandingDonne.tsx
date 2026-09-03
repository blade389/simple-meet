import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, UserPlus, Crown, Trophy, Users, Star, CheckCircle, Sparkles, Quote, ArrowRight, Shield, Clock, Gem } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { saveReferralCode } from '@/lib/referral';
import SEOHead from '@/components/SEOHead';
import FounderOffer from '@/components/FounderOffer';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

const LandingDonne = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) saveReferralCode(ref);

    supabase.rpc("get_founder_spots_left").then(({ data, error }) => {
      if (!error && typeof data === "number") setSpotsLeft(data);
    });
  }, [searchParams]);

  const benefits = [
    { icon: Gem, title: t('landingWomen.benefit1Title', '100% gratuito'), desc: t('landingWomen.benefit1Desc', 'Registrazione, profilo e uso base senza costi. Solo se vuoi badge e visibilità extra acquisti Premium.') },
    { icon: Shield, title: t('landingWomen.benefit2Title', 'Sicurezza prima di tutto'), desc: t('landingWomen.benefit3Desc', 'Scegli tu chi incontrare, dove e quando. Puoi rifiutare ogni richiesta senza spiegazioni.') },
    { icon: Clock, title: t('landingWomen.benefit3Title', 'Tempo rispettato'), desc: t('landingWomen.benefit3Desc', 'Nessun messaggio indesiderato: gli uomini pagano 1 gettone per inviarti una richiesta seria.') },
    { icon: Star, title: t('landingWomen.benefit4Title', 'Recensioni trasparenti'), desc: t('landingWomen.benefit4Desc', 'Dopo ogni appuntamento lascia e ricevi recensioni per costruire una reputazione affidabile.') },
  ];

  const planFeatures = [
    t('landingWomen.planFeature1', 'Profilo gratuito con foto, bio e tariffe'),
    t('landingWomen.planFeature2', 'Ricevi richieste dagli uomini nella tua zona'),
    t('landingWomen.planFeature3', 'Accetta o rifiuta senza costi'),
    t('landingWomen.planFeature4', 'Badge Premium e profilo in evidenza'),
    t('landingWomen.planFeature5', 'Visibilità mondiale anche oltre i 50 km'),
    t('landingWomen.planFeature6', 'Supporto prioritario'),
  ];

  return (
    <>
      <SEOHead
        title={t('landingWomen.seoTitle', 'FlashMatch per Donne | 100% Gratuito')}
        description={t('landingWomen.seoDescription', 'Su FlashMatch le donne comandano. Scegli chi incontrare, dove e quando. Completamente gratuito. Upgrade premium per badge e visibilità.')}
        canonicalPath="/donne"
        keywords={t('landingWomen.seoKeywords', 'dating donne, app incontri donne gratuita, FlashMatch donne')}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flashmatch.org/' },
              { '@type': 'ListItem', position: 2, name: 'Per Donne', item: 'https://flashmatch.org/donne' },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'FlashMatch per Donne',
            provider: { '@type': 'Organization', name: 'FlashMatch', url: 'https://flashmatch.org' },
            areaServed: 'IT',
            description:
              'Appuntamenti a pagamento per donne: imposti tu le tariffe e scegli chi incontrare. Gli uomini pagano 1 gettone per inviarti una richiesta. Uso gratuito.',
            url: 'https://flashmatch.org/donne',
          },
        ]}
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
               {t('landingWomen.heroDescription', 'Su FlashMatch sei tu a decidere chi incontrare, quando e a quale tariffa. Puoi rifiutare sempre, senza costi.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="xl">{t('landingWomen.signupFree', 'Registrati Gratis')}</Button>
              </Link>
              <a href="#piano">
                <Button variant="outline" size="xl">
                  {t('landingWomen.seePlan', 'Vedi il piano')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('landingWomen.benefitsTitle', 'Perché registrarsi su FlashMatch')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('landingWomen.benefitsSubtitle', 'Una piattaforma pensata per le donne: controllo, sicurezza e nessun costo obbligatorio.')}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map(({ icon: Icon, title, desc }, i) => (
                <Card key={i} className="p-6 hover:shadow-glow transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{title}</h3>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">{t('landingWomen.howItWorksTitle', 'Come funziona per le donne')}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                 { icon: UserPlus, title: t('landingWomen.step1Title', 'Crea il profilo'), desc: t('landingWomen.step1Desc', 'Registrati e aggiungi foto, descrizione e tariffe. Tutto gratuito, sempre.') },
                 { icon: Users, title: t('landingWomen.step2Title', 'Ricevi e scegli'), desc: t('landingWomen.step2Desc', 'Ricevi richieste dagli uomini nella tua zona e accetta solo chi vuoi incontrare.') },
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

        <FounderOffer />

        {/* Testimonials */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('landingWomen.testimonialsTitle', 'Cosa dicono le iscritte')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('landingWomen.testimonialsPlaceholder', 'Qui verranno inserite testimonianze reali delle utenti. Forniscimi i testi per sostituire gli esempi.')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { quote: t('landingWomen.testimonial1Quote', 'Esempio di testimonianza: spazio riservato a una recensione reale di un\'utente.'), name: t('landingWomen.testimonial1Name', 'Nome Utente'), role: t('landingWomen.testimonial1Role', 'Iscritta FlashMatch') },
                { quote: t('landingWomen.testimonial2Quote', 'Esempio di testimonianza: spazio riservato a una recensione reale di un\'utente.'), name: t('landingWomen.testimonial2Name', 'Nome Utente'), role: t('landingWomen.testimonial2Role', 'Iscritta FlashMatch') },
                { quote: t('landingWomen.testimonial3Quote', 'Esempio di testimonianza: spazio riservato a una recensione reale di un\'utente.'), name: t('landingWomen.testimonial3Name', 'Nome Utente'), role: t('landingWomen.testimonial3Role', 'Iscritta FlashMatch') },
              ].map((item, i) => (
                <Card key={i} className="p-6 bg-card/50 border-border/50">
                  <Quote className="w-8 h-8 text-primary/40 mb-4" />
                  <p className="text-sm text-muted-foreground mb-6 italic">"{item.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing / Purchase plan */}
        <section id="piano" className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('landingWomen.planTitle', 'Il piano per le donne')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('landingWomen.planSubtitle', 'Gratuito per tutte. Premium solo se vuoi badge e visibilità extra.')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Free plan */}
              <Card className="p-8 border-border">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{t('landingWomen.freePlanTitle', 'Gratuito')}</h3>
                  <p className="text-sm text-muted-foreground">{t('landingWomen.freePlanSubtitle', 'Per tutte le donne')}</p>
                </div>
                <div className="text-4xl font-bold mb-6">€0</div>
                <ul className="space-y-3 mb-8">
                  {[0, 1, 2].map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{planFeatures[i]}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full">{t('landingWomen.signupFree', 'Registrati Gratis')}</Button>
                </Link>
              </Card>

              {/* Premium plan */}
              <Card className="p-8 bg-gradient-card shadow-card border-2 border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {t('landingWomen.recommended', 'CONSIGLIATO')}
                </div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-2xl font-bold">{t('landingWomen.premiumPlanTitle', 'Premium')}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{t('landingWomen.premiumPlanSubtitle', 'Badge, evidenza e visibilità mondiale')}</p>
                </div>
                <div className="text-4xl font-bold mb-2">{t('landingWomen.premiumPlanPrice', 'A pagamento')}</div>
                <p className="text-sm text-muted-foreground mb-6">{t('landingWomen.premiumPlanPriceNote', 'Abbonamento mensile o annuale')}</p>
                <ul className="space-y-3 mb-8">
                  {planFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/premium-subscription" className="block">
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                    <Crown className="w-4 h-4 mr-2" />
                    {t('landingWomen.activatePremium', 'Attiva Premium')}
                  </Button>
                </Link>
              </Card>
            </div>

            {spotsLeft !== null && spotsLeft > 0 && (
              <div className="mt-8 p-6 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-primary font-semibold uppercase tracking-widest mb-2">
                  {t('landingWomen.founderOffer', 'Offerta fondatrice')}
                </p>
                <p className="text-muted-foreground mb-4">
                  {t('landingWomen.founderOfferDesc', 'Prime 200 iscritte: Premium a vita gratis. Posti rimanenti: {{count}}', { count: spotsLeft })}
                </p>
                <Link to="/auth">
                  <Button variant="hero">{t('landingWomen.claimSpot', 'Prendi il tuo posto')}</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Pre-launch banner */}
        <section className="py-16 px-4 bg-gradient-primary text-primary-foreground">
          <div className="container mx-auto max-w-3xl text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4" />
             <h2 className="text-3xl font-bold mb-2">{t('landingWomen.launchTitle', 'Lancio: 10 Luglio 2026')}</h2>
            <p className="text-sm opacity-80 mb-4">{t('founder.shortDesc', 'Premium a vita gratuito per le prime 200 donne iscritte')}</p>
            <p className="text-lg mb-6 opacity-90">
               {t('landingWomen.launchDesc', 'Registrati ora e completa il profilo: se sei tra le prime 200 iscritte, il Premium è tuo per sempre, gratis.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="xl" className="bg-background text-foreground hover:bg-background/90">
                  {t('landingWomen.signupFree', 'Registrati Gratis')}
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
