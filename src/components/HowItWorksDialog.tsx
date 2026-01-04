import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, CheckCircle2, AlertCircle, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HowItWorksDialogProps {
    gender: 'male' | 'female';
}

export function HowItWorksDialog({ gender }: HowItWorksDialogProps) {
    const { t } = useTranslation();
    
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <HelpCircle className="w-4 h-4" />
                    {t('dashboard.howItWorks')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-primary" />
                        {t('dashboard.howItWorksTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('dashboard.howItWorksDesc', { gender: gender === 'male' ? t('common.male') : t('common.female') })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Common Step: Verification */}
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <h3 className="font-semibold flex items-center gap-2 mb-2 text-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            1. Verifica il tuo account
                        </h3>
                        <p className="text-muted-foreground">
                            Per iniziare, è necessario verificare la tua identità inviando un documento valido e successivamente una foto profilo. Questo garantisce la sicurezza di tutti gli utenti.
                        </p>
                    </div>

                    {gender === 'male' ? (
                        <>
                            {/* Male Specifics */}
                            <div className="space-y-4">
                                <div className="border-l-4 border-primary pl-4 py-1">
                                    <h3 className="font-semibold text-lg mb-2">Ricezione Richieste</h3>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>Ricevi richieste di appuntamento direttamente dalle donne.</li>
                                        <li>
                                            <strong>Accetta:</strong> Organizzi l'appuntamento gratuitamente.
                                        </li>
                                        <li>
                                            <strong>Rifiuta:</strong> Viene scalato <span className="text-destructive font-medium">1 gettone</span> dal tuo account.
                                        </li>
                                    </ul>
                                    <div className="mt-3 flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                                        <AlertCircle className="w-4 h-4" />
                                        <p>Per ricevere richieste, il tuo saldo gettoni deve essere maggiore di 0.</p>
                                    </div>
                                </div>

                                <div className="border-l-4 border-yellow-500 pl-4 py-1 bg-yellow-50/50 rounded-r-lg">
                                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                        <Crown className="w-5 h-5 text-yellow-500" />
                                        Richieste Premium
                                    </h3>
                                    <p className="text-muted-foreground mb-2">
                                        Puoi inviare richieste per incontri professionali a profili Premium.
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>Ogni richiesta costa <strong>1 gettone</strong> per l'organizzazione.</li>
                                        <li>La tariffa dell'incontro viene pagata direttamente di persona.</li>
                                        <li>Se la richiesta non viene accettata, il gettone viene <strong>rimborsato</strong>.</li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Female Specifics */}
                            <div className="space-y-4">
                                <div className="border-l-4 border-primary pl-4 py-1">
                                    <h3 className="font-semibold text-lg mb-2">Incontri Gratuiti</h3>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li><strong>Scopri Profili:</strong> Trova utenti di tuo gradimento nella sezione Browse.</li>
                                        <li>Invia una richiesta di appuntamento gratuitamente.</li>
                                        <li>Se accettata, verrai messa in contatto per fissare l'incontro.</li>
                                    </ul>
                                    <p className="mt-2 font-medium text-primary">Tutto completamente gratuito.</p>
                                </div>

                                <div className="border-l-4 border-yellow-500 pl-4 py-1 bg-yellow-50/50 rounded-r-lg">
                                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                        <Crown className="w-5 h-5 text-yellow-500" />
                                        Vuoi offrire servizi? (Premium)
                                    </h3>
                                    <p className="text-muted-foreground mb-2">
                                        Puoi sottoscrivere un abbonamento Premium per funzionalità avanzate:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>Gestisci le tue tariffe personalizzate.</li>
                                        <li>Ricevi richieste di appuntamento a pagamento.</li>
                                        <li>Mantieni il controllo totale: sei sempre tu a decidere se accettare o rifiutare!</li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
