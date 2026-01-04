import { format, Locale } from 'date-fns';
import { it, enUS, fr, de, es, pt, nl, pl } from 'date-fns/locale';
import { Calendar, MapPin, Clock, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const localeMap: Record<string, Locale> = {
  it, en: enUS, fr, de, es, pt, nl, pl
};

interface AppointmentInfoProps {
  date: string;
  location: string;
  isPremium?: boolean;
}

export const AppointmentInfo = ({ date, location, isPremium }: AppointmentInfoProps) => {
  const { t, i18n } = useTranslation();
  const appointmentDate = new Date(date);
  const currentLocale = localeMap[i18n.language] || it;

  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="flex items-start gap-3">
        <Calendar className="w-5 h-5 text-primary mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{t('appointmentInfo.scheduled')}</h4>
            {isPremium && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Crown className="w-3 h-3" />
                Premium
              </Badge>
            )}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {format(appointmentDate, t('appointmentInfo.dateFormat'), { locale: currentLocale })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};