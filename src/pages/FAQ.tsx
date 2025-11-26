import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQ = () => {
    const faqs = [
        {
            question: "Come funziona SCOPAMI?",
            answer: "SCOPAMI è un'app di dating innovativa dove le donne hanno il controllo. Le donne possono sfogliare i profili e inviare richieste, mentre gli uomini possono rispondere. Questo garantisce un ambiente più rispettoso e sicuro per tutti."
        },
        {
            question: "Cosa sono i gettoni e come funzionano?",
            answer: "I gettoni sono la valuta virtuale di SCOPAMI. Vengono utilizzati per sbloccare funzionalità premium, come inviare richieste di incontro o mettere in evidenza il proprio profilo. Puoi acquistare pacchetti di gettoni direttamente dall'app."
        },
        {
            question: "L'iscrizione è gratuita?",
            answer: "Sì, la registrazione e la creazione del profilo sono completamente gratuite. Molte funzionalità di base sono accessibili a tutti. Alcune funzionalità avanzate potrebbero richiedere l'utilizzo di gettoni o un abbonamento Premium."
        },
        {
            question: "Come funziona la verifica del profilo?",
            answer: "La sicurezza è la nostra priorità. Per ottenere il badge di 'Profilo Verificato', devi inviare una foto del tuo documento d'identità e un selfie in tempo reale. Il nostro team verificherà la corrispondenza per garantire che tu sia chi dici di essere."
        },
        {
            question: "Le mie informazioni sono al sicuro?",
            answer: "Assolutamente sì. Utilizziamo tecnologie di crittografia avanzate per proteggere i tuoi dati personali. Non condivideremo mai le tue informazioni con terze parti senza il tuo esplicito consenso. Leggi la nostra Privacy Policy per maggiori dettagli."
        },
        {
            question: "Come funzionano le recensioni?",
            answer: "Dopo un incontro confermato tramite l'app, entrambi gli utenti possono lasciare una recensione. Questo aiuta a mantenere alta la qualità della community e premia gli utenti corretti e rispettosi. Solo gli incontri reali possono essere recensiti."
        },
        {
            question: "Posso cancellare il mio account?",
            answer: "Certamente. Puoi cancellare il tuo account in qualsiasi momento dalle impostazioni del profilo. Tieni presente che questa azione è irreversibile e tutti i tuoi dati, inclusi i gettoni non utilizzati, andranno persi."
        }
    ];

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                        <HelpCircle className="w-8 h-8 text-primary" />
                        Domande Frequenti (FAQ)
                    </h1>
                </div>

                <div className="grid gap-4">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>

                <div className="text-center mt-12">
                    <p className="text-muted-foreground mb-4">Non hai trovato la risposta che cercavi?</p>
                    <Button variant="outline" asChild>
                        <a href="mailto:support@scopami.online">Contatta il Supporto</a>
                    </Button>
                </div>
            </div>
        </div>
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
