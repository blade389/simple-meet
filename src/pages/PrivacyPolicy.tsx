import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Eye, FileText } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
    const { t, i18n } = useTranslation();
    
    return (
        <>
        <SEOHead
            title={`${t('common.privacyPolicy')} | FlashMatch`}
            description={t('legal.privacy.seoDescription')}
            canonicalPath="/privacy-policy"
            keywords={t('legal.privacy.seoKeywords')}
        />
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/auth">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                            <Lock className="w-8 h-8 text-primary" />
                            {t('common.privacyPolicy')}
                        </h1>
                    </div>
                    <LanguageSelector />
                </div>

                <Card className="p-8 shadow-lg border-muted/20 bg-card/50 backdrop-blur-sm">
                    <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-primary" />
                                1. {t('legal.privacy.collectionTitle')}
                            </h2>
                            <p>{t('legal.privacy.collectionText')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Eye className="w-6 h-6 text-primary" />
                                2. {t('legal.privacy.useTitle')}
                            </h2>
                            <p>{t('legal.privacy.useIntro')}</p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>{t('legal.privacy.useItem1')}</li>
                                <li>{t('legal.privacy.useItem2')}</li>
                                <li>{t('legal.privacy.useItem3')}</li>
                                <li>{t('legal.privacy.useItem4')}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">3. {t('legal.privacy.sharingTitle')}</h2>
                            <p>{t('legal.privacy.sharingText')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">4. {t('legal.privacy.securityTitle')}</h2>
                            <p>{t('legal.privacy.securityText')}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">5. {t('legal.privacy.rightsTitle')}</h2>
                            <p>{t('legal.privacy.rightsText')}</p>
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

export default PrivacyPolicy;