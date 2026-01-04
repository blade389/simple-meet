import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AppointmentFormProps {
  matchRequestId: string;
  otherUserId: string;
  otherUserName: string;
  onSuccess: () => void;
}

export const AppointmentForm = ({ matchRequestId, otherUserId, otherUserName, onSuccess }: AppointmentFormProps) => {
  const { t } = useTranslation();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non autenticato');

      // Get current user's profile name
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { data: matchRequest } = await supabase
        .from('match_requests')
        .select('sender_id, receiver_id')
        .eq('id', matchRequestId)
        .single();

      if (!matchRequest) throw new Error('Richiesta non trovata');

      const appointmentDateTime = new Date(`${date}T${time}`);

      const { error } = await supabase
        .from('appointments')
        .insert({
          match_request_id: matchRequestId,
          female_user_id: matchRequest.sender_id,
          male_user_id: matchRequest.receiver_id,
          appointment_date: appointmentDateTime.toISOString(),
          location,
          status: 'scheduled'
        });

      if (error) throw error;

      // Send email and push notification to the other user
      supabase.functions.invoke('send-appointment-scheduled', {
        body: {
          recipientUserId: otherUserId,
          schedulerName: myProfile?.full_name || 'Utente',
          appointmentDate: appointmentDateTime.toISOString(),
          location,
        },
      }).catch(err => console.log('Appointment notification error (non-blocking):', err));

      toast({
        title: t('appointmentForm.success'),
        description: t('appointmentForm.successDesc'),
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: t('appointmentForm.error'),
        description: t('appointmentForm.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">{t('appointmentForm.title')}</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="date">{t('appointmentForm.date')}</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <Label htmlFor="time">{t('appointmentForm.time')}</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">{t('appointmentForm.location')}</Label>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('appointmentForm.locationPlaceholder')}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t('appointmentForm.registering') : t('appointmentForm.submit')}
        </Button>
      </form>
    </Card>
  );
};
