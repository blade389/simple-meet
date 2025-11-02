import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Crown } from 'lucide-react';
import ProfileDetailsDialog from '@/components/ProfileDetailsDialog';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string;
  birth_date: string;
  location_city: string;
  bio: string | null;
  profile_photo_url: string | null;
  is_premium: boolean;
}

interface PremiumRate {
  id: string;
  duration_hours: number;
  price_euros: number;
}

const PremiumProfiles = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadProfiles();
  }, [user, navigate]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('gender', 'female')
        .eq('is_premium', true)
        .eq('is_blocked', false);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading premium profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSendRequest = async (selectedRateId?: string, message?: string) => {
    if (!user || !selectedProfile) return;

    try {
      const { error: requestError } = await supabase
        .from('match_requests')
        .insert({
          sender_id: user.id,
          receiver_id: selectedProfile.id,
          is_premium: true,
          selected_rate_id: selectedRateId,
          message: message,
          status: 'pending',
        });

      if (requestError) throw requestError;

      // Send email notification
      await supabase.functions.invoke('send-match-request-email', {
        body: {
          receiverId: selectedProfile.id,
          senderName: user.email,
        },
      });

      toast({
        title: 'Richiesta inviata!',
        description: 'La tua richiesta premium è stata inviata con successo.',
      });

      loadProfiles();
    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'invio della richiesta.',
        variant: 'destructive',
      });
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              Profili Premium
            </h1>
            <p className="text-muted-foreground">Scopri i profili premium disponibili</p>
          </div>
        </div>

        {profiles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Nessun profilo premium disponibile al momento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <Card 
                key={profile.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-2 border-yellow-500/20"
                onClick={() => {
                  setSelectedProfile(profile);
                  setDialogOpen(true);
                }}
              >
                <div className="aspect-square relative">
                  {profile.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <span className="text-4xl text-muted-foreground">👤</span>
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{profile.full_name}, {calculateAge(profile.birth_date)}</span>
                  </CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.location_city}
                  </div>
                </CardHeader>
                <CardContent>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedProfile && (
        <ProfileDetailsDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setSelectedProfile(null);
          }}
          profile={{
            id: selectedProfile.id,
            full_name: selectedProfile.full_name,
            bio: selectedProfile.bio,
            birth_date: selectedProfile.birth_date,
            location_city: selectedProfile.location_city,
            profile_photo_url: selectedProfile.profile_photo_url,
            is_premium: selectedProfile.is_premium
          }}
          onSendRequest={handleSendRequest}
          showSendRequest={true}
        />
      )}
    </div>
  );
};

export default PremiumProfiles;
