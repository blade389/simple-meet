import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Scale } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

const TermsOfService = () => {
    const { t, i18n } = useTranslation();
    
    return (
        <>
        <SEOHead
            title={`${t('common.termsOfService')} | FlashMatch`}
            description={t('legal.terms.seoDescription')}
            canonicalPath="/terms-of-service"
            keywords={t('legal.terms.seoKeywords')}
        />
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/auth">
                            <Button variant="ghost" size="icon" aria-label="Torna indietro">
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                            <Scale className="w-8 h-8 text-primary" />
                            {t('common.termsOfService')}
                        </h1>
                    </div>
                    <LanguageSelector />
                </div>

                <Card className="p-8 shadow-lg border-muted/20 bg-card/50 backdrop-blur-sm">
                    <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">1. {t('legal.terms.introTitle')}</h2>
                            <p>{t('legal.terms.introText')}</p>
                        </section>

                        <section className="bg-destructive/10 p-6 rounded-lg border border-destructive/20">
                            <h2 className="text-2xl font-semibold text-destructive mb-4 flex items-center gap-2">
                                <Shield className="w-6 h-6" />
                                2. {t('legal.terms.liabilityTitle')}
                            </h2>
                            <p className="text-foreground font-medium">
                                {t('legal.terms.liabilityText1')}
                            </p>
                            <p className="mt-4 font-bold text-lg">
                                {t('legal.terms.liabilityText2')}
                            </p>
                            <p className="mt-2">
                                {t('legal.terms.liabilityText3')}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">3. {t('legal.terms.ratesTitle')}</h2>
                            <p>{t('legal.terms.ratesText')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">4. {t('legal.terms.paymentTitle')}</h2>
                            <p>{t('legal.terms.paymentText')}</p>
                        </section>

                        <section className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">5. {t('legal.terms.nonBindingTitle')}</h2>
                            <p>{t('legal.terms.nonBindingText')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">6. {t('legal.terms.eligibilityTitle')}</h2>
                            <p>{t('legal.terms.eligibilityText')}</p>
                        </section>


                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">7. {t('legal.terms.conductTitle')}</h2>
                            <p>{t('legal.terms.conductText')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">8. {t('legal.terms.modificationsTitle')}</h2>
                            <p>{t('legal.terms.modificationsText')}</p>
                        </section>

                        <div className="pt-8 border-t border-border">
                            <p className="text-sm">
                                {t('legal.lastUpdate')}: {new Date().toLocaleDateString(i18n.language)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
        </>
    );
};

export default TermsOfService;