import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Cookie, Info, Settings } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const CookiePolicy = () => {
    return (
        <>
        <SEOHead
            title="Cookie Policy | SCOPAMI"
            description="Informativa sui cookie di SCOPAMI. Scopri quali cookie utilizziamo e come gestire le tue preferenze."
            canonicalPath="/cookie-policy"
            keywords="cookie policy, gestione cookie, privacy cookie"
        />
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                        <Cookie className="w-8 h-8 text-primary" />
                        Cookie Policy
                    </h1>
                </div>

                <Card className="p-8 shadow-lg border-muted/20 bg-card/50 backdrop-blur-sm">
                    <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Info className="w-6 h-6 text-primary" />
                                1. Cosa sono i Cookie?
                            </h2>
                            <p>
                                I cookie sono piccoli file di testo che vengono salvati sul tuo dispositivo quando visiti un sito web. Sono ampiamente utilizzati per far funzionare i siti web in modo più efficiente, oltre che per fornire informazioni ai proprietari del sito.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Settings className="w-6 h-6 text-primary" />
                                2. Come utilizziamo i Cookie
                            </h2>
                            <p>
                                Utilizziamo i cookie per diversi scopi, tra cui:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>
                                    <strong>Cookie Essenziali:</strong> Necessari per il funzionamento del sito. Includono, ad esempio, i cookie che ti permettono di accedere ad aree protette del nostro sito.
                                </li>
                                <li>
                                    <strong>Cookie di Analisi:</strong> Ci permettono di riconoscere e contare il numero di visitatori e di vedere come i visitatori si muovono nel sito quando lo utilizzano. Questo ci aiuta a migliorare il modo in cui funziona il nostro sito.
                                </li>
                                <li>
                                    <strong>Cookie di Funzionalità:</strong> Utilizzati per riconoscerti quando torni sul nostro sito. Questo ci permette di personalizzare i nostri contenuti per te e ricordare le tue preferenze.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Gestione dei Cookie</h2>
                            <p>
                                La maggior parte dei browser web accetta automaticamente i cookie, ma di solito puoi modificare le impostazioni del browser per rifiutare i cookie se preferisci. Tuttavia, questo potrebbe impedirti di sfruttare appieno il sito web.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Modifiche alla Policy</h2>
                            <p>
                                Potremmo aggiornare questa Cookie Policy di tanto in tanto. Ti invitiamo a controllare periodicamente questa pagina per eventuali modifiche.
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
        </>
    );
};

export default CookiePolicy;
