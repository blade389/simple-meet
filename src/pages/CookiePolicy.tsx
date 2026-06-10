import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Cookie, Info, Settings } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

const CookiePolicy = () => {
    const { t, i18n } = useTranslation();
    
    return (
        <>
        <SEOHead
            title={`${t('common.cookiePolicy')} | Matchly`}
            description={t('legal.cookie.seoDescription')}
            canonicalPath="/cookie-policy"
            keywords={t('legal.cookie.seoKeywords')}
        />
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                            <Cookie className="w-8 h-8 text-primary" />
                            {t('common.cookiePolicy')}
                        </h1>
                    </div>
                    <LanguageSelector />
                </div>

                <Card className="p-8 shadow-lg border-muted/20 bg-card/50 backdrop-blur-sm">
                    <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Info className="w-6 h-6 text-primary" />
                                1. {t('legal.cookie.whatAreTitle')}
                            </h2>
                            <p>{t('legal.cookie.whatAreText')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Settings className="w-6 h-6 text-primary" />
                                2. {t('legal.cookie.howWeUseTitle')}
                            </h2>
                            <p>{t('legal.cookie.howWeUseIntro')}</p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>
                                    <strong>{t('legal.cookie.essentialTitle')}:</strong> {t('legal.cookie.essentialText')}
                                </li>
                                <li>
                                    <strong>{t('legal.cookie.analyticsTitle')}:</strong> {t('legal.cookie.analyticsText')}
                                </li>
                                <li>
                                    <strong>{t('legal.cookie.functionalTitle')}:</strong> {t('legal.cookie.functionalText')}
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">3. {t('legal.cookie.managementTitle')}</h2>
                            <p>{t('legal.cookie.managementText')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">4. {t('legal.cookie.changesTitle')}</h2>
                            <p>{t('legal.cookie.changesText')}</p>
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

export default CookiePolicy;