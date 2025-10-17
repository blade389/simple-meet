import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowLeft, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
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
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

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

  const loadVerificationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          profiles:user_id (full_name, gender, location_city)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile caricare le richieste",
        variant: "destructive"
      });
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'verified',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Richiesta approvata",
        description: "L'utente è stato verificato con successo"
      });
      loadVerificationRequests();
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

  const handleReject = async (requestId: string) => {
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
      const { error } = await supabase
        .from('verification_requests')
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
      loadVerificationRequests();
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
        <h2 className="text-3xl font-bold mb-6">Pannello Admin - Verifiche</h2>
        
        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nessuna richiesta di verifica</p>
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
                        {request.profiles?.gender === 'male' ? 'Uomo' : 'Donna'} • {request.profiles?.location_city}
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
                      onClick={() => window.open(request.document_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visualizza Documento
                    </Button>
                  </div>

                  {request.status === 'pending' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(request.id)}
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
                          onClick={() => handleReject(request.id)}
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
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      Verificato il: {new Date(request.reviewed_at).toLocaleString('it-IT')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
