import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Menu } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import heroImage from "@/assets/hero-image.jpg";
import SEOHead from "@/components/SEOHead";
import StructuredData from "@/components/StructuredData";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { saveReferralCode } from "@/lib/referral";
import ShowcaseProfiles from "@/components/ShowcaseProfiles";
import FounderOffer from "@/components/FounderOffer";


const Index = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) saveReferralCode(ref);
  }, [searchParams]);

  const trustSignals = [
    { title: t("home.trust1Title"), desc: t("home.trust1Desc") },
    { title: t("home.trust2Title"), desc: t("home.trust2Desc") },
    { title: t("home.trust3Title"), desc: t("home.trust3Desc") },
  ];

  const features = [
    { title: t("home.feature1Title"), desc: t("home.feature1Desc") },
    { title: t("home.feature2Title"), desc: t("home.feature2Desc") },
    { title: t("home.feature3Title"), desc: t("home.feature3Desc") },
    { title: t("home.feature4Title"), desc: t("home.feature4Desc") },
  ];

  const steps = [
    { title: t("home.step1Title"), desc: t("home.step1Desc") },
    { title: t("home.step2Title"), desc: t("home.step2Desc") },
    { title: t("home.step3Title"), desc: t("home.step3Desc") },
  ];

  return (
    <>
      <SEOHead
        title="FlashMatch - Appuntamenti a Pagamento | Tariffe Chiare"
        description="Appuntamenti a pagamento: le donne fissano le proprie tariffe, gli uomini pagano 1 gettone per inviare la richiesta. Gettone rimborsato se la richiesta viene rifiutata."
        canonicalPath="/"
        keywords="appuntamenti a pagamento, incontri a pagamento, dating a pagamento, tariffe appuntamento, gettoni richieste, app appuntamenti Italia"
      />
      <StructuredData schema={{ type: "Organization" }} />
      <StructuredData schema={{ type: "WebSite" }} />
      <StructuredData schema={{ type: "WebApplication" }} />

      <div className="min-h-screen overflow-x-hidden bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-lg">
          <div className="mx-auto max-w-7xl px-6 py-4 lg:px-12">
            <div className="flex min-w-0 items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 shrink-0 fill-primary text-primary" />
                <h1 className="font-serif text-2xl tracking-tight">
                  Flash<span className="text-primary">Match</span>
                  <span className="sr-only"> — Appuntamenti a Pagamento</span>
                </h1>
              </div>

              <div className="flex min-w-0 items-center gap-2">
                <LanguageSelector />

                <nav className="hidden min-w-0 items-center gap-8 md:flex">
                  <a
                    href="#features"
                    className="text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t("common.features")}
                  </a>
                  <a
                    href="#how-it-works"
                    className="text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t("home.howItWorks")}
                  </a>
                  <Link to="/auth">
                    <Button variant="ghost" className="uppercase tracking-widest">
                      {t("common.login")}
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="font-bold uppercase tracking-widest">
                      {t("common.signup")}
                    </Button>
                  </Link>
                </nav>

                {/* Mobile navigation */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="min-h-11 min-w-11 md:hidden"
                      aria-label={t("home.menuLabel")}
                    >
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72 bg-card">
                    <nav className="mt-10 flex flex-col gap-1">
                      <SheetClose asChild>
                        <a
                          href="#features"
                          className="px-2 py-3 text-base uppercase tracking-widest text-foreground transition-colors hover:text-primary"
                        >
                          {t("common.features")}
                        </a>
                      </SheetClose>
                      <SheetClose asChild>
                        <a
                          href="#how-it-works"
                          className="px-2 py-3 text-base uppercase tracking-widest text-foreground transition-colors hover:text-primary"
                        >
                          {t("home.howItWorks")}
                        </a>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to="/pricing"
                          className="px-2 py-3 text-base uppercase tracking-widest text-foreground transition-colors hover:text-primary"
                        >
                          {t("common.pricing")}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to="/faq"
                          className="px-2 py-3 text-base uppercase tracking-widest text-foreground transition-colors hover:text-primary"
                        >
                          {t("common.faq")}
                        </Link>
                      </SheetClose>
                      <div className="mt-6 flex flex-col gap-3">
                        <SheetClose asChild>
                          <Link to="/auth">
                            <Button variant="outline" className="w-full uppercase tracking-widest">
                              {t("common.login")}
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link to="/auth">
                            <Button className="w-full font-bold uppercase tracking-widest">
                              {t("common.signup")}
                            </Button>
                          </Link>
                        </SheetClose>
                      </div>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero — split screen */}
          <section className="flex min-h-[90vh] flex-col border-b border-border pt-20 md:flex-row md:pt-0">
            <div className="flex w-full flex-col justify-center bg-background px-6 py-20 md:w-1/2 md:px-16 lg:px-20">
              <div className="animate-fade-in">
                <h2 className="mb-8 break-words font-serif text-5xl leading-tight md:text-6xl lg:text-7xl">
                  {t("home.heroTitle")}
                  <br />
                  <span className="italic text-primary">{t("home.heroHighlight")}</span>
                </h2>
                <p className="mb-10 max-w-md break-words text-lg leading-relaxed text-muted-foreground">
                  {t("home.heroDescription")}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full px-8 py-6 text-sm font-bold uppercase tracking-widest sm:w-auto"
                    >
                      {t("home.heroPrimaryCta")}
                    </Button>
                  </Link>
                  <a href="#how-it-works" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full px-8 py-6 text-sm font-bold uppercase tracking-widest hover:border-primary sm:w-auto"
                    >
                      {t("home.heroSecondaryCta")}
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden bg-card md:min-h-0 md:w-1/2">
              <img
                src={heroImage}
                alt="Coppie a un appuntamento al tramonto"
                className="absolute inset-0 h-full w-full object-cover opacity-40 grayscale"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
              <div className="relative z-10 border border-border bg-background/30 p-10 backdrop-blur-sm md:p-12">
                <p className="font-serif text-4xl italic text-foreground/25 md:text-5xl">
                  FlashMatch
                </p>
              </div>
            </div>
          </section>

          {/* Trust signals */}
          <section className="bg-card px-6 py-12 lg:px-12">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
              {trustSignals.map((item) => (
                <div key={item.title} className="flex min-w-0 items-start gap-4">
                  <div className="ember-rule mt-4" />
                  <div className="min-w-0">
                    <p className="font-serif text-xl">{item.title}</p>
                    <p className="mt-1 break-words text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <FounderOffer />

          {/* Profili in vetrina */}
          <ShowcaseProfiles />



          {/* Why choose us */}
          <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
            <div className="mb-16 text-center">
              <h3 className="font-serif text-4xl italic md:text-5xl">{t("home.featuresTitle")}</h3>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                {t("home.featuresSubtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="border-t-2 border-transparent bg-card p-8 transition-all duration-300 hover:border-primary"
                >
                  <div className="mb-4 font-sans text-sm font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h4 className="mb-4 break-words font-serif text-2xl">{feature.title}</h4>
                  <p className="break-words text-sm leading-relaxed text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section id="how-it-works" className="bg-card px-6 py-24 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <h3 className="mb-4 font-serif text-4xl italic md:text-5xl">
                {t("home.howItWorksTitle")}
              </h3>
              <p className="mb-16 max-w-2xl text-muted-foreground">
                {t("home.howItWorksSubtitle")}
              </p>

              <ol className="grid grid-cols-1 gap-12 md:grid-cols-3">
                {steps.map((step, i) => (
                  <li key={step.title} className="border-t border-border pt-6">
                    <span
                      aria-hidden="true"
                      className="mb-4 block font-serif text-6xl leading-none text-border"
                    >
                      {i + 1}
                    </span>
                    <h4 className="mb-3 break-words font-serif text-2xl">{step.title}</h4>
                    <p className="break-words leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                  </li>
                ))}
              </ol>

            </div>
          </section>


          {/* Closing CTA */}
          <section className="border-y border-border bg-card px-6 py-24 lg:px-12">
            <div className="mx-auto max-w-3xl text-center">
              <h3 className="mb-6 break-words font-serif text-4xl md:text-5xl">
                {t("home.ctaTitle")}
              </h3>
              <p className="mb-10 break-words text-lg text-muted-foreground">
                {t("home.ctaDescription")}
              </p>
              <Link to="/auth">
                <Button size="lg" className="px-10 py-6 text-sm font-bold uppercase tracking-widest">
                  {t("common.startFree")}
                </Button>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="px-6 py-16 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-serif text-xl">FlashMatch</span>
                </div>
                <p className="text-sm text-muted-foreground">{t("home.footerTagline")}</p>
              </div>

              <div>
                <h5 className="eyebrow mb-4">{t("common.product")}</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link to="/features" className="transition-colors hover:text-foreground">
                      {t("common.features")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="transition-colors hover:text-foreground">
                      {t("common.pricing")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/faq" className="transition-colors hover:text-foreground">
                      {t("common.faq")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="eyebrow mb-4">{t("common.company")}</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link to="/about" className="transition-colors hover:text-foreground">
                      {t("common.about")}
                    </Link>
                  </li>
                  <li>
                    <a
                      href="mailto:support@flashmatch.org"
                      className="transition-colors hover:text-foreground"
                    >
                      {t("common.contactUs")}
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="eyebrow mb-4">{t("common.legal")}</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link to="/privacy-policy" className="transition-colors hover:text-foreground">
                      {t("common.privacyPolicy")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms-of-service" className="transition-colors hover:text-foreground">
                      {t("common.termsOfService")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookie-policy" className="transition-colors hover:text-foreground">
                      {t("common.cookiePolicy")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
              © 2025 FlashMatch. {t("common.allRightsReserved")}.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
