import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const FounderOffer = () => {
  const { t } = useTranslation();
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

  useEffect(() => {
    supabase.rpc("get_founder_spots_left").then(({ data, error }) => {
      if (!error && typeof data === "number") setSpotsLeft(data);
    });
  }, []);

  if (spotsLeft === 0) return null;

  return (
    <section className="border-b border-border bg-card px-6 py-16 lg:px-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <Crown className="h-10 w-10 text-primary" aria-hidden="true" />
        <h2 className="break-words font-serif text-3xl italic md:text-4xl">
          {t("founder.title", { defaultValue: "Premium a vita per le prime 200 iscritte" })}
        </h2>
        <p className="max-w-2xl break-words text-muted-foreground">
          {t("founder.description", {
            defaultValue:
              "Le prime 200 donne che si registrano ricevono l'abbonamento Premium gratuito per sempre: badge, profilo in evidenza e visibilità in tutto il mondo. Nessun pagamento, nessuna scadenza.",
          })}
        </p>
        {spotsLeft !== null && (
          <p className="text-sm uppercase tracking-widest text-primary">
            {t("founder.spotsLeft", {
              defaultValue: "{{count}} posti ancora disponibili",
              count: spotsLeft,
            })}
          </p>
        )}
        <Link to="/auth">
          <Button size="lg" className="px-10 py-6 text-sm font-bold uppercase tracking-widest">
            {t("founder.cta", { defaultValue: "Prendi il tuo posto" })}
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default FounderOffer;
