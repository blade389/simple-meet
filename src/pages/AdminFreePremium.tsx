import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, ArrowLeft, Crown, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface PremiumRequest {
  id: string;
  user_id: string;
  social_platform: string;
  social_screenshot_url: string;
  share_screenshot_url: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  profile?: {
    full_name: string;
    gender: string;
  };
}

const AdminFreePremium = () => {
  const [requests, setRequests] = useState<PremiumRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
    loadRequests();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) navigate('/dashboard');
  };

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('free_premium_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, gender')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]));
      const enriched = data.map(r => ({
        ...r,
        profile: profileMap.get(r.user_id) || { full_name: 'Sconosciuto', gender: 'unknown' },
      }));

      setRequests(enriched);
    } catch (err) {
      console.error('Error loading requests:', err);
      toast({ title: 'Errore', description: 'Impossibile caricare le richieste', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
    setProcessingId(requestId);
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      const { error } = await supabase
        .from('free_premium_requests')
        .update({
          status: action,
          admin_notes: adminNotes[requestId] || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved, set user as premium with no expiration
      if (action === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            is_premium: true,
            subscription_status: 'lifetime_free',
            subscription_end: null,
          })
          .eq('id', request.user_id);

        if (profileError) throw profileError;
      }

      toast({
        title: action === 'approved' ? 'Richiesta approvata' : 'Richiesta rifiutata',
        description: action === 'approved'
          ? "L'utente ha ora lo status Premium a vita"
          : "L'utente è stato notificato del rifiuto",
      });

      loadRequests();
    } catch (err: any) {
      toast({ title: 'Errore', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const openScreenshot = async (path: string) => {
    const { data, error } = await supabase.storage
      .from('premium-requests')
      .createSignedUrl(path, 300);

    if (error || !data?.signedUrl) {
      toast({ title: 'Errore', description: 'Impossibile caricare lo screenshot', variant: 'destructive' });
      return;
    }
    window.open(data.signedUrl, '_blank');
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
        <div className="flex items-center gap-3 mb-6">
          <Crown className="w-8 h-8 text-yellow-500" />
          <h2 className="text-3xl font-bold">Verifica Premium Gratuito</h2>
        </div>

        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Caricamento...</p>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nessuna richiesta in sospeso</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id} className="p-6 border-l-4 border-l-yellow-500">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{req.profile?.full_name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        Piattaforma: <strong>{req.social_platform}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Data: {new Date(req.created_at).toLocaleDateString('it-IT', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      In attesa
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openScreenshot(req.social_screenshot_url)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Profilo Social
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openScreenshot(req.share_screenshot_url)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Condivisione Link
                    </Button>
                  </div>

                  <Textarea
                    value={adminNotes[req.id] || ''}
                    onChange={(e) => setAdminNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                    placeholder="Note amministrative (opzionale)"
                    rows={2}
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAction(req.id, 'approved')}
                      disabled={processingId === req.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approva (Premium a vita)
                    </Button>
                    <Button
                      onClick={() => handleAction(req.id, 'rejected')}
                      disabled={processingId === req.id}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rifiuta
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminFreePremium;
