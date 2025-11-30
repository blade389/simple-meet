import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const PushNotificationManager = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifiche Push
          </CardTitle>
          <CardDescription>
            Il tuo browser non supporta le notifiche push
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifiche Push
        </CardTitle>
        <CardDescription>
          Ricevi notifiche in tempo reale per match, messaggi e promemoria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-sm font-medium">
              {isSubscribed ? 'Notifiche attive' : 'Notifiche disattivate'}
            </div>
            <div className="text-xs text-muted-foreground">
              {permission === 'denied' && 'Permesso negato dal browser'}
              {permission === 'default' && 'Clicca per attivare le notifiche'}
              {permission === 'granted' && isSubscribed && 'Riceverai aggiornamenti in tempo reale'}
              {permission === 'granted' && !isSubscribed && 'Attiva per ricevere notifiche'}
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading || permission === 'denied'}
          />
        </div>

        {permission === 'denied' && (
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
            Per attivare le notifiche, devi abilitarle nelle impostazioni del browser.
          </div>
        )}

        {!isSubscribed && permission !== 'denied' && (
          <Button
            onClick={subscribe}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            <Bell className="h-4 w-4 mr-2" />
            Attiva notifiche push
          </Button>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Riceverai notifiche per:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Nuove richieste di match</li>
            <li>Match accettati</li>
            <li>Nuovi messaggi in chat</li>
            <li>Promemoria scadenze</li>
            <li>Recensioni ricevute</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
