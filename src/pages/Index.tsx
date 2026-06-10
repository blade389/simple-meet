import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Shield, Star, Zap } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import SEOHead from "@/components/SEOHead";
import StructuredData from "@/components/StructuredData";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { saveReferralCode } from "@/lib/referral";

const Index = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) saveReferralCode(ref);
  }, [searchParams]);

  return (
    <>
      <SEOHead
        title="Matchly - App di Dating Innovativa | Incontri Sicuri"
        description="Matchly è l'app di dating che mette le donne al comando. Sistema innovativo con gettoni per incontri autentici, sicuri e verificati. Registrazione gratuita."
        canonicalPath="/"
        keywords="dating app, incontri online, app incontri Italia, dating sicuro, incontri verificati, app appuntamenti"
      />
      <StructuredData schema={{ type: "Organization" }} />
      <StructuredData schema={{ type: "WebSite" }} />
      <StructuredData schema={{ type: "WebApplication" }} />
    <div className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Matchly
              </h1>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <LanguageSelector />
              <nav className="hidden md:flex items-center gap-6 min-w-0">
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("common.features")}
                </a>
                <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("home.howItWorks")}
                </a>
                <Link to="/auth">
                  <Button variant="ghost">{t("common.login")}</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero">{t("common.signup")}</Button>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-hero">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-w-0">
            <div className="space-y-6 min-w-0">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight break-words">
                {t("home.heroTitle")}{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {t("home.heroHighlight")}
                </span>
              </h2>
              <p className="text-xl text-muted-foreground break-words">
                {t("home.heroDescription")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    {t("common.startFree")}
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    {t("common.learnMore")}
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">{t("home.activeUsers")}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">95%</div>
                  <div className="text-sm text-muted-foreground">{t("home.successfulMeetings")}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">4.8★</div>
                  <div className="text-sm text-muted-foreground">{t("home.averageRating")}</div>
                </div>
              </div>
            </div>
            <div className="relative min-w-0">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl"></div>
              <img
                src={heroImage}
                alt="Coppie felici al tramonto"
                className="relative rounded-2xl shadow-glow w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">{t("home.featuresTitle")}</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.featuresSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{t("home.feature1Title")}</h4>
              <p className="text-muted-foreground">
                {t("home.feature1Desc")}
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{t("home.feature2Title")}</h4>
              <p className="text-muted-foreground">
                {t("home.feature2Desc")}
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{t("home.feature3Title")}</h4>
              <p className="text-muted-foreground">
                {t("home.feature3Desc")}
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{t("home.feature4Title")}</h4>
              <p className="text-muted-foreground">
                {t("home.feature4Desc")}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">{t("home.howItWorksTitle")}</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.howItWorksSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto shadow-glow">
                1
              </div>
              <h4 className="text-xl font-semibold">{t("home.step1Title")}</h4>
              <p className="text-muted-foreground">
                {t("home.step1Desc")}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-2xl font-bold text-secondary-foreground mx-auto shadow-glow">
                2
              </div>
              <h4 className="text-xl font-semibold">{t("home.step2Title")}</h4>
              <p className="text-muted-foreground">
                {t("home.step2Desc")}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-2xl font-bold text-accent-foreground mx-auto shadow-glow">
                3
              </div>
              <h4 className="text-xl font-semibold">{t("home.step3Title")}</h4>
              <p className="text-muted-foreground">
                {t("home.step3Desc")}
              </p>
            </div>
          </div>
          <div className="mt-12 max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground text-sm italic leading-relaxed">
              {t("home.appointmentDisclaimer")}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl font-bold text-primary-foreground mb-6">
            {t("home.ctaTitle")}
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            {t("home.ctaDescription")}
          </p>
          <Link to="/auth">
            <Button
              size="xl"
              className="bg-background text-foreground hover:bg-background/90 shadow-glow"
            >
              {t("common.startFree")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-primary fill-primary" />
                <span className="text-xl font-bold">Matchly</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("home.footerTagline")}
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">{t("common.product")}</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/features" className="hover:text-foreground transition-colors">
                    {t("common.features")}
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-foreground transition-colors">
                    {t("common.pricing")}
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-foreground transition-colors">
                    {t("common.faq")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">{t("common.company")}</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="hover:text-foreground transition-colors">
                    {t("common.about")}
                  </Link>
                </li>

                <li>
                  <a href="mailto:support@matchly.online" className="hover:text-foreground transition-colors">
                    {t("common.contactUs")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">{t("common.legal")}</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
                    {t("common.privacyPolicy")}
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="hover:text-foreground transition-colors">
                    {t("common.termsOfService")}
                  </Link>
                </li>
                <li>
                  <Link to="/cookie-policy" className="hover:text-foreground transition-colors">
                    {t("common.cookiePolicy")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 Matchly. {t("common.allRightsReserved")}.
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Index;