import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Users, Calendar, Star, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Profile {
  full_name: string;
  gender: string;
  is_verified: string;
}

interface TokenBalance {
  amount: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tokens, setTokens] = useState<TokenBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadTokens();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, gender, is_verified')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Errore nel caricamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  const loadTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('amount')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setTokens(data);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout effettuato');
    } catch (error) {
      toast.error('Errore durante il logout');
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
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SCOPAMI
            </h1>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Esci
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Ciao, {profile?.full_name || 'Utente'}!
          </h2>
          <p className="text-muted-foreground">
            Benvenuto nella tua dashboard
          </p>
        </div>

        {profile?.is_verified !== 'verified' && (
          <Card className="p-6 mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Verifica Identità Richiesta
            </h3>
            <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-4">
              Per utilizzare tutte le funzionalità dell'app, completa la verifica della tua identità.
            </p>
            <Button variant="default">Completa Verifica</Button>
          </Card>
        )}

        {profile?.gender === 'male' && tokens && (
          <Card className="p-6 mb-6 bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">I Tuoi Gettoni</h3>
                <p className="text-2xl font-bold">{tokens.amount}</p>
              </div>
              <Button variant="secondary" size="lg">
                Acquista Gettoni
              </Button>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-glow transition-shadow">
            <Link to="/browse" className="block">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {profile?.gender === 'female' ? 'Scopri Profili' : 'Richieste'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {profile?.gender === 'female' 
                  ? 'Trova persone interessanti nella tua zona' 
                  : 'Gestisci le richieste ricevute'}
              </p>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-shadow">
            <Link to="/appointments" className="block">
              <Calendar className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Appuntamenti</h3>
              <p className="text-sm text-muted-foreground">
                I tuoi incontri programmati
              </p>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-shadow">
            <Link to="/profile" className="block">
              <Heart className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Il Mio Profilo</h3>
              <p className="text-sm text-muted-foreground">
                Gestisci le tue informazioni
              </p>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-shadow">
            <div className="block">
              <Star className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Recensioni</h3>
              <p className="text-sm text-muted-foreground">
                Le tue valutazioni
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;