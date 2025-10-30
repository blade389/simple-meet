import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Calendar, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfilePhoto {
  id: string;
  photo_url: string;
  is_primary: boolean;
}

interface ProfileDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    id: string;
    full_name: string;
    bio: string | null;
    birth_date: string;
    location_city: string;
    profile_photo_url: string | null;
    distance?: number;
  };
}

const ProfileDetailsDialog = ({ open, onOpenChange, profile }: ProfileDetailsDialogProps) => {
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && profile.id) {
      loadPhotos();
    }
  }, [open, profile.id]);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_photo_verifications')
        .select('id, photo_url, is_primary')
        .eq('user_id', profile.id)
        .eq('status', 'verified')
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{profile.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Carousel */}
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : photos.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {photos.map((photo) => (
                  <CarouselItem key={photo.id}>
                    <div className="aspect-square relative rounded-lg overflow-hidden">
                      <img
                        src={photo.photo_url}
                        alt={`${profile.full_name} photo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {photos.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          ) : (
            <div className="flex justify-center">
              <Avatar className="w-48 h-48">
                <AvatarImage src={profile.profile_photo_url || undefined} />
                <AvatarFallback className="text-4xl">
                  {profile.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Profile Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{calculateAge(profile.birth_date)} anni</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>
                {profile.location_city}
                {profile.distance !== undefined && ` • ${profile.distance.toFixed(1)} km`}
              </span>
            </div>

            {profile.bio && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDetailsDialog;
