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
                            {t('howItWorks.step1Title')}
                        </h3>
                        <p className="text-muted-foreground">
                            {t('howItWorks.step1Desc')}
                        </p>
                    </div>

                    {gender === 'male' ? (
                        <>
                            {/* Male Specifics */}
                            <div className="space-y-4">
                                <div className="border-l-4 border-primary pl-4 py-1">
                                    <h3 className="font-semibold text-lg mb-2">{t('howItWorks.male.receivingTitle')}</h3>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>{t('howItWorks.male.receiveRequests')}</li>
                                        <li>
                                            <strong>{t('howItWorks.male.accept')}:</strong> {t('howItWorks.male.acceptDesc')}
                                        </li>
                                        <li>
                                            <strong>{t('howItWorks.male.reject')}:</strong> {t('howItWorks.male.rejectDesc')}
                                        </li>
                                    </ul>
                                    <div className="mt-3 flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                                        <AlertCircle className="w-4 h-4" />
                                        <p>{t('howItWorks.male.tokenWarning')}</p>
                                    </div>
                                </div>

                                <div className="border-l-4 border-yellow-500 pl-4 py-1 bg-yellow-50/50 rounded-r-lg">
                                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                        <Crown className="w-5 h-5 text-yellow-500" />
                                        {t('howItWorks.male.premiumTitle')}
                                    </h3>
                                    <p className="text-muted-foreground mb-2">
                                        {t('howItWorks.male.premiumDesc')}
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>{t('howItWorks.male.premiumCost')}</li>
                                        <li>{t('howItWorks.male.premiumPayment')}</li>
                                        <li>{t('howItWorks.male.premiumRefund')}</li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Female Specifics */}
                            <div className="space-y-4">
                                <div className="border-l-4 border-primary pl-4 py-1">
                                    <h3 className="font-semibold text-lg mb-2">{t('howItWorks.female.freeTitle')}</h3>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li><strong>{t('howItWorks.female.discover')}:</strong> {t('howItWorks.female.discoverDesc')}</li>
                                        <li>{t('howItWorks.female.sendRequest')}</li>
                                        <li>{t('howItWorks.female.ifAccepted')}</li>
                                    </ul>
                                    <p className="mt-2 font-medium text-primary">{t('howItWorks.female.allFree')}</p>
                                </div>

                                <div className="border-l-4 border-yellow-500 pl-4 py-1 bg-yellow-50/50 rounded-r-lg">
                                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                        <Crown className="w-5 h-5 text-yellow-500" />
                                        {t('howItWorks.female.premiumTitle')}
                                    </h3>
                                    <p className="text-muted-foreground mb-2">
                                        {t('howItWorks.female.premiumDesc')}
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>{t('howItWorks.female.manageRates')}</li>
                                        <li>{t('howItWorks.female.receiveRequests')}</li>
                                        <li>{t('howItWorks.female.fullControl')}</li>
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
