import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';

interface ReviewFormProps {
  appointmentId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  onSuccess: () => void;
}

export const ReviewForm = ({ appointmentId, reviewedUserId, reviewedUserName, onSuccess }: ReviewFormProps) => {
  const { t } = useTranslation();
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
        title: t('reviewForm.error'),
        description: t('reviewForm.selectRating'),
        variant: 'destructive',
      });
      return;
    }

    if (reported && !reportReason.trim()) {
      toast({
        title: t('reviewForm.error'),
        description: t('reviewForm.enterReportReason'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non autenticato');

      // Get reviewer's profile name
      const { data: reviewerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Set admin_status to 'pending' ONLY if reported (not for negative reviews without report)
      const needsAdminReview = reported;
      
      const { data: insertedReview, error } = await supabase
        .from('reviews')
        .insert({
          appointment_id: appointmentId,
          reviewer_id: user.id,
          reviewed_id: reviewedUserId,
          rating,
          comment: comment.trim() || null,
          reported,
          report_reason: reported ? reportReason.trim() : null,
          admin_status: needsAdminReview ? 'pending' : null,
        })
        .select()
        .single();

      if (error) throw error;

      // If reported, send email notification to admins
      if (reported && insertedReview) {
        console.log('Sending admin notification for report...', {
          reviewId: insertedReview.id,
          reporterName: reviewerProfile?.full_name || 'Utente',
          reportedName: reviewedUserName,
          reportReason: reportReason.trim(),
        });
        
        try {
          const { data: notifData, error: notifError } = await supabase.functions.invoke('send-admin-report-notification', {
            body: {
              reviewId: insertedReview.id,
              reporterName: reviewerProfile?.full_name || 'Utente',
              reportedName: reviewedUserName,
              reportReason: reportReason.trim(),
            },
          });
          
          if (notifError) {
            console.error('Error from admin notification function:', notifError);
          } else {
            console.log('Admin notification sent successfully:', notifData);
          }
        } catch (notifError) {
          console.error('Exception sending admin notification:', notifError);
          // Don't fail the review submission if notification fails
        }
      }

      toast({
        title: t('reviewForm.reviewSent'),
        description: t('reviewForm.thanks'),
      });

      onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: t('reviewForm.error'),
        description: t('reviewForm.submitError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">{t('reviewForm.leaveReviewFor')} {reviewedUserName}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        {t('reviewForm.reviewTimeLimit')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label className="mb-3 block">{t('reviewForm.howWasIt')}</Label>
          <div className="flex gap-4 justify-center">
            <Button
              type="button"
              variant={rating === 5 ? 'default' : 'outline'}
              size="lg"
              onClick={() => setRating(5)}
              className="flex-1 h-20 text-4xl"
            >
              <ThumbsUp className="w-8 h-8" />
            </Button>
            <Button
              type="button"
              variant={rating === 1 ? 'default' : 'outline'}
              size="lg"
              onClick={() => setRating(1)}
              className="flex-1 h-20 text-4xl"
            >
              <ThumbsDown className="w-8 h-8" />
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="comment">{t('reviewForm.commentOptional')}</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('reviewForm.addComment')}
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
                {t('reviewForm.reportBehavior')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('reviewForm.reportDescription')}
              </p>
            </div>
          </div>

          {reported && (
            <div>
              <Label htmlFor="reportReason">{t('reviewForm.reportReason')} *</Label>
              <Textarea
                id="reportReason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder={t('reviewForm.reportReasonPlaceholder')}
                rows={3}
                required={reported}
              />
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t('reviewForm.sending') : t('reviewForm.submit')}
        </Button>
      </form>
    </Card>
  );
};