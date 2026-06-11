import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, ArrowLeft, Upload, Crown, CheckCircle, Clock, XCircle, Instagram } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const FreePremiumRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<string>('');
  const [socialFile, setSocialFile] = useState<File | null>(null);
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadExistingRequest();
  }, [user]);

  const loadExistingRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('free_premium_requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setExistingRequest(data);
    } catch (err) {
      console.error('Error loading request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!platform || !socialFile || !shareFile) {
      toast.error('Compila tutti i campi e carica entrambi gli screenshot');
      return;
    }

    setSubmitting(true);
    try {
      // Upload social screenshot
      const socialPath = `${user!.id}/social-${Date.now()}.${socialFile.name.split('.').pop()}`;
      const { error: socialUploadError } = await supabase.storage
        .from('premium-requests')
        .upload(socialPath, socialFile);
      if (socialUploadError) throw socialUploadError;

      // Upload share screenshot
      const sharePath = `${user!.id}/share-${Date.now()}.${shareFile.name.split('.').pop()}`;
      const { error: shareUploadError } = await supabase.storage
        .from('premium-requests')
        .upload(sharePath, shareFile);
      if (shareUploadError) throw shareUploadError;

      // Create request
      const { error: insertError } = await supabase
        .from('free_premium_requests')
        .insert({
          user_id: user!.id,
          social_platform: platform,
          social_screenshot_url: socialPath,
          share_screenshot_url: sharePath,
        });

      if (insertError) throw insertError;

      toast.success('Richiesta inviata con successo! Verrà valutata dal nostro team.');
      loadExistingRequest();
    } catch (err: any) {
      console.error('Error submitting request:', err);
      toast.error('Errore nell\'invio della richiesta');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approvata</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rifiutata</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />In revisione</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
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
              FlashMatch
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="w-8 h-8 text-yellow-500" />
          <h2 className="text-3xl font-bold">Premium Gratuito</h2>
        </div>

        <Card className="p-6 mb-6 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
          <h3 className="font-semibold text-lg mb-3">Come funziona?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Se hai un account Instagram con <strong>200k+ follower</strong> o un account social con <strong>1.000+ like</strong>, 
            puoi ottenere lo status Premium a vita in cambio della condivisione del nostro sito sul tuo profilo.
          </p>
          <div className="space-y-2 text-sm">
            <p>1️⃣ Seleziona la piattaforma social</p>
            <p>2️⃣ Carica uno screenshot del tuo profilo (che mostri i follower/like)</p>
            <p>3️⃣ Condividi il link del nostro sito sul tuo profilo e carica lo screenshot</p>
            <p>4️⃣ Il nostro team verificherà e approverà la richiesta</p>
          </div>
        </Card>

        {existingRequest && existingRequest.status !== 'rejected' ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">La tua richiesta</h3>
              {getStatusBadge(existingRequest.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              Piattaforma: <strong className="capitalize">{existingRequest.social_platform}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Inviata il: {new Date(existingRequest.created_at).toLocaleDateString('it-IT', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
            {existingRequest.status === 'pending' && (
              <p className="text-sm text-muted-foreground mt-3">
                La tua richiesta è in fase di revisione. Ti notificheremo appena verrà valutata.
              </p>
            )}
            {existingRequest.admin_notes && (
              <div className="mt-3 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Note dell'admin:</p>
                <p className="text-sm">{existingRequest.admin_notes}</p>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-6 space-y-6">
            <h3 className="font-semibold text-lg">Invia la tua richiesta</h3>

            {existingRequest?.status === 'rejected' && (
              <div className="p-3 bg-destructive/10 rounded-md">
                <p className="text-sm text-destructive font-medium">La tua richiesta precedente è stata rifiutata.</p>
                {existingRequest.admin_notes && (
                  <p className="text-sm text-destructive mt-1">Motivo: {existingRequest.admin_notes}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">Puoi inviare una nuova richiesta.</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Piattaforma Social</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona piattaforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram (200k+ follower)</SelectItem>
                  <SelectItem value="onlyfans">OnlyFans (1k+ like)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Screenshot del tuo profilo social
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Carica uno screenshot che mostri chiaramente il numero di follower/like
              </p>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSocialFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="social-screenshot"
                />
                <label htmlFor="social-screenshot" className="cursor-pointer">
                  {socialFile ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm">{socialFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm">Clicca per caricare</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Screenshot della condivisione del nostro link
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Condividi il link del nostro sito sul tuo profilo e carica lo screenshot
              </p>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setShareFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="share-screenshot"
                />
                <label htmlFor="share-screenshot" className="cursor-pointer">
                  {shareFile ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm">{shareFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm">Clicca per caricare</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !platform || !socialFile || !shareFile}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              size="lg"
            >
              {submitting ? 'Invio in corso...' : 'Invia Richiesta'}
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default FreePremiumRequest;
