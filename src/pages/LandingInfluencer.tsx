import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Shield, Crown, Trophy, Users, Star, CheckCircle, Sparkles, DollarSign, ThumbsUp, ThumbsDown, Camera } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { saveReferralCode } from '@/lib/referral';
import SEOHead from '@/components/SEOHead';
import { useTranslation } from 'react-i18next';

const LandingInfluencer = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) saveReferralCode(ref);
  }, [searchParams]);

  return (
    <>
      <SEOHead
        title={t('influencer.seoTitle', 'FlashMatch per Influencer | Premium Gratuito a Vita')}
        description={t('influencer.seoDescription', "Sei un'influencer? Ottieni lo status Premium gratuito a vita su FlashMatch. Imposta le tue tariffe, accetta o rifiuta richieste, guadagna dai tuoi appuntamenti.")}
        canonicalPath="/influencer"
        keywords={t('influencer.seoKeywords', 'dating influencer, premium gratuito, guadagna con appuntamenti, FlashMatch influencer')}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flashmatch.org/' },
              { '@type': 'ListItem', position: 2, name: 'Per Influencer', item: 'https://flashmatch.org/influencer' },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'FlashMatch Premium per Influencer',
            provider: { '@type': 'Organization', name: 'FlashMatch', url: 'https://flashmatch.org' },
            areaServed: 'IT',
            description:
              'Status Premium gratuito a vita per influencer Instagram e OnlyFans verificati. Imposta tariffe e monetizza gli appuntamenti.',
            url: 'https://flashmatch.org/influencer',
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
              <Link to="/donne"><Button variant="ghost" size="sm">{t('influencer.forWomen', 'Per Donne')}</Button></Link>
              <Link to="/auth"><Button variant="hero">{t('common.signup')}</Button></Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-32 pb-20 px-4 bg-gradient-hero">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Crown className="w-4 h-4" /> {t('influencer.badge', 'Premium Gratuito per Influencer')}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('influencer.heroTitle', 'Il tuo profilo vale.')}{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">{t('influencer.heroHighlight', 'Monetizzalo.')}</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('influencer.heroDescription', 'Hai un grande seguito social? Su FlashMatch ottieni lo status Premium a vita, completamente gratis. Imposta le tue tariffe, scegli chi incontrare e mantieni il controllo totale.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="xl">
                  <Crown className="w-5 h-5 mr-2" />
                  {t('influencer.requestPremium', 'Richiedi Premium Gratis')}
                </Button>
              </Link>
              <Link to="/donne">
                <Button variant="outline" size="xl">
                  {t('influencer.howItWorksWomen', 'Come funziona per le donne')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Requisiti */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-4">{t('influencer.requirementsTitle', 'Chi può ottenere il Premium gratuito?')}</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t('influencer.requirementsDesc', 'Se hai un grande seguito, il Premium è tuo. Basta condividere il nostro link sul tuo profilo.')}
            </p>
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <Card className="p-6 text-center hover:shadow-glow transition-shadow border-2 border-purple-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Instagram</h3>
                <p className="text-3xl font-bold text-primary mb-2">200k+</p>
                <p className="text-sm text-muted-foreground">{t('influencer.followers', 'follower')}</p>
              </Card>
              <Card className="p-6 text-center hover:shadow-glow transition-shadow border-2 border-purple-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">OnlyFans</h3>
                <p className="text-3xl font-bold text-primary mb-2">1.000+</p>
                <p className="text-sm text-muted-foreground">{t('influencer.likes', 'like')}</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Come funziona */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">{t('influencer.howToGetTitle', 'Come ottenere il Premium gratuito')}</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '1', icon: Shield, title: t('influencer.step1Title', 'Registrati'), desc: t('influencer.step1Desc', 'Crea il tuo profilo e verifica la tua identità. Tutto gratuito.') },
                { step: '2', icon: Camera, title: t('influencer.step2Title', 'Invia Screenshot'), desc: t('influencer.step2Desc', 'Carica uno screen del tuo profilo social con i follower/like visibili.') },
                { step: '3', icon: Sparkles, title: t('influencer.step3Title', 'Condividi il Link'), desc: t('influencer.step3Desc', 'Condividi il link di FlashMatch sul tuo profilo e inviaci lo screenshot.') },
                { step: '4', icon: Crown, title: t('influencer.step4Title', 'Premium a Vita'), desc: t('influencer.step4Desc', 'Il nostro team verifica e attiva il tuo Premium. Per sempre.') },
              ].map(({ step, icon: Icon, title, desc }) => (
                <Card key={step} className="p-6 text-center hover:shadow-glow transition-shadow relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    {step}
                  </div>
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Funzionalità Premium */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-4">{t('influencer.premiumFeaturesTitle', 'Cosa puoi fare con il Premium')}</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t('influencer.premiumFeaturesDesc', 'Il Premium ti dà il controllo totale sugli appuntamenti e sulle tariffe. Tu decidi tutto.')}
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-glow transition-shadow">
                <DollarSign className="w-12 h-12 text-yellow-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t('influencer.ratesTitle', 'Imposta le tue Tariffe')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('influencer.ratesDesc', 'Crea tariffe personalizzate con durata e prezzo. Gli uomini vedono le tue tariffe e possono inviarti richieste premium.')}
                </p>
              </Card>
              <Card className="p-6 hover:shadow-glow transition-shadow">
                <ThumbsUp className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t('influencer.acceptRejectTitle', 'Accetta o Rifiuta')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('influencer.acceptRejectDesc', 'Ogni richiesta è sotto il tuo controllo. Puoi accettare, rifiutare o semplicemente ignorare. Nessun obbligo, mai.')}
                </p>
              </Card>
              <Card className="p-6 hover:shadow-glow transition-shadow">
                <Star className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t('influencer.visibilityTitle', 'Visibilità Premium')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('influencer.visibilityDesc', 'Il badge Premium ti rende più visibile. Gli uomini verificati ti trovano più facilmente e ti inviano richieste di qualità.')}
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Sicurezza */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold mb-8 text-center">{t('influencer.securityTitle', 'Sicurezza e Controllo Totale')}</h2>
            <div className="space-y-4">
              {[
                t('influencer.security1', 'Solo profili maschili verificati con selfie possono inviarti richieste'),
                t('influencer.security2', 'Tu scegli chi incontrare, dove e quando — sempre'),
                t('influencer.security3', 'Puoi rifiutare qualsiasi richiesta senza conseguenze'),
                t('influencer.security4', 'Sistema di recensioni per la massima trasparenza'),
                t('influencer.security5', "Nessun messaggio indesiderato: la chat si apre solo dopo l'accettazione"),
                t('influencer.security6', 'Premium a vita senza costi, per sempre'),
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-card rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA finale */}
        <section className="py-16 px-4 bg-gradient-primary text-primary-foreground">
          <div className="container mx-auto max-w-3xl text-center">
            <Crown className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">{t('influencer.ctaTitle', 'Pronta a diventare Premium?')}</h2>
            <p className="text-lg mb-6 opacity-90">
              {t('influencer.ctaDescription', 'Registrati, verifica il tuo profilo e richiedi il Premium gratuito. Il nostro team approverà la tua richiesta in poche ore.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="xl" className="bg-background text-foreground hover:bg-background/90">
                  <Crown className="w-5 h-5 mr-2" />
                  {t('influencer.ctaButton', 'Registrati e Richiedi Premium')}
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

export default LandingInfluencer;
