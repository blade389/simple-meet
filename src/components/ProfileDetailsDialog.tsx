import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Calendar, MapPin, Crown, Clock, Euro, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ProfilePhoto {
  id: string;
  photo_url: string;
  is_primary: boolean;
}

interface PremiumRate {
  id: string;
  duration_hours: number;
  price_euros: number;
}

interface ProfileDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    id: string;
    full_name: string;
    bio: string | null;
    birth_date: string;
    profile_photo_url: string | null;
    is_premium?: boolean;
    distance?: number;
    positive_reviews_count?: number;
    negative_reviews_count?: number;
  };
  onSendRequest?: (selectedRateId?: string, message?: string) => Promise<void>;
  showSendRequest?: boolean;
  isRequestPending?: boolean;
}

const ProfileDetailsDialog = ({
  open,
  onOpenChange,
  profile,
  onSendRequest,
  showSendRequest = false,
  isRequestPending = false
}: ProfileDetailsDialogProps) => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [premiumRates, setPremiumRates] = useState<PremiumRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRateId, setSelectedRateId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && profile.id) {
      loadPhotos();
      if (profile.is_premium) {
        loadPremiumRates();
      }
    }
  }, [open, profile.id, profile.is_premium]);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_photo_verifications')
        .select('id, photo_url, is_primary')
        .eq('user_id', profile.id)
        .eq('status', 'verified')
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Loaded photos for profile:', profile.id, 'Count:', data?.length, 'Data:', data);
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPremiumRates = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_rates')
        .select('*')
        .eq('user_id', profile.id)
        .order('duration_hours', { ascending: true });

      if (error) throw error;
      setPremiumRates(data || []);
    } catch (error) {
      console.error('Error loading premium rates:', error);
    }
  };

  const handleSendRequest = async () => {
    if (!onSendRequest) return;

    if (profile.is_premium && !selectedRateId) {
      toast({
        title: t('profileDialog.selectRateError'),
        description: t('profileDialog.selectRateErrorDesc'),
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      await onSendRequest(profile.is_premium ? selectedRateId : undefined, message);
      onOpenChange(false);
      setSelectedRateId('');
      setMessage('');
    } catch (error) {
      console.error('Error sending request:', error);
    } finally {
      setSending(false);
    }
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {profile.full_name}
              {profile.is_premium && (
                <Badge variant="secondary" className="gap-1">
                  <Crown className="w-3 h-3" />
                  {t('profileDialog.premium')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-base font-normal">
              <div className="flex items-center gap-1 text-green-600">
                <ThumbsUp className="w-4 h-4" />
                <span>{profile.positive_reviews_count || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <ThumbsDown className="w-4 h-4" />
                <span>{profile.negative_reviews_count || 0}</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Carousel */}
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : photos.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {photos.map((photo) => (
                  <CarouselItem key={photo.id}>
                    <div className="aspect-square relative rounded-lg overflow-hidden">
                      <img
                        src={photo.photo_url}
                        alt={`${profile.full_name} photo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {photos.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          ) : (
            <div className="flex justify-center">
              <Avatar className="w-48 h-48">
                <AvatarImage src={profile.profile_photo_url || undefined} />
                <AvatarFallback className="text-4xl">
                  {profile.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Profile Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{calculateAge(profile.birth_date)} {t('profileDialog.years')}</span>
            </div>

            {profile.distance !== undefined && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{profile.distance.toFixed(1)} km</span>
              </div>
            )}

            {profile.bio && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">{t('profileDialog.bio')}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Premium Rates Section */}
            {profile.is_premium && premiumRates.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" />
                  {t('profileDialog.premiumRates')}
                </h3>
                <div className="space-y-2">
                  {premiumRates.map((rate) => (
                    <div
                      key={rate.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{rate.duration_hours} {rate.duration_hours === 1 ? t('profileDialog.hour') : t('profileDialog.hours')}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-primary">
                          <Euro className="w-4 h-4" />
                          <span>{rate.price_euros}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send Request Section */}
            {showSendRequest && onSendRequest && (
              <div className="pt-4 border-t space-y-4">
                <h3 className="font-semibold">{t('profileDialog.sendRequest')}</h3>

                {profile.is_premium && premiumRates.length > 0 && (
                  <div className="space-y-3">
                    <Label>{t('profileDialog.selectRate')} *</Label>
                    <RadioGroup value={selectedRateId} onValueChange={setSelectedRateId}>
                      {premiumRates.map((rate) => (
                        <div key={rate.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={rate.id} id={rate.id} />
                          <Label htmlFor={rate.id} className="flex items-center gap-3 cursor-pointer">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{rate.duration_hours} {rate.duration_hours === 1 ? t('profileDialog.hour') : t('profileDialog.hours')}</span>
                            <span className="font-semibold text-primary">€{rate.price_euros}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="message">{t('profileDialog.messageOptional')}</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('profileDialog.writeMessage')}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSendRequest}
                  disabled={sending || (profile.is_premium && !selectedRateId) || isRequestPending}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? t('profileDialog.sending') : isRequestPending ? t('profileDialog.requestSent') : t('profileDialog.sendRequest')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDetailsDialog;
