import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, ArrowLeft, AlertTriangle, ThumbsDown, UserX, Coins, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Review {
    id: string;
    appointment_id: string;
    reviewer_id: string;
    reviewed_id: string;
    rating: number | null;
    comment: string | null;
    reported: boolean | null;
    report_reason: string | null;
    created_at: string | null;
    admin_status: string | null;
    reviewer: {
        full_name: string;
        gender: string;
    };
    reviewed: {
        full_name: string;
        gender: string;
        id: string;
    };
}

const AdminUserReviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        checkAdmin();
        loadReviews();
    }, []);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/auth');
            return;
        }

        const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin');

        if (!roles || roles.length === 0) {
            navigate('/dashboard');
        }
    };

    const loadReviews = async () => {
        try {
            // Fetch reviews with rating 1 or reported = true, that need admin review
            // Include both admin_status = 'pending' AND admin_status = null (for legacy reviews)
            const { data: reviewsData, error } = await supabase
                .from('reviews')
                .select('*')
                .or('admin_status.eq.pending,admin_status.is.null')
                .or('rating.eq.1,reported.eq.true')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!reviewsData || reviewsData.length === 0) {
                setReviews([]);
                return;
            }

            // Fetch profiles manually
            const userIds = [...new Set(reviewsData.flatMap(r => [r.reviewer_id, r.reviewed_id]))];

            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, gender')
                .in('id', userIds);

            if (profilesError) throw profilesError;

            const profileMap = new Map(profiles?.map(p => [p.id, p]));

            const reviewsWithProfiles = reviewsData.map(review => ({
                ...review,
                reviewer: profileMap.get(review.reviewer_id) || { full_name: 'Utente sconosciuto', gender: 'unknown' },
                reviewed: profileMap.get(review.reviewed_id) || { full_name: 'Utente sconosciuto', gender: 'unknown', id: review.reviewed_id }
            }));

            setReviews(reviewsWithProfiles);
        } catch (error) {
            console.error('Error loading reviews:', error);
            toast({
                title: 'Errore',
                description: 'Impossibile caricare le recensioni. Assicurati che il database sia aggiornato.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (reviewId: string, action: 'deduct_token' | 'block_user' | 'dismiss') => {
        setProcessing(true);
        try {
            const review = reviews.find(r => r.id === reviewId);
            if (!review) return;

            // Update the review status
            const { error: reviewError } = await supabase
                .from('reviews')
                .update({
                    admin_status: action === 'dismiss' ? 'dismissed' : 'reviewed',
                    admin_notes: adminNotes,
                })
                .eq('id', reviewId);

            if (reviewError) throw reviewError;

            // Determine which user to email based on action
            let emailUserId: string | null = null;
            let emailAction: 'deduct_token_male' | 'block_female' | 'no_action' = 'no_action';

            // Execute the action
            if (action === 'deduct_token') {
                const targetUserId = review.reviewed.gender === 'male' ? review.reviewed.id : review.reviewer.gender === 'male' ? review.reviewer_id : null;

                if (!targetUserId) {
                    toast({
                        title: 'Errore',
                        description: 'Nessun utente uomo trovato da penalizzare in questa interazione.',
                        variant: 'destructive',
                    });
                    setProcessing(false);
                    return;
                }

                const { data: tokens, error: fetchError } = await supabase
                    .from('tokens')
                    .select('amount')
                    .eq('user_id', targetUserId)
                    .single();

                if (fetchError) throw fetchError;

                const { error: updateError } = await supabase
                    .from('tokens')
                    .update({
                        amount: Math.max(0, (tokens?.amount || 0) - 1),
                        last_updated: new Date().toISOString(),
                    })
                    .eq('user_id', targetUserId);

                if (updateError) throw updateError;

                emailUserId = targetUserId;
                emailAction = 'deduct_token_male';

                toast({
                    title: 'Azione eseguita',
                    description: 'Gettone scalato all\'utente uomo',
                });
            } else if (action === 'block_user') {
                const targetUserId = review.reviewed.gender === 'female' ? review.reviewed.id : review.reviewer.gender === 'female' ? review.reviewer_id : null;

                if (!targetUserId) {
                    toast({
                        title: 'Errore',
                        description: 'Nessun utente donna trovato da bloccare in questa interazione.',
                        variant: 'destructive',
                    });
                    setProcessing(false);
                    return;
                }

                const { error: blockError } = await supabase
                    .from('profiles')
                    .update({ is_blocked: true })
                    .eq('id', targetUserId);

                if (blockError) throw blockError;

                emailUserId = targetUserId;
                emailAction = 'block_female';

                toast({
                    title: 'Azione eseguita',
                    description: 'Account utente bloccato',
                });
            } else {
                toast({
                    title: 'Azione eseguita',
                    description: 'Recensione archiviata',
                });
            }

            // Note: We no longer close the match here immediately.
            // The match will be closed automatically by:
            // - process-completed-reviews: when both users have reviewed (and no pending reports)
            // - process-expired-reviews: when review deadline expires (and no pending reports)

            // Send email notification if action was taken
            if (emailUserId && emailAction !== 'no_action') {
                try {
                    const { error: emailError } = await supabase.functions.invoke('send-review-action-email', {
                        body: {
                            action: emailAction,
                            userId: emailUserId,
                            adminNotes: adminNotes || '',
                        },
                    });

                    if (emailError) {
                        console.error('Error sending review action email:', emailError);
                    } else {
                        console.log('Review action email sent successfully');
                    }
                } catch (emailErr) {
                    console.error('Error invoking email function:', emailErr);
                }
            }

            setAdminNotes('');
            setSelectedReview(null);
            loadReviews();
        } catch (error) {
            console.error('Error processing action:', error);
            toast({
                title: 'Errore',
                description: 'Impossibile eseguire l\'azione',
                variant: 'destructive',
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-subtle">
            <header className="bg-card border-b shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-5 h-5" />
                        Admin
                    </Link>
                    <div className="flex items-center gap-2">
                        <Heart className="w-8 h-8 text-primary fill-primary" />
                        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                            SCOPAMI
                        </h1>
                    </div>
                    <div className="w-20"></div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                        <h2 className="text-3xl font-bold">Segnalazioni e Recensioni Negative</h2>
                    </div>
                    <Button
                        onClick={async () => {
                            setProcessing(true);
                            try {
                                const { error } = await supabase.rpc('recalculate_all_review_counts');
                                if (error) throw error;
                                toast({ title: "Successo", description: "Conteggi recensioni ricalcolati." });
                            } catch (e: any) {
                                toast({ title: "Errore", description: e.message, variant: "destructive" });
                            } finally {
                                setProcessing(false);
                            }
                        }}
                        disabled={processing}
                        variant="outline"
                    >
                        <Coins className="w-4 h-4 mr-2" />
                        Ricalcola Conteggi
                    </Button>
                </div>

                {loading ? (
                    <Card className="p-8 text-center">
                        <p className="text-muted-foreground">Caricamento...</p>
                    </Card>
                ) : reviews.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-muted-foreground">Nessuna segnalazione in sospeso</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <Card key={review.id} className="p-6 border-l-4 border-l-destructive">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">
                                                    {review.reviewer.full_name} ({review.reviewer.gender === 'male' ? 'Uomo' : 'Donna'})
                                                    {' -> '}
                                                    {review.reviewed.full_name} ({review.reviewed.gender === 'male' ? 'Uomo' : 'Donna'})
                                                </h3>
                                                {review.reported && (
                                                    <Badge variant="destructive" className="flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Segnalato
                                                    </Badge>
                                                )}
                                                {review.rating === 1 && (
                                                    <Badge variant="secondary" className="flex items-center gap-1">
                                                        <ThumbsDown className="w-3 h-3" />
                                                        Rating 1
                                                    </Badge>
                                                )}
                                            </div>

                                            {review.comment && (
                                                <div className="bg-muted p-3 rounded-md">
                                                    <p className="text-sm font-medium mb-1">Commento:</p>
                                                    <p className="text-sm">{review.comment}</p>
                                                </div>
                                            )}

                                            {review.reported && review.report_reason && (
                                                <div className="bg-destructive/10 p-3 rounded-md">
                                                    <p className="text-sm font-medium mb-1 text-destructive">Motivo Segnalazione:</p>
                                                    <p className="text-sm text-destructive">{review.report_reason}</p>
                                                </div>
                                            )}

                                            <p className="text-sm text-muted-foreground">
                                                Data: {review.created_at ? new Date(review.created_at).toLocaleDateString('it-IT', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedReview === review.id ? (
                                        <div className="space-y-4 pt-4 border-t">
                                            <Textarea
                                                value={adminNotes}
                                                onChange={(e) => setAdminNotes(e.target.value)}
                                                placeholder="Note amministrative (opzionale)"
                                                rows={3}
                                            />
                                            <div className="flex gap-2 flex-wrap">
                                                <Button
                                                    onClick={() => handleAction(review.id, 'deduct_token')}
                                                    disabled={processing}
                                                    variant="destructive"
                                                    className="bg-orange-500 hover:bg-orange-600"
                                                >
                                                    <Coins className="w-4 h-4 mr-2" />
                                                    Scala Gettone (Uomo)
                                                </Button>
                                                <Button
                                                    onClick={() => handleAction(review.id, 'block_user')}
                                                    disabled={processing}
                                                    variant="destructive"
                                                >
                                                    <UserX className="w-4 h-4 mr-2" />
                                                    Blocca Utente (Donna)
                                                </Button>
                                                <Button
                                                    onClick={() => handleAction(review.id, 'dismiss')}
                                                    disabled={processing}
                                                    variant="outline"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Archivia / Risolto
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setSelectedReview(null);
                                                        setAdminNotes('');
                                                    }}
                                                    disabled={processing}
                                                    variant="ghost"
                                                >
                                                    Annulla
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button onClick={() => setSelectedReview(review.id)}>
                                            Gestisci Segnalazione
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminUserReviews;
