import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ReviewFormProps {
  appointmentId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  onSuccess: () => void;
}

export const ReviewForm = ({ appointmentId, reviewedUserId, reviewedUserName, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [reported, setReported] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === null) {
      toast({
        title: 'Errore',
        description: 'Seleziona una valutazione.',
        variant: 'destructive',
      });
      return;
    }

    if (reported && !reportReason.trim()) {
      toast({
        title: 'Errore',
        description: 'Inserisci il motivo della segnalazione.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non autenticato');

      const { error } = await supabase
        .from('reviews')
        .insert({
          appointment_id: appointmentId,
          reviewer_id: user.id,
          reviewed_id: reviewedUserId,
          rating,
          comment: comment.trim() || null,
          reported,
          report_reason: reported ? reportReason.trim() : null,
        });

      if (error) throw error;

      toast({
        title: 'Recensione inviata!',
        description: 'Grazie per il tuo feedback.',
      });

      onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Errore',
        description: 'Non è stato possibile inviare la recensione.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Lascia una recensione per {reviewedUserName}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Hai 24 ore dall'appuntamento per lasciare una recensione.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label className="mb-3 block">Come è andata?</Label>
          <div className="flex gap-4 justify-center">
            <Button
              type="button"
              variant={rating === 1 ? 'default' : 'outline'}
              size="lg"
              onClick={() => setRating(1)}
              className="flex-1 h-20 text-4xl"
            >
              <ThumbsUp className="w-8 h-8" />
            </Button>
            <Button
              type="button"
              variant={rating === -1 ? 'default' : 'outline'}
              size="lg"
              onClick={() => setRating(-1)}
              className="flex-1 h-20 text-4xl"
            >
              <ThumbsDown className="w-8 h-8" />
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="comment">Commento (opzionale)</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Aggiungi un commento sulla tua esperienza..."
            rows={4}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="report"
              checked={reported}
              onCheckedChange={(checked) => setReported(checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="report" className="flex items-center gap-2 cursor-pointer">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Segnala comportamento scorretto
              </Label>
              <p className="text-xs text-muted-foreground">
                Segnala se l'utente non si è presentato o ha avuto un comportamento inappropriato
              </p>
            </div>
          </div>

          {reported && (
            <div>
              <Label htmlFor="reportReason">Motivo della segnalazione *</Label>
              <Textarea
                id="reportReason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Descrivi il problema (es: l'utente non si è presentato)"
                rows={3}
                required={reported}
              />
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Invio...' : 'Invia Recensione'}
        </Button>
      </form>
    </Card>
  );
};