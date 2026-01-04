import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Coins, Crown, Check, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";

const Pricing = () => {
    const tokenPackages = [
        {
            amount: 1,
            price: "10",
            popular: false,
            features: ["1 gettone", "Nessuna scadenza", "Pagamento sicuro"]
        },
        {
            amount: 5,
            price: "40",
            popular: false,
            features: ["5 gettoni", "Nessuna scadenza", "Pagamento sicuro", "Risparmia €10"]
        },
        {
            amount: 10,
            price: "65",
            popular: true,
            features: ["10 gettoni", "Nessuna scadenza", "Pagamento sicuro", "Risparmia €35"]
        },
        {
            amount: 100,
            price: "500",
            popular: false,
            features: ["100 gettoni", "Nessuna scadenza", "Pagamento sicuro", "Risparmia €500"]
        }
    ];

    const premiumPackages = [
        {
            duration: "1 Mese",
            price: "19.99",
            features: ["Badge Profilo Premium", "Visibilità aumentata", "Statistiche avanzate"]
        },
        {
            duration: "3 Mesi",
            price: "49.99",
            features: ["Tutto del mensile", "Risparmi il 15%", "Badge in evidenza"]
        },
        {
            duration: "12 Mesi",
            price: "149.99",
            features: ["Tutto del trimestrale", "Risparmi il 35%", "Supporto VIP dedicato"]
        }
    ];

    return (
        <>
        <SEOHead
            title="Prezzi e Piani | SCOPAMI - Gettoni e Premium"
            description="Scopri i prezzi di SCOPAMI: pacchetti gettoni per uomini e abbonamenti premium per donne. Pagamenti sicuri, nessun costo nascosto."
            canonicalPath="/pricing"
            keywords="prezzi dating app, costo gettoni, abbonamento premium, scopami prezzi"
        />
        <div className="min-h-screen bg-background p-6 md:p-12">
            <Breadcrumbs />
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                        <Coins className="w-8 h-8 text-primary" />
                        Piani e Prezzi
                    </h1>
                </div>

                <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto">
                    Scegli la soluzione più adatta alle tue esigenze. Che tu stia cercando l'anima gemella o offrendo servizi professionali, abbiamo il piano giusto per te.
                </p>

                <Tabs defaultValue="men" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="men">Per Uomini (Gettoni)</TabsTrigger>
                            <TabsTrigger value="women">Per Donne (Premium)</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="men" className="space-y-8">
                        <div className="text-center space-y-4 mb-8">
                            <h2 className="text-2xl font-bold">Pacchetti Gettoni</h2>
                            <p className="text-muted-foreground">
                                Acquista gettoni per rispondere alle richieste e mettere in evidenza il tuo profilo.
                                <br />I gettoni vengono scalati quando rifiuti una richiesta.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {tokenPackages.map((pkg, index) => (
                                <Card key={index} className={`p-6 relative flex flex-col ${pkg.popular ? 'border-primary shadow-glow scale-105 z-10' : 'border-muted/20 hover:border-primary/50'} transition-all duration-300 bg-card/50 backdrop-blur-sm`}>
                                    {pkg.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                                            Più Popolare
                                        </div>
                                    )}
                                    <div className="text-center mb-6">
                                        <div className="text-4xl font-bold mb-2">{pkg.amount}</div>
                                        <div className="text-xl text-muted-foreground">Gettoni</div>
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
                                        Acquista Ora
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="women" className="space-y-8">
                        <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 mb-8 flex gap-4 items-start">
                            <Info className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-lg text-accent mb-2">Nota Importante</h3>
                                <p className="text-muted-foreground">
                                    Il Profilo Premium è <strong>completamente opzionale</strong>. L'utilizzo di base dell'app è gratuito per tutte le donne.
                                    <br />
                                    Questo abbonamento è pensato specificamente per le utenti che desiderano offrire servizi professionali o massimizzare la loro visibilità sulla piattaforma.
                                </p>
                            </div>
                        </div>

                        <div className="text-center space-y-4 mb-8">
                            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                                <Crown className="w-6 h-6 text-yellow-500" />
                                Abbonamenti Premium
                            </h2>
                            <p className="text-muted-foreground">
                                Sblocca strumenti professionali per gestire al meglio la tua presenza.
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
                                        Scegli Piano
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="text-center mt-16 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        Tutti i prezzi sono IVA inclusa. I pagamenti sono sicuri e crittografati.
                        <br />
                        Hai domande? <Link to="/faq" className="text-primary hover:underline">Consulta le FAQ</Link> o contattaci.
                    </p>
                </div>
            </div>
        </div>
        </>
    );
};

export default Pricing;
