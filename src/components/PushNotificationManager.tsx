import { Bell, BellOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
    return null;
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const getTooltipText = () => {
    if (permission === 'denied') return 'Permesso negato - abilita dalle impostazioni del browser';
    if (isSubscribed) return 'Notifiche attive - clicca per disattivare';
    return 'Attiva le notifiche push per rimanere aggiornato';
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              {isSubscribed ? (
                <Bell className="h-5 w-5 text-primary" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              <Switch
                checked={isSubscribed}
                onCheckedChange={handleToggle}
                disabled={isLoading || permission === 'denied'}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipText()}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
