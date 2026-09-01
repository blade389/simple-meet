import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfilePhoto {
  id: string;
  photo_url: string;
}

interface Profile {
  id: string;
  full_name: string;
  bio: string | null;
  birth_date: string;
  gender: string;
  profile_photo_url: string | null;
  location_lat: number | null;
  location_lon: number | null;
  is_premium?: boolean;
  distance?: number;
  positive_reviews_count?: number;
  negative_reviews_count?: number;
}

interface SwipeViewProps {
  profiles: Profile[];
  sentRequests: string[];
  onSendRequest: (profileId: string) => Promise<void>;
  onSkip: (profileId: string) => void;
}

const SwipeView = ({ profiles, sentRequests, onSendRequest, onSkip }: SwipeViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentProfile = profiles[currentIndex];

  useEffect(() => {
    if (currentProfile) {
      loadPhotos(currentProfile.id);
      setCurrentPhotoIndex(0);
    }
  }, [currentProfile?.id]);

  const loadPhotos = async (profileId: string) => {
    setLoadingPhotos(true);
    try {
      const { data } = await supabase
        .from('profile_photo_verifications')
        .select('id, photo_url')
        .eq('user_id', profileId);
      
      if (data && data.length > 0) {
        setPhotos(data);
      } else if (currentProfile?.profile_photo_url) {
        setPhotos([{ id: 'main', photo_url: currentProfile.profile_photo_url }]);
      } else {
        setPhotos([]);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
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

  const handleNextPhoto = () => {
    if (photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const handleSwipeRight = async () => {
    if (!currentProfile || sentRequests.includes(currentProfile.id) || swiping) return;
    
    setSwiping(true);
    setSwipeDirection('right');
    
    await onSendRequest(currentProfile.id);
    
    setTimeout(() => {
      goToNextProfile();
      setSwiping(false);
      setSwipeDirection(null);
      setOffsetX(0);
    }, 300);
  };

  const handleSwipeLeft = () => {
    if (!currentProfile || swiping) return;
    
    setSwiping(true);
    setSwipeDirection('left');
    onSkip(currentProfile.id);
    
    setTimeout(() => {
      goToNextProfile();
      setSwiping(false);
      setSwipeDirection(null);
      setOffsetX(0);
    }, 300);
  };

  const goToNextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (swiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setOffsetX(diff);
  };

  const handleTouchEnd = () => {
    if (swiping) return;
    
    const threshold = 100;
    
    if (offsetX > threshold) {
      handleSwipeRight();
    } else if (offsetX < -threshold) {
      handleSwipeLeft();
    } else {
      setOffsetX(0);
    }
  };

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startX === 0 || swiping) return;
    const diff = e.clientX - startX;
    setOffsetX(diff);
  };

  const handleMouseUp = () => {
    if (startX === 0) return;
    
    const threshold = 100;
    
    if (offsetX > threshold) {
      handleSwipeRight();
    } else if (offsetX < -threshold) {
      handleSwipeLeft();
    } else {
      setOffsetX(0);
    }
    setStartX(0);
  };

  const handleMouseLeave = () => {
    if (startX !== 0) {
      setOffsetX(0);
      setStartX(0);
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-muted-foreground text-lg">
          Nessun profilo trovato nel raggio di 20 km
        </p>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-muted-foreground text-lg">
          Hai visto tutti i profili disponibili!
        </p>
      </div>
    );
  }

  const getCardStyle = () => {
    let transform = `translateX(${offsetX}px)`;
    let opacity = 1;
    
    if (swipeDirection === 'left') {
      transform = 'translateX(-150%) rotate(-30deg)';
      opacity = 0;
    } else if (swipeDirection === 'right') {
      transform = 'translateX(150%) rotate(30deg)';
      opacity = 0;
    } else if (offsetX !== 0) {
      const rotation = offsetX / 20;
      transform = `translateX(${offsetX}px) rotate(${rotation}deg)`;
    }
    
    return {
      transform,
      opacity,
      transition: swipeDirection ? 'all 0.3s ease-out' : 'none',
    };
  };

  const currentPhotoUrl = photos[currentPhotoIndex]?.photo_url || currentProfile?.profile_photo_url;

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto px-4">
      {/* Card */}
      <div
        ref={cardRef}
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl bg-card cursor-grab active:cursor-grabbing select-none"
        style={getCardStyle()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleNextPhoto}
      >
        {/* Photo indicators */}
        {photos.length > 1 && (
          <div className="absolute top-2 left-0 right-0 flex justify-center gap-1 z-10 px-4">
            {photos.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* Image */}
        {currentPhotoUrl ? (
          <img
            src={currentPhotoUrl}
            alt={currentProfile.full_name}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-6xl font-bold text-muted-foreground">
              {currentProfile.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

        {/* Swipe indicators */}
        <div
          className={`absolute top-1/2 left-6 -translate-y-1/2 px-4 py-2 rounded-lg border-4 border-red-500 text-red-500 font-bold text-2xl rotate-[-20deg] transition-opacity ${
            offsetX < -50 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          SKIP
        </div>
        <div
          className={`absolute top-1/2 right-6 -translate-y-1/2 px-4 py-2 rounded-lg border-4 border-green-500 text-green-500 font-bold text-2xl rotate-[20deg] transition-opacity ${
            offsetX > 50 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          LIKE
        </div>

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white pointer-events-none">
          <h3 className="text-2xl font-bold">
            {currentProfile.full_name}, {calculateAge(currentProfile.birth_date)}
          </h3>
          <p className="text-sm text-white/80 flex items-center gap-1">
            {currentProfile.distance !== undefined && `${currentProfile.distance.toFixed(1)} km`}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-8 mt-6">
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleSwipeLeft}
          disabled={swiping}
        >
          <X className="w-8 h-8" />
        </Button>
        <Button
          size="lg"
          className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white"
          onClick={handleSwipeRight}
          disabled={swiping || sentRequests.includes(currentProfile.id)}
        >
          <Heart className="w-8 h-8" />
        </Button>
      </div>

      {/* Counter */}
      <p className="mt-4 text-sm text-muted-foreground">
        {currentIndex + 1} / {profiles.length}
      </p>
    </div>
  );
};

export default SwipeView;
