import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Coins, Crown, Check, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

const Pricing = () => {
    const { t } = useTranslation();

    const tokenPackages = [
        {
            amount: 1,
            price: "10",
            popular: false,
            features: [`1 ${t("pricing.token")}`, t("pricing.noExpiry"), t("pricing.securePayment")]
        },
        {
            amount: 5,
            price: "40",
            popular: false,
            features: [`5 ${t("pricing.tokens")}`, t("pricing.noExpiry"), t("pricing.securePayment"), `${t("pricing.save")} €10`]
        },
        {
            amount: 10,
            price: "65",
            popular: true,
            features: [`10 ${t("pricing.tokens")}`, t("pricing.noExpiry"), t("pricing.securePayment"), `${t("pricing.save")} €35`]
        },
        {
            amount: 100,
            price: "500",
            popular: false,
            features: [`100 ${t("pricing.tokens")}`, t("pricing.noExpiry"), t("pricing.securePayment"), `${t("pricing.save")} €500`]
        }
    ];

    const premiumPackages = [
        {
            duration: `1 ${t("pricing.month")}`,
            price: "19.99",
            features: [t("pricing.premiumBadge"), t("pricing.increasedVisibility"), t("pricing.advancedStats")]
        },
        {
            duration: `3 ${t("pricing.months")}`,
            price: "49.99",
            features: [t("pricing.everythingInMonthly"), `${t("pricing.savePercent")} 15%`, t("pricing.featuredBadge")]
        },
        {
            duration: `12 ${t("pricing.months")}`,
            price: "149.99",
            features: [t("pricing.everythingInQuarterly"), `${t("pricing.savePercent")} 35%`, t("pricing.vipSupport")]
        }
    ];

    return (
        <>
        <SEOHead
            title={t("pricing.seoTitle")}
            description={t("pricing.seoDescription")}
            canonicalPath="/pricing"
            keywords={t("pricing.seoKeywords")}
        />
        <div className="min-h-screen bg-background p-6 md:p-12">
            <Breadcrumbs />
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon" aria-label="Torna alla home">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                        <Coins className="w-8 h-8 text-primary" />
                        {t("pricing.title")}
                    </h1>
                    <div className="ml-auto">
                        <LanguageSelector />
                    </div>
                </div>

                <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto">
                    {t("pricing.subtitle")}
                </p>

                {/* How payment works */}
                <div className="max-w-4xl mx-auto rounded-2xl border bg-card/50 backdrop-blur-sm p-6 md:p-8">
                    <h2 className="text-xl font-bold text-center mb-6">{t("pricing.howPaymentTitle")}</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            t("pricing.howPaymentStep1"),
                            t("pricing.howPaymentStep2"),
                            t("pricing.howPaymentStep3"),
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                    {i + 1}
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>


                <Tabs defaultValue="men" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="men">{t("pricing.forMen")}</TabsTrigger>
                            <TabsTrigger value="women">{t("pricing.forWomen")}</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="men" className="space-y-8">
                        <div className="text-center space-y-4 mb-8">
                            <h2 className="text-2xl font-bold">{t("pricing.tokenPackages")}</h2>
                            <p className="text-muted-foreground">
                                {t("pricing.tokenDescription")}
                                <br />{t("pricing.tokenDeductionNote")}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {tokenPackages.map((pkg, index) => (
                                <Card key={index} className={`p-6 relative flex flex-col ${pkg.popular ? 'border-primary shadow-glow scale-105 z-10' : 'border-muted/20 hover:border-primary/50'} transition-all duration-300 bg-card/50 backdrop-blur-sm`}>
                                    {pkg.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                                            {t("pricing.mostPopular")}
                                        </div>
                                    )}
                                    <div className="text-center mb-6">
                                        <div className="text-4xl font-bold mb-2">{pkg.amount}</div>
                                        <div className="text-xl text-muted-foreground">{t("pricing.tokens")}</div>
                                    </div>
                                    <div className="text-center mb-8">
                                        <span className="text-3xl font-bold">€{pkg.price}</span>
                                    </div>
                                    <ul className="space-y-4 mb-8 flex-grow">
                                        {pkg.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className="w-full" variant={pkg.popular ? "default" : "outline"}>
                                        {t("pricing.buyNow")}
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="women" className="space-y-8">
                        <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 mb-8 flex gap-4 items-start">
                            <Info className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-lg text-accent mb-2">{t("pricing.premiumNote")}</h3>
                                <p className="text-muted-foreground">
                                    {t("pricing.premiumNoteText")}
                                </p>
                            </div>
                        </div>

                        <div className="text-center space-y-4 mb-8">
                            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                                <Crown className="w-6 h-6 text-yellow-500" />
                                {t("pricing.premiumSubscriptions")}
                            </h2>
                            <p className="text-muted-foreground">
                                {t("pricing.premiumDescription")}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {premiumPackages.map((pkg, index) => (
                                <Card key={index} className="p-8 flex flex-col border-muted/20 hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm">
                                    <div className="text-center mb-6">
                                        <div className="text-2xl font-bold mb-2">{pkg.duration}</div>
                                    </div>
                                    <div className="text-center mb-8">
                                        <span className="text-3xl font-bold">€{pkg.price}</span>
                                    </div>
                                    <ul className="space-y-4 mb-8 flex-grow">
                                        {pkg.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className="w-full" variant="outline">
                                        {t("pricing.choosePlan")}
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="text-center mt-16 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        {t("pricing.pricesIncludeVat")}
                        <br />
                        {t("pricing.haveQuestions")} <Link to="/faq" className="text-primary hover:underline">{t("pricing.checkFaq")}</Link>
                    </p>
                </div>
            </div>
        </div>
        </>
    );
};

export default Pricing;