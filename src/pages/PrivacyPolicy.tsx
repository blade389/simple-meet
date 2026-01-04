import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Eye, FileText } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const PrivacyPolicy = () => {
    return (
        <>
        <SEOHead
            title="Privacy Policy | SCOPAMI"
            description="Informativa sulla privacy di SCOPAMI. Scopri come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali."
            canonicalPath="/privacy-policy"
            keywords="privacy policy, protezione dati, GDPR, privacy dating"
        />
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link to="/auth">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                        <Lock className="w-8 h-8 text-primary" />
                        Privacy Policy
                    </h1>
                </div>

                <Card className="p-8 shadow-lg border-muted/20 bg-card/50 backdrop-blur-sm">
                    <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-primary" />
                                1. Raccolta delle Informazioni
                            </h2>
                            <p>
                                Raccogliamo le informazioni che ci fornisci direttamente quando ti registri, crei un profilo o comunichi con noi. Questo può includere il tuo nome, indirizzo email, data di nascita, genere e preferenze di incontro.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Eye className="w-6 h-6 text-primary" />
                                2. Uso delle Informazioni
                            </h2>
                            <p>
                                Utilizziamo le informazioni raccolte per:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Fornire, mantenere e migliorare i nostri servizi.</li>
                                <li>Facilitare l'organizzazione degli appuntamenti tra gli utenti.</li>
                                <li>Inviarti comunicazioni tecniche, aggiornamenti di sicurezza e messaggi amministrativi.</li>
                                <li>Monitorare e analizzare le tendenze e l'utilizzo del servizio.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Condivisione delle Informazioni</h2>
                            <p>
                                Non vendiamo le tue informazioni personali a terzi. Condividiamo le tue informazioni solo con altri utenti come necessario per facilitare gli appuntamenti (ad esempio, mostrando il tuo profilo ad altri utenti compatibili) o quando richiesto dalla legge.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Sicurezza dei Dati</h2>
                            <p>
                                Adottiamo misure ragionevoli per proteggere le tue informazioni da perdita, furto, uso improprio e accesso non autorizzato. Tuttavia, nessun sistema di sicurezza è impenetrabile e non possiamo garantire la sicurezza assoluta dei nostri database.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">5. I Tuoi Diritti</h2>
                            <p>
                                Hai il diritto di accedere, correggere o cancellare le tue informazioni personali in qualsiasi momento accedendo al tuo profilo o contattandoci direttamente.
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

export default PrivacyPolicy;
