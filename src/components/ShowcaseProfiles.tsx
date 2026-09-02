import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

interface ShowcaseProfile {
  first_name: string;
  age: number;
  photo_url: string;
  bio: string;
  is_premium: boolean;
  nearby: boolean;
}

const ShowcaseProfiles = () => {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<ShowcaseProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [usedLocation, setUsedLocation] = useState(false);

  const load = useCallback(async (lat?: number, lon?: number) => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_showcase_profiles", {
      _lat: lat ?? null,
      _lon: lon ?? null,
      _limit: 8,
    });
    if (!error && data) setProfiles(data as ShowcaseProfile[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await load(pos.coords.latitude, pos.coords.longitude);
        setUsedLocation(true);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 }
    );
  };

  if (!loading && profiles.length === 0) return null;

  return (
    <section className="border-b border-border bg-background px-6 py-24 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h3 className="font-serif text-4xl italic md:text-5xl">
              {t("home.showcaseTitle", { defaultValue: "Profili disponibili ora" })}
            </h3>
            <p className="mt-4 max-w-xl break-words text-muted-foreground">
              {usedLocation
                ? t("home.showcaseSubtitleNear", {
                    defaultValue: "Profili più vicini a te. Iscriviti per vedere tutti i dettagli e le tariffe.",
                  })
                : t("home.showcaseSubtitle", {
                    defaultValue:
                      "Una selezione di profili attivi. Attiva la posizione per vedere chi è nella tua zona.",
                  })}
            </p>
          </div>
          {!usedLocation && (
            <Button
              variant="outline"
              onClick={useMyLocation}
              disabled={locating}
              className="uppercase tracking-widest"
            >
              {locating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-4 w-4" />
              )}
              {t("home.showcaseNearMe", { defaultValue: "Vicino a me" })}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse bg-card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {profiles.map((p, i) => (
              <article
                key={`${p.first_name}-${i}`}
                className="group relative overflow-hidden border border-border bg-card"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={p.photo_url}
                    alt={`${p.first_name}, ${p.age} anni`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    <p className="font-serif text-xl">
                      {p.first_name}, {p.age}
                    </p>
                    {p.is_premium && (
                      <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    )}
                  </div>
                  {p.nearby && (
                    <p className="mt-1 flex items-center gap-1 text-xs uppercase tracking-widest text-primary">
                      <MapPin className="h-3 w-3" />
                      {t("home.showcaseWithin", { defaultValue: "Entro 50 km" })}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link to="/auth">
            <Button size="lg" className="px-10 py-6 text-sm font-bold uppercase tracking-widest">
              {t("home.showcaseCta", { defaultValue: "Iscriviti per vedere tutti i profili" })}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseProfiles;
