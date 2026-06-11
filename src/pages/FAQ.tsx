import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";
import StructuredData from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";

const FAQ = () => {
    const { t } = useTranslation();

    const faqs = [
        {
            question: t('faq.q1'),
            answer: t('faq.a1')
        },
        {
            question: t('faq.q2'),
            answer: t('faq.a2')
        },
        {
            question: t('faq.q3'),
            answer: t('faq.a3')
        },
        {
            question: t('faq.q4'),
            answer: t('faq.a4')
        },
        {
            question: t('faq.q5'),
            answer: t('faq.a5')
        },
        {
            question: t('faq.q6'),
            answer: t('faq.a6')
        },
        {
            question: t('faq.q7'),
            answer: t('faq.a7')
        },
        {
            question: t('faq.q8'),
            answer: t('faq.a8')
        }
    ];

    return (
        <>
        <SEOHead
            title={`${t('faq.title')} | FlashMatch`}
            description="Domande frequenti su FlashMatch: come funziona l'app di dating, sistema gettoni, verifica profili, sicurezza, abbonamento premium e gestione account."
            canonicalPath="/faq"
            keywords="faq flashmatch, dating faq, how flashmatch works, tokens dating"
        />
        <StructuredData schema={{ type: "FAQPage", faqs }} />
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="absolute top-4 right-4 z-50">
                <LanguageSelector />
            </div>
            <Breadcrumbs />
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon" aria-label="Torna alla home">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                        <HelpCircle className="w-8 h-8 text-primary" />
                        {t('faq.title')}
                    </h1>
                </div>

                <div className="grid gap-4">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>

                <div className="text-center mt-12">
                    <p className="text-muted-foreground mb-4">{t('faq.notFound')}</p>
                    <Button variant="outline" asChild>
                        <a href="mailto:support@flashmatch.org">{t('faq.contactSupport')}</a>
                    </Button>
                </div>
            </div>
        </div>
        </>
    );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card
            className="p-6 cursor-pointer hover:shadow-md transition-all duration-200 border-muted/20 bg-card/50 backdrop-blur-sm"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex justify-between items-center gap-4">
                <h3 className="text-lg font-semibold text-foreground">{question}</h3>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
            </div>
            <div
                className={cn(
                    "grid transition-all duration-300 ease-in-out text-muted-foreground",
                    isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    {answer}
                </div>
            </div>
        </Card>
    );
};

export default FAQ;
