import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Scale } from "lucide-react";

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link to="/auth">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                        <Scale className="w-8 h-8 text-primary" />
                        Termini di Servizio
                    </h1>
                </div>

                <Card className="p-8 shadow-lg border-muted/20 bg-card/50 backdrop-blur-sm">
                    <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduzione</h2>
                            <p>
                                Benvenuto su SCOPAMI. Utilizzando il nostro sito web e i nostri servizi, accetti di rispettare e di essere vincolato dai seguenti termini e condizioni. Ti preghiamo di leggerli attentamente.
                            </p>
                        </section>

                        <section className="bg-destructive/10 p-6 rounded-lg border border-destructive/20">
                            <h2 className="text-2xl font-semibold text-destructive mb-4 flex items-center gap-2">
                                <Shield className="w-6 h-6" />
                                2. Limitazione di Responsabilità
                            </h2>
                            <p className="text-foreground font-medium">
                                SCOPAMI agisce esclusivamente come intermediario per facilitare l'organizzazione di appuntamenti tra gli utenti.
                            </p>
                            <p className="mt-4 font-bold text-lg">
                                È importante comprendere che SCOPAMI si occupa solo ed esclusivamente di organizzare l'appuntamento. Una volta che l'appuntamento è stato fissato e le parti sono state messe in contatto, non abbiamo alcuna responsabilità, controllo o obbligo riguardo a ciò che accade successivamente, né online né offline.
                            </p>
                            <p className="mt-2">
                                Non siamo responsabili per le azioni, i comportamenti o la condotta di qualsiasi utente, sia online che offline. L'utente è l'unico responsabile delle proprie interazioni con gli altri membri.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Idoneità</h2>
                            <p>
                                Devi avere almeno 18 anni per utilizzare questo servizio. Utilizzando SCOPAMI, dichiari e garantisci di avere il diritto, l'autorità e la capacità di accettare questi Termini e di rispettarli.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Regole di Condotta</h2>
                            <p>
                                Ti impegni a non utilizzare il servizio per scopi illegali o proibiti. È vietato molestare, intimidire o diffamare altri utenti. Ci riserviamo il diritto di sospendere o terminare il tuo account se violi queste regole.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Modifiche ai Termini</h2>
                            <p>
                                Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Le modifiche saranno effettive immediatamente dopo la pubblicazione sul sito. L'uso continuato del servizio dopo tali modifiche costituisce l'accettazione dei nuovi termini.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-border">
                            <p className="text-sm">
                                Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TermsOfService;
