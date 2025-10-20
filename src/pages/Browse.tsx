import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string;
  bio: string | null;
  birth_date: string;
  location_city: string;
  gender: string;
  profile_photo_url: string | null;
  photo_verification_status: string;
  location_lat: number | null;
  location_lon: number | null;
  distance?: number;
}

interface MatchRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  message: string | null;
  created_at: string;
  sender_profile?: Profile;
}

const Browse = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [respondingToRequest, setRespondingToRequest] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMyProfile();
    }
  }, [user]);

  const loadMyProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setMyProfile(data);
      
      if (data.gender === 'female') {
        loadNearbyProfiles(data);
      } else if (data.gender === 'male') {
        loadMatchRequests();
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile caricare il profilo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyProfiles = async (myProfile: Profile) => {
    if (!myProfile.location_lat || !myProfile.location_lon) {
      toast({
        title: "Posizione non disponibile",
        description: "Aggiorna la tua posizione dal dashboard per vedere i profili vicini",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('gender', 'male')
        .eq('photo_verification_status', 'verified')
        .not('location_lat', 'is', null)
        .not('location_lon', 'is', null);

      if (error) throw error;

      const profilesWithDistance = data
        .map((profile: any) => {
          const distance = calculateDistance(
            myProfile.location_lat!,
            myProfile.location_lon!,
            profile.location_lat,
            profile.location_lon
          );
          return { ...profile, distance };
        })
        .filter((profile: any) => profile.distance <= 20)
        .sort((a: any, b: any) => a.distance - b.distance);

      setProfiles(profilesWithDistance);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i profili",
        variant: "destructive"
      });
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const loadMatchRequests = async () => {
    try {
      const { data: requests, error: requestsError } = await supabase
        .from('match_requests')
        .select('*')
        .eq('receiver_id', user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      if (!requests || requests.length === 0) {
        setMatchRequests([]);
        return;
      }

      // Get sender profiles
      const senderIds = requests.map(r => r.sender_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', senderIds);

      if (profilesError) throw profilesError;

      // Merge requests with profiles
      const requestsWithProfiles = requests.map(request => ({
        ...request,
        sender_profile: profiles?.find(p => p.id === request.sender_id)
      }));

      setMatchRequests(requestsWithProfiles);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile caricare le richieste",
        variant: "destructive"
      });
    }
  };

  const sendMatchRequest = async (receiverId: string) => {
    setSendingRequest(receiverId);
    try {
      const { error } = await supabase
        .from('match_requests')
        .insert({
          sender_id: user?.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Richiesta inviata",
        description: "La tua richiesta è stata inviata con successo"
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSendingRequest(null);
    }
  };

  const respondToRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    setRespondingToRequest(requestId);
    try {
      const { error } = await supabase
        .from('match_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: action === 'accepted' ? "Richiesta accettata" : "Richiesta rifiutata",
        description: action === 'accepted' 
          ? "Puoi procedere a fissare un appuntamento" 
          : "La richiesta è stata rifiutata"
      });

      loadMatchRequests();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setRespondingToRequest(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <p className="text-lg">Caricamento...</p>
      </div>
    );
  }

  if (myProfile?.gender === 'male') {
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
          <h2 className="text-3xl font-bold mb-6">Richieste Ricevute</h2>
          
          {matchRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Non hai ancora ricevuto richieste
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={request.sender_profile?.profile_photo_url || undefined} />
                        <AvatarFallback>
                          {request.sender_profile?.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-center">{request.sender_profile?.full_name}</CardTitle>
                    <CardDescription className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" />
                        {request.sender_profile?.birth_date && calculateAge(request.sender_profile.birth_date)} anni
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {request.sender_profile?.location_city}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {request.sender_profile?.bio && (
                      <p className="text-sm text-muted-foreground mb-4 text-center">
                        {request.sender_profile.bio}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => respondToRequest(request.id, 'accepted')}
                        disabled={respondingToRequest === request.id}
                        className="flex-1"
                        variant="default"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Accetta
                      </Button>
                      <Button
                        onClick={() => respondToRequest(request.id, 'rejected')}
                        disabled={respondingToRequest === request.id}
                        className="flex-1"
                        variant="outline"
                      >
                        Rifiuta
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
        <h2 className="text-3xl font-bold mb-6">Profili Vicini</h2>
        
        {profiles.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nessun profilo trovato nel raggio di 20 km
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile.profile_photo_url || undefined} />
                      <AvatarFallback>
                        {profile.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-center">{profile.full_name}</CardTitle>
                  <CardDescription className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      {calculateAge(profile.birth_date)} anni
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {profile.location_city} • {profile.distance?.toFixed(1)} km
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      {profile.bio}
                    </p>
                  )}
                  <Button
                    onClick={() => sendMatchRequest(profile.id)}
                    disabled={sendingRequest === profile.id}
                    className="w-full"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {sendingRequest === profile.id ? 'Invio...' : 'Invia Richiesta'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Browse;
