import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Crown, ThumbsUp, ThumbsDown, Heart, Trash2 } from 'lucide-react';
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
  gender: string;
  positive_reviews_count?: number;
  negative_reviews_count?: number;
}

interface Favorite {
  id: string;
  favorite_user_id: string;
  created_at: string;
  profile: Profile;
}

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadFavorites();
  }, [user, navigate]);

  const loadFavorites = async () => {
    try {
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('id, favorite_user_id, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (favoritesError) throw favoritesError;

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Get profile details for each favorite
      const profileIds = favoritesData.map(f => f.favorite_user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds);

      if (profilesError) throw profilesError;

      const favoritesWithProfiles = favoritesData.map(fav => ({
        ...fav,
        profile: profilesData?.find(p => p.id === fav.favorite_user_id)
      })).filter(f => f.profile) as Favorite[];

      setFavorites(favoritesWithProfiles);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i preferiti',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovingId(favoriteId);
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({
        title: 'Rimosso dai preferiti',
        description: 'Il profilo è stato rimosso dai tuoi preferiti',
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile rimuovere il preferito',
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
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
              <Heart className="h-8 w-8 text-primary fill-primary" />
              I Miei Preferiti
            </h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'profilo salvato' : 'profili salvati'}
            </p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-4">Non hai ancora aggiunto preferiti</p>
              <Button asChild>
                <Link to="/browse">Scopri Profili</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((favorite) => (
              <Card
                key={favorite.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
                onClick={() => {
                  setSelectedProfile(favorite.profile);
                  setDialogOpen(true);
                }}
              >
                <div className="aspect-square relative">
                  {favorite.profile.profile_photo_url ? (
                    <img
                      src={favorite.profile.profile_photo_url}
                      alt={favorite.profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <span className="text-4xl text-muted-foreground">👤</span>
                    </div>
                  )}
                  {favorite.profile.is_premium && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 left-2 h-8 w-8"
                    onClick={(e) => removeFavorite(favorite.id, e)}
                    disabled={removingId === favorite.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{favorite.profile.full_name}, {calculateAge(favorite.profile.birth_date)}</span>
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 mb-1">
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{favorite.profile.positive_reviews_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-sm font-medium">{favorite.profile.negative_reviews_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {favorite.profile.location_city}
                  </div>
                </CardHeader>
                <CardContent>
                  {favorite.profile.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{favorite.profile.bio}</p>
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
            is_premium: selectedProfile.is_premium,
            positive_reviews_count: selectedProfile.positive_reviews_count,
            negative_reviews_count: selectedProfile.negative_reviews_count
          }}
        />
      )}
    </div>
  );
};

export default Favorites;