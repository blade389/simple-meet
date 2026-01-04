import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Shield, Zap, Star, Lock, Users, MessageCircle, CheckCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";

const Features = () => {
    const features = [
        {
            icon: <Heart className="w-12 h-12 text-primary" />,
            title: "Donne al Comando",
            description: "In SCOPAMI, ribaltiamo le regole del dating tradizionale. Le donne hanno il controllo totale: sono loro a decidere chi contattare e a chi rispondere. Questo crea un ambiente più sicuro e rispettoso, eliminando messaggi indesiderati."
        },
        {
            icon: <Zap className="w-12 h-12 text-yellow-500" />,
            title: "Sistema a Gettoni",
            description: "Il nostro innovativo sistema a gettoni garantisce interazioni di qualità. Gli uomini utilizzano i gettoni per rispondere alle richieste o per mettere in evidenza il proprio profilo, dimostrando un reale interesse e impegno."
        },
        {
            icon: <Shield className="w-12 h-12 text-green-500" />,
            title: "Verifica dell'Identità",
            description: "La sicurezza è fondamentale. Offriamo un rigoroso processo di verifica che include il controllo dei documenti e selfie in tempo reale. I profili verificati ottengono un badge speciale, garantendo autenticità e fiducia."
        },
        {
            icon: <Star className="w-12 h-12 text-purple-500" />,
            title: "Recensioni Certificate",
            description: "La trasparenza è al centro della nostra community. Dopo ogni incontro confermato, gli utenti possono lasciare una recensione. Questo sistema premia il comportamento corretto e aiuta tutti a fare scelte più informate."
        },
        {
            icon: <Lock className="w-12 h-12 text-blue-500" />,
            title: "Privacy Totale",
            description: "I tuoi dati sono sacri. Utilizziamo crittografia avanzata per proteggere le tue informazioni personali e le tue conversazioni. Hai il controllo completo su ciò che condividi e con chi."
        },
        {
            icon: <Users className="w-12 h-12 text-orange-500" />,
            title: "Community Selezionata",
            description: "Non puntiamo alla quantità, ma alla qualità. La nostra community è composta da persone che cercano connessioni reali. Monitoriamo costantemente l'attività per allontanare profili falsi o comportamenti scorretti."
        },
        {
            icon: <MessageCircle className="w-12 h-12 text-pink-500" />,
            title: "Chat Intelligente",
            description: "La nostra chat è progettata per facilitare la conversazione. Con funzionalità come i suggerimenti di risposta e la possibilità di inviare media in modo sicuro, conoscere qualcuno non è mai stato così semplice."
        },
        {
            icon: <CheckCircle className="w-12 h-12 text-teal-500" />,
            title: "Supporto 24/7",
            description: "Non sei mai solo. Il nostro team di supporto è sempre disponibile per rispondere alle tue domande, risolvere problemi tecnici o gestire segnalazioni. La tua esperienza positiva è la nostra priorità."
        }
    ];

    return (
        <>
        <SEOHead
            title="Caratteristiche Uniche | SCOPAMI Dating App"
            description="Scopri le funzionalità innovative di SCOPAMI: donne al comando, sistema gettoni, verifica identità, recensioni certificate, chat sicura e supporto 24/7."
            canonicalPath="/features"
            keywords="caratteristiche dating app, funzionalità scopami, verifica identità, sistema gettoni"
        />
        <div className="min-h-screen bg-background p-6 md:p-12">
            <Breadcrumbs />
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        Caratteristiche Uniche
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto a provare la differenza?</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        Unisciti oggi stesso a SCOPAMI e scopri un nuovo modo di vivere il dating online.
                    </p>
                    <Link to="/auth">
                        <Button size="xl" variant="secondary" className="font-bold text-lg px-8 shadow-lg hover:shadow-xl transition-all">
                            Inizia Ora Gratuitamente
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
        </>
    );
};

export default Features;
