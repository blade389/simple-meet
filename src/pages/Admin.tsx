import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, ArrowLeft, CheckCircle, XCircle, Clock, ExternalLink, Camera, Trash2, AlertTriangle, ThumbsDown, UserX, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [photoRequests, setPhotoRequests] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [pendingConversationReviewsCount, setPendingConversationReviewsCount] = useState(0);
  const [pendingFreePremiumCount, setPendingFreePremiumCount] = useState(0);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Accesso negato",
          description: "Non hai i permessi per accedere a questa pagina",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      loadVerificationRequests();
      loadPhotoVerificationRequests();
      loadPendingCounts();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCounts = async () => {
    try {
      // Count pending user reports
      const { count: reportsCount, error: reportsError } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('reported', true)
        .eq('admin_status', 'pending');

      if (reportsError) throw reportsError;
      setPendingReportsCount(reportsCount || 0);

      // Count pending conversation reviews
      const { count: conversationCount, error: conversationError } = await supabase
        .from('conversation_reviews')
        .select('*', { count: 'exact', head: true })
        .is('action_taken', null);

      if (conversationError) throw conversationError;
      setPendingConversationReviewsCount(conversationCount || 0);

      // Count pending free premium requests
      const { count: freePremiumCount, error: freePremiumError } = await supabase
        .from('free_premium_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (freePremiumError) throw freePremiumError;
      setPendingFreePremiumCount(freePremiumCount || 0);
    } catch (error) {
      console.error('Error loading pending counts:', error);
    }
  };

  const loadVerificationRequests = async () => {
    try {
      const { data: requests, error: requestsError } = await supabase
        .from('verification_requests')
        .select('*')
        .or('admin_archived.is.null,admin_archived.eq.false')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      if (!requests || requests.length === 0) {
        setRequests([]);
        return;
      }

      // Get user IDs from requests
      const userIds = requests.map(r => r.user_id);

      // Fetch profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, gender')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Merge data
      const requestsWithProfiles = requests.map(request => ({
        ...request,
        profiles: profiles?.find(p => p.id === request.user_id) || null
      }));

      setRequests(requestsWithProfiles);
    } catch (error: any) {
      console.error('Error loading verification requests:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le richieste",
        variant: "destructive"
      });
    }
  };

  const loadPhotoVerificationRequests = async () => {
    try {
      const { data: requests, error: requestsError } = await supabase
        .from('profile_photo_verifications')
        .select('*')
        .or('admin_archived.is.null,admin_archived.eq.false')
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      if (!requests || requests.length === 0) {
        setPhotoRequests([]);
        return;
      }

      // Get user IDs from requests
      const userIds = requests.map(r => r.user_id);

      // Fetch profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, gender')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Merge data
      const requestsWithProfiles = requests.map(request => ({
        ...request,
        profiles: profiles?.find(p => p.id === request.user_id) || null
      }));

      setPhotoRequests(requestsWithProfiles);
    } catch (error: any) {
      console.error('Error loading photo verification requests:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le richieste foto",
        variant: "destructive"
      });
    }
  };

  const handleApprove = async (requestId: string, type: 'identity' | 'photo' = 'identity') => {
    setProcessingId(requestId);
    try {
      const table = type === 'identity' ? 'verification_requests' : 'profile_photo_verifications';
      
      // Get the request data first to have user info for notification
      let userId: string | null = null;
      let isPrimary = false;
      
      if (type === 'identity') {
        const { data, error } = await supabase
          .from('verification_requests')
          .select('user_id')
          .eq('id', requestId)
          .single();
        if (error) throw error;
        userId = data?.user_id;
      } else {
        const { data, error } = await supabase
          .from('profile_photo_verifications')
          .select('user_id, is_primary')
          .eq('id', requestId)
          .single();
        if (error) throw error;
        userId = data?.user_id;
        isPrimary = data?.is_primary || false;
      }
      
      const { error: updateError } = await supabase
        .from(table)
        .update({
          status: 'verified',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Send notification for approvals
      if (userId) {
        try {
          // Get user name for notification
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .single();
          
          if (type === 'identity') {
            const { error: notificationError } = await supabase.functions.invoke('send-verification-approved', {
              body: {
                user_id: userId,
                user_name: profile?.full_name || 'Utente'
              }
            });
            
            if (notificationError) {
              console.error('Error sending verification notification:', notificationError);
            } else {
              console.log('Verification notification sent successfully');
            }
          } else if (type === 'photo') {
            const { error: notificationError } = await supabase.functions.invoke('send-photo-approved', {
              body: {
                user_id: userId,
                user_name: profile?.full_name || 'Utente',
                is_primary: isPrimary
              }
            });
            
            if (notificationError) {
              console.error('Error sending photo notification:', notificationError);
            } else {
              console.log('Photo notification sent successfully');
            }
          }
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
          // Don't fail the approval if notification fails
        }
      }

      toast({
        title: "Richiesta approvata",
        description: type === 'identity' ? "L'utente è stato verificato e notificato" : "La foto è stata verificata e l'utente notificato"
      });

      if (type === 'identity') {
        loadVerificationRequests();
      } else {
        loadPhotoVerificationRequests();
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string, type: 'identity' | 'photo' = 'identity') => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un motivo per il rifiuto",
        variant: "destructive"
      });
      return;
    }

    setProcessingId(requestId);
    try {
      const table = type === 'identity' ? 'verification_requests' : 'profile_photo_verifications';
      const { error } = await supabase
        .from(table)
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Richiesta rifiutata",
        description: "L'utente è stato notificato"
      });
      setRejectionReason('');

      if (type === 'identity') {
        loadVerificationRequests();
      } else {
        loadPhotoVerificationRequests();
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (requestId: string, type: 'identity' | 'photo' = 'identity') => {
    if (!confirm('Sei sicuro di voler nascondere questo documento dalla vista admin? L\'utente continuerà a vedere i propri dati.')) {
      return;
    }

    setProcessingId(requestId);
    try {
      const table = type === 'identity' ? 'verification_requests' : 'profile_photo_verifications';
      const { error } = await supabase
        .from(table)
        .update({ admin_archived: true })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Documento archiviato",
        description: "Il documento è stato nascosto dalla vista admin"
      });

      if (type === 'identity') {
        loadVerificationRequests();
      } else {
        loadPhotoVerificationRequests();
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Verificato</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rifiutato</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />In attesa</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <p className="text-lg">Caricamento...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            Dashboard
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
        <h2 className="text-3xl font-bold mb-6">Pannello Admin</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">


          <Link to="/admin/conversation-reviews">
            <Card className="p-6 hover:shadow-glow transition-shadow cursor-pointer relative">
              <AlertTriangle className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Revisioni</h3>
              <p className="text-muted-foreground text-sm">
                Revisiona conversazioni scadute
              </p>
              {pendingConversationReviewsCount > 0 && (
                <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                  {pendingConversationReviewsCount}
                </Badge>
              )}
            </Card>
          </Link>

          <Link to="/admin/user-reviews">
            <Card className="p-6 hover:shadow-glow transition-shadow cursor-pointer relative">
              <ThumbsDown className="w-12 h-12 text-destructive mb-4" />
              <h3 className="font-semibold text-lg mb-2">Segnalazioni</h3>
              <p className="text-muted-foreground text-sm">
                Gestisci recensioni negative
              </p>
              {pendingReportsCount > 0 && (
                <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                  {pendingReportsCount}
                </Badge>
              )}
            </Card>
          </Link>

          <Link to="/admin/blocked-users">
            <Card className="p-6 hover:shadow-glow transition-shadow cursor-pointer">
              <UserX className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Utenti Bloccati</h3>
              <p className="text-muted-foreground text-sm">
                Gestisci e sblocca utenti
              </p>
            </Card>
          </Link>

          <Link to="/admin/free-premium">
            <Card className="p-6 hover:shadow-glow transition-shadow cursor-pointer relative">
              <Crown className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Verifica Premium</h3>
              <p className="text-muted-foreground text-sm">
                Richieste premium gratuito influencer
              </p>
              {pendingFreePremiumCount > 0 && (
                <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                  {pendingFreePremiumCount}
                </Badge>
              )}
            </Card>
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6">Verifiche in Attesa</h2>

        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="identity">Identità ({requests.length})</TabsTrigger>
            <TabsTrigger value="photos">Foto ({photoRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="space-y-4 mt-6">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nessuna richiesta di verifica identità</p>
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{request.profiles?.full_name}</CardTitle>
                        <CardDescription>
                          {request.profiles?.gender === 'male' ? 'Uomo' : 'Donna'}
                        </CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Richiesta inviata: {new Date(request.created_at).toLocaleDateString('it-IT')}
                      </p>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          const { data, error } = await supabase.storage
                            .from('verification-docs')
                            .createSignedUrl(request.document_url, 300);
                          if (error) {
                            console.error('Signed URL error:', error);
                            toast({
                              title: "Errore",
                              description: "Impossibile caricare il documento",
                              variant: "destructive"
                            });
                            return;
                          }
                          window.open(data.signedUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visualizza Documento
                      </Button>
                    </div>

                    {request.status === 'pending' && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(request.id, 'identity')}
                            disabled={processingId === request.id}
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approva
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Motivo del rifiuto (obbligatorio)"
                            value={processingId === request.id ? rejectionReason : ''}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            disabled={processingId !== null && processingId !== request.id}
                          />
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(request.id, 'identity')}
                            disabled={processingId !== null}
                            className="w-full"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rifiuta
                          </Button>
                        </div>
                      </div>
                    )}

                    {request.status === 'rejected' && request.rejection_reason && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-1">Motivo rifiuto:</p>
                        <p className="text-sm text-muted-foreground">{request.rejection_reason}</p>
                      </div>
                    )}

                    {request.reviewed_at && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Verificato il: {new Date(request.reviewed_at).toLocaleString('it-IT')}
                        </p>
                        {request.status === 'verified' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(request.id, 'identity')}
                            disabled={processingId !== null}
                            className="mt-2 w-full"
                          >
                            Archivia Documento (mantieni verifica)
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="photos" className="space-y-4 mt-6">
            {photoRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nessuna richiesta di verifica foto</p>
                </CardContent>
              </Card>
            ) : (
              photoRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {request.profiles?.full_name}
                          {request.is_primary && (
                            <span className="text-xs font-normal bg-primary text-primary-foreground px-2 py-1 rounded">
                              Foto Principale
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {request.profiles?.gender === 'male' ? 'Uomo' : 'Donna'}
                        </CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Richiesta inviata: {new Date(request.created_at).toLocaleDateString('it-IT')}
                      </p>
                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          onClick={() => window.open(request.photo_url, '_blank')}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Visualizza Foto Profilo
                        </Button>
                      </div>
                      {request.photo_url && (
                        <div className="mt-4">
                          <img
                            src={request.photo_url}
                            alt="Foto profilo"
                            className="w-48 h-48 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(request.id, 'photo')}
                            disabled={processingId === request.id}
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approva Foto
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Motivo del rifiuto (obbligatorio)"
                            value={processingId === request.id ? rejectionReason : ''}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            disabled={processingId !== null && processingId !== request.id}
                          />
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(request.id, 'photo')}
                            disabled={processingId !== null}
                            className="w-full"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rifiuta Foto
                          </Button>
                        </div>
                      </div>
                    )}

                    {request.status === 'rejected' && request.rejection_reason && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-1">Motivo rifiuto:</p>
                        <p className="text-sm text-muted-foreground">{request.rejection_reason}</p>
                      </div>
                    )}

                    {request.reviewed_at && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Verificato il: {new Date(request.reviewed_at).toLocaleString('it-IT')}
                        </p>
                        {request.status === 'verified' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(request.id, 'photo')}
                            disabled={processingId !== null}
                            className="mt-2 w-full"
                          >
                            Archivia Foto (mantieni verifica)
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main >
    </div >
  );
};

export default Admin;
