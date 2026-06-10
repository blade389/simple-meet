import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowLeft, UserX, Unlock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface BlockedUser {
  id: string;
  full_name: string;
  gender: 'male' | 'female';
  profile_photo_url: string | null;
  created_at: string;
}

const BlockedUsers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

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
      loadBlockedUsers();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadBlockedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, gender, profile_photo_url, created_at')
        .eq('is_blocked', true)
        .order('full_name');

      if (error) throw error;
      setBlockedUsers(data || []);
    } catch (error) {
      console.error('Error loading blocked users:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli utenti bloccati",
        variant: "destructive"
      });
    }
  };

  const handleUnblock = async (userId: string, userName: string) => {
    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: false })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Utente sbloccato",
        description: `${userName} è stato sbloccato con successo`,
      });

      // Ricarica la lista
      loadBlockedUsers();
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Errore",
        description: "Impossibile sbloccare l'utente",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
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
          <Link to="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            Admin
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Matchly
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <UserX className="w-8 h-8 text-destructive" />
          <h2 className="text-3xl font-bold">Utenti Bloccati</h2>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {blockedUsers.length}
          </Badge>
        </div>

        {blockedUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UserX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Nessun utente bloccato</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {blockedUsers.map((blockedUser) => (
              <Card key={blockedUser.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {blockedUser.profile_photo_url ? (
                        <img 
                          src={blockedUser.profile_photo_url} 
                          alt={blockedUser.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{blockedUser.full_name}</CardTitle>
                      <CardDescription>
                        {blockedUser.gender === 'male' ? 'Uomo' : 'Donna'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <UserX className="w-3 h-3" />
                      Bloccato
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnblock(blockedUser.id, blockedUser.full_name)}
                      disabled={processingId === blockedUser.id}
                      className="flex items-center gap-2"
                    >
                      <Unlock className="w-4 h-4" />
                      {processingId === blockedUser.id ? 'Sblocco...' : 'Sblocca'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BlockedUsers;
