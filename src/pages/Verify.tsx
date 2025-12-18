import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, ArrowLeft, Upload, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const Verify = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadVerificationRequest();
    }
  }, [user]);

  const loadVerificationRequest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setVerificationRequest(data);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile caricare lo stato della verifica",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Errore",
        description: "Il file deve essere massimo 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/document-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Store the file path instead of public URL since bucket is now private
      const documentPath = filePath;

      const { error: insertError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user?.id,
          document_url: documentPath,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast({
        title: "Documento caricato",
        description: "La tua richiesta di verifica è stata inviata"
      });
      loadVerificationRequest();
    } catch (error: any) {
      console.error('Verification upload error:', error);
      toast({
        title: "Errore",
        description: error.message || "Errore durante il caricamento",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = () => {
    if (!verificationRequest) return Clock;
    switch (verificationRequest.status) {
      case 'verified': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = () => {
    if (!verificationRequest) return 'text-muted-foreground';
    switch (verificationRequest.status) {
      case 'verified': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusText = () => {
    if (!verificationRequest) return 'Non verificato';
    switch (verificationRequest.status) {
      case 'verified': return 'Verificato';
      case 'rejected': return 'Rifiutato';
      default: return 'In attesa di verifica';
    }
  };

  const StatusIcon = getStatusIcon();

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
        <h2 className="text-3xl font-bold mb-6">Verifica Identità</h2>
        
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stato Verifica</CardTitle>
              <CardDescription>Verifica la tua identità per accedere a tutte le funzionalità</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-lg bg-muted ${getStatusColor()}`}>
                <StatusIcon className="w-8 h-8" />
                <div>
                  <p className="font-semibold text-lg">{getStatusText()}</p>
                  {verificationRequest?.rejection_reason && (
                    <p className="text-sm mt-1">Motivo: {verificationRequest.rejection_reason}</p>
                  )}
                </div>
              </div>

              {verificationRequest?.status === 'rejected' && (
                <Alert>
                  <AlertDescription>
                    La tua richiesta è stata rifiutata. Puoi caricare un nuovo documento per una nuova verifica.
                  </AlertDescription>
                </Alert>
              )}

              {(!verificationRequest || verificationRequest.status === 'rejected') && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Carica un documento di identità</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Carta d'identità, patente o passaporto (max 5MB)
                    </p>
                    <input
                      type="file"
                      id="document-upload"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleDocumentUpload}
                      disabled={uploading}
                    />
                    <Button
                      onClick={() => document.getElementById('document-upload')?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Caricamento...' : 'Seleziona Documento'}
                    </Button>
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>Nota:</strong> Il tuo documento verrà verificato dal nostro team entro 24-48 ore. 
                      Assicurati che sia leggibile e che i dati siano visibili.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Verify;
