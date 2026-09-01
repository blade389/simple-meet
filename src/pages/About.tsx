import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Shield, Users, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

const About = () => {
    const { t } = useTranslation();

    return (
        <>
        <SEOHead
            title="Chi Siamo - FlashMatch | La Nostra Missione"
            description="La filosofia di FlashMatch: appuntamenti a pagamento con regole chiare. Le donne fissano le tariffe, gli uomini pagano 1 gettone per inviare la richiesta."
            canonicalPath="/about"
            keywords="chi siamo flashmatch, appuntamenti a pagamento, incontri con tariffa, dating a pagamento italia"
        />
        <div className="min-h-screen bg-background">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2">
                            <Heart className="w-8 h-8 text-primary fill-primary" />
                            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                                FlashMatch
                            </span>
                        </Link>
                    </div>
                    <nav className="flex items-center gap-6">
                        <LanguageSelector />
                        <Link to="/">
                            <Button variant="ghost" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {t("common.backToHome")}
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <div className="pt-20">
                <Breadcrumbs />
            </div>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 bg-gradient-hero">
                <div className="container mx-auto text-center max-w-4xl">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        {t("about.heroTitle")}{" "}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                            {t("about.heroHighlight")}
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        {t("about.heroDescription")}
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Heart className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="text-3xl font-bold">{t("about.philosophyTitle")}</h2>
                            <p className="text-lg text-muted-foreground">
                                {t("about.philosophyText1")}
                            </p>
                            <p className="text-lg text-muted-foreground">
                                {t("about.philosophyText2")}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-6 bg-gradient-card border-0 shadow-lg">
                                <h3 className="text-4xl font-bold text-primary mb-2">100%</h3>
                                <p className="text-sm text-muted-foreground">{t("about.completeProfiles", "Profili completi")}</p>
                            </Card>
                            <Card className="p-6 bg-gradient-card border-0 shadow-lg mt-8">
                                <h3 className="text-4xl font-bold text-primary mb-2">24/7</h3>
                                <p className="text-sm text-muted-foreground">{t("about.dedicatedSupport")}</p>
                            </Card>
                            <Card className="p-6 bg-gradient-card border-0 shadow-lg">
                                <h3 className="text-4xl font-bold text-primary mb-2">0</h3>
                                <p className="text-sm text-muted-foreground">{t("about.noBotsOrFakes")}</p>
                            </Card>
                            <Card className="p-6 bg-gradient-card border-0 shadow-lg mt-8">
                                <h3 className="text-4xl font-bold text-primary mb-2">Top</h3>
                                <p className="text-sm text-muted-foreground">{t("about.topPrivacy")}</p>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 px-4 bg-muted/30">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">{t("about.valuesTitle")}</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            {t("about.valuesSubtitle")}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="p-8 bg-background border-none shadow-xl hover:shadow-2xl transition-all">
                            <div className="w-14 h-14 bg-secondary/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <Shield className="w-7 h-7 text-secondary-foreground" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-center">{t("about.value1Title")}</h3>
                            <p className="text-muted-foreground text-center">
                                {t("about.value1Desc")}
                            </p>
                        </Card>

                        <Card className="p-8 bg-background border-none shadow-xl hover:shadow-2xl transition-all">
                            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <Users className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-center">{t("about.value2Title")}</h3>
                            <p className="text-muted-foreground text-center">
                                {t("about.value2Desc")}
                            </p>
                        </Card>

                        <Card className="p-8 bg-background border-none shadow-xl hover:shadow-2xl transition-all">
                            <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <Sparkles className="w-7 h-7 text-accent-foreground" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-center">{t("about.value3Title")}</h3>
                            <p className="text-muted-foreground text-center">
                                {t("about.value3Desc")}
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto text-center">
                    <div className="bg-gradient-primary rounded-3xl p-12 text-primary-foreground shadow-glow">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            {t("about.ctaTitle")}
                        </h2>
                        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                            {t("about.ctaDescription")}
                        </p>
                        <Link to="/auth">
                            <Button size="xl" variant="secondary" className="font-bold text-lg px-8">
                                {t("common.startNow")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer Simple */}
            <footer className="py-8 text-center text-muted-foreground text-sm border-t">
                <p>© 2025 FlashMatch. {t("common.allRightsReserved")}.</p>
            </footer>
        </div>
        </>
    );
};

export default About;