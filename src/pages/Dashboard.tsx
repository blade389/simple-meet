import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Users, Calendar, Star, LogOut, Shield, MapPin } from 'lucide-react';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadTokens();
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

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

  const updateLocation = async () => {
    setUpdatingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocalizzazione non supportata dal browser');
      setUpdatingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              location_lat: position.coords.latitude,
              location_lon: position.coords.longitude
            })
            .eq('id', user?.id);

          if (error) throw error;

          toast.success('Posizione aggiornata con successo');
          loadProfile();
        } catch (error: any) {
          toast.error('Errore nell\'aggiornamento della posizione');
        } finally {
          setUpdatingLocation(false);
        }
      },
      (error) => {
        toast.error('Impossibile ottenere la posizione. Assicurati di aver dato i permessi.');
        setUpdatingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-3">
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
          <Button 
            onClick={updateLocation} 
            disabled={updatingLocation}
            className="w-full"
            variant="outline"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {updatingLocation ? 'Aggiornamento...' : 'Aggiorna Posizione'}
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
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Verifica Identità Richiesta
                </h3>
                <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-4">
                  Per utilizzare tutte le funzionalità dell'app, completa la verifica della tua identità.
                </p>
                <Button variant="default" asChild>
                  <Link to="/verify">Completa Verifica</Link>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {profile?.gender === 'male' && tokens && (
          <Card className="p-6 mb-6 bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">I Tuoi Gettoni</h3>
                <p className="text-2xl font-bold">{tokens.amount}</p>
              </div>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/buy-tokens">Acquista Gettoni</Link>
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

        {isAdmin && (
          <Card className="p-6 mb-8 bg-gradient-primary text-white">
            <Link to="/admin" className="block">
              <div className="flex items-center gap-4">
                <Shield className="w-12 h-12" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Pannello Admin</h3>
                  <p className="text-sm opacity-90">
                    Gestisci le richieste di verifica
                  </p>
                </div>
              </div>
            </Link>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;