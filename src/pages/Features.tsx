import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Shield, Zap, Star, Lock, Users, MessageCircle, CheckCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";

const Features = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: <Heart className="w-12 h-12 text-primary" />,
            title: t('features.feature1Title'),
            description: t('features.feature1Desc')
        },
        {
            icon: <Zap className="w-12 h-12 text-yellow-500" />,
            title: t('features.feature2Title'),
            description: t('features.feature2Desc')
        },
        {
            icon: <Shield className="w-12 h-12 text-green-500" />,
            title: t('features.feature3Title'),
            description: t('features.feature3Desc')
        },
        {
            icon: <Star className="w-12 h-12 text-purple-500" />,
            title: t('features.feature4Title'),
            description: t('features.feature4Desc')
        },
        {
            icon: <Lock className="w-12 h-12 text-blue-500" />,
            title: t('features.feature5Title'),
            description: t('features.feature5Desc')
        },
        {
            icon: <Users className="w-12 h-12 text-orange-500" />,
            title: t('features.feature6Title'),
            description: t('features.feature6Desc')
        },
        {
            icon: <MessageCircle className="w-12 h-12 text-pink-500" />,
            title: t('features.feature7Title'),
            description: t('features.feature7Desc')
        },
        {
            icon: <CheckCircle className="w-12 h-12 text-teal-500" />,
            title: t('features.feature8Title'),
            description: t('features.feature8Desc')
        }
    ];

    return (
        <>
        <SEOHead
            title={`${t('features.title')} | Matchly`}
            description={t('features.feature1Desc')}
            canonicalPath="/features"
            keywords="dating app features, matchly features, identity verification, token system"
        />
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="absolute top-4 right-4 z-50">
                <LanguageSelector />
            </div>
            <Breadcrumbs />
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        {t('features.title')}
                    </h1>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 border-muted/20 bg-card/50 backdrop-blur-sm group">
                            <div className="mb-6 p-4 rounded-full bg-background/50 w-fit group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-foreground">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>

                <div className="bg-gradient-primary rounded-3xl p-8 md:p-16 text-center text-primary-foreground mt-16 shadow-glow">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('features.ctaTitle')}</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        {t('features.ctaDescription')}
                    </p>
                    <Link to="/auth">
                        <Button size="xl" variant="secondary" className="font-bold text-lg px-8 shadow-lg hover:shadow-xl transition-all">
                            {t('features.ctaButton')}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
        </>
    );
};

export default Features;
