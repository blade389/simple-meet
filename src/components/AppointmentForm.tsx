import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';

interface AppointmentFormProps {
  matchRequestId: string;
  otherUserId: string;
  onSuccess: () => void;
}

export const AppointmentForm = ({ matchRequestId, otherUserId, onSuccess }: AppointmentFormProps) => {
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

      // Send push notification to the other user (fire and forget)
      const formattedDate = appointmentDateTime.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      supabase.functions.invoke('send-push-notification', {
        body: {
          userId: otherUserId,
          title: '📅 Appuntamento fissato!',
          body: `Appuntamento il ${formattedDate} - ${location}`,
          url: '/appointments',
          tag: 'appointment-scheduled',
        },
      }).catch(err => console.log('Push notification error (non-blocking):', err));

      toast({
        title: 'Appuntamento registrato!',
        description: 'L\'appuntamento è stato salvato con successo.',
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Errore',
        description: 'Non è stato possibile registrare l\'appuntamento.',
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
        <h3 className="text-lg font-semibold">Registra Appuntamento</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="date">Data</Label>
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
          <Label htmlFor="time">Ora</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Luogo</Label>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Es: Caffè Centrale, Via Roma 10"
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Registrazione...' : 'Registra Appuntamento'}
        </Button>
      </form>
    </Card>
  );
};
