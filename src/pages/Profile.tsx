import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, ArrowLeft, Upload, CheckCircle, Clock, XCircle, Camera, Lock, Unlock, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PremiumExplainer from '@/components/PremiumExplainer';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [tokens, setTokens] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    min_age_preference: '',
    max_age_preference: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadPhotos();
      loadTokens();
    }
  }, [user]);

  const loadTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('amount')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setTokens(data.amount);
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const handleUnlockAgePreferences = async () => {
    if (tokens < 2) {
      toast({
        title: t('profile.notEnoughTokensTitle'),
        description: t('profile.need2Tokens'),
        variant: "destructive"
      });
      return;
    }

    setUnlocking(true);
    try {
      // Deduct 2 tokens
      const { error: tokenError } = await supabase
        .from('tokens')
        .update({ amount: tokens - 2, last_updated: new Date().toISOString() })
        .eq('user_id', user?.id);

      if (tokenError) throw tokenError;

      // Unlock age preferences
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ age_preferences_unlocked: true })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      toast({
        title: t('profile.preferencesUnlocked'),
        description: t('profile.preferencesUnlockedDesc')
      });

      setTokens(tokens - 2);
      loadProfile();
    } catch (error: any) {
      toast({
        title: t('common2.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUnlocking(false);
    }
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        bio: data.bio || '',
        min_age_preference: data.min_age_preference?.toString() || '',
        max_age_preference: data.max_age_preference?.toString() || ''
      });
    } catch (error: any) {
      toast({
        title: t('common2.error'),
        description: t('browse.loadProfileError'),
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          min_age_preference: formData.min_age_preference ? parseInt(formData.min_age_preference) : null,
          max_age_preference: formData.max_age_preference ? parseInt(formData.max_age_preference) : null
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: t('profile.profileUpdated'),
        description: t('profile.changesSaved')
      });
      loadProfile();
    } catch (error: any) {
      toast({
        title: t('common2.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_photo_verifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const isFemale = profile?.gender === 'female';

    // Check if account is verified (not required for female accounts)
    if (!isFemale && profile?.is_verified !== 'verified') {
      toast({
        title: t('profile.accountNotVerified'),
        description: t('profile.verifyAccountFirst'),
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user?.id}/profile-${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);

        // Check if this is the first photo
        const isFirstPhoto = photos.length === 0;

        // Create photo verification request
        return await supabase
          .from('profile_photo_verifications')
          .insert({
            user_id: user?.id,
            photo_url: publicUrl,
            status: isFemale ? 'verified' : 'pending',
            is_primary: isFirstPhoto
          });
      });

      await Promise.all(uploadPromises);

      toast({
        title: t('profile.photoUploaded'),
        description: `${files.length} ${files.length === 1 ? t('profile.photoSubmitted') : t('profile.photosSubmitted')}`
      });
      loadPhotos();
    } catch (error: any) {
      toast({
        title: t('common2.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const setPrimaryPhoto = async (photoId: string) => {
    try {
      // Set all photos as non-primary
      await supabase
        .from('profile_photo_verifications')
        .update({ is_primary: false })
        .eq('user_id', user?.id);

      // Set selected photo as primary
      const { error } = await supabase
        .from('profile_photo_verifications')
        .update({ is_primary: true })
        .eq('id', photoId);

      if (error) throw error;

      toast({
        title: t('profile.primaryPhotoUpdated'),
        description: t('profile.primaryPhotoChanged')
      });
      loadPhotos();
      loadProfile();
    } catch (error: any) {
      toast({
        title: t('common2.error'),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getVerificationStatus = () => {
    if (!profile?.is_verified) return { icon: Clock, text: t('profile.pending'), color: 'text-yellow-600' };
    if (profile.is_verified === 'verified') return { icon: CheckCircle, text: t('profile.verified'), color: 'text-green-600' };
    if (profile.is_verified === 'rejected') return { icon: XCircle, text: t('profile.rejected'), color: 'text-red-600' };
    return { icon: Clock, text: t('profile.pending'), color: 'text-yellow-600' };
  };

  const getPhotoVerificationStatus = () => {
    if (!profile?.photo_verification_status) return { icon: Clock, text: t('profile.pending'), color: 'text-yellow-600' };
    if (profile.photo_verification_status === 'verified') return { icon: CheckCircle, text: t('profile.verified'), color: 'text-green-600' };
    if (profile.photo_verification_status === 'rejected') return { icon: XCircle, text: t('profile.rejected'), color: 'text-red-600' };
    return { icon: Clock, text: t('profile.pending'), color: 'text-yellow-600' };
  };

  const status = getVerificationStatus();
  const photoStatus = getPhotoVerificationStatus();
  const StatusIcon = status.icon;
  const PhotoStatusIcon = photoStatus.icon;

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
          <LanguageSelector />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">{t('profile.title')}</h2>
        
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          <PremiumExplainer gender={profile?.gender} className="md:col-span-3" />
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>{t('profile.profilePhotos')}</CardTitle>
              <CardDescription>{t('profile.uploadPhotosDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <input
                  type="file"
                  id="photo-upload"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={uploading || (profile?.gender !== 'female' && profile?.is_verified !== 'verified')}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={uploading || (profile?.gender !== 'female' && profile?.is_verified !== 'verified')}
                  size="lg"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {uploading ? t('profile.uploading') : t('profile.uploadNewPhotos')}
                </Button>
                {profile?.gender !== 'female' && profile?.is_verified !== 'verified' && (
                  <p className="text-xs text-muted-foreground text-center">
                    {t('profile.completeVerificationFirst')}
                  </p>
                )}
              </div>

              {photos.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">{t('profile.yourPhotos')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.photo_url}
                          alt="Profile"
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center flex-col gap-2">
                          <div className={`flex items-center gap-2 ${
                            photo.status === 'verified' ? 'text-green-400' : 
                            photo.status === 'rejected' ? 'text-red-400' : 
                            'text-yellow-400'
                          }`}>
                            {photo.status === 'verified' ? <CheckCircle className="w-5 h-5" /> : 
                             photo.status === 'rejected' ? <XCircle className="w-5 h-5" /> : 
                             <Clock className="w-5 h-5" />}
                            <span className="text-sm font-medium">
                              {photo.status === 'verified' ? t('profile.verified') : 
                               photo.status === 'rejected' ? t('profile.rejected') : 
                               t('profile.pending')}
                            </span>
                          </div>
                          {photo.is_primary && (
                            <span className="text-white text-xs font-semibold bg-primary px-2 py-1 rounded">
                              {t('profile.primary')}
                            </span>
                          )}
                          {!photo.is_primary && photo.status === 'verified' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setPrimaryPhoto(photo.id)}
                            >
                              {t('profile.setAsPrimary')}
                            </Button>
                          )}
                        </div>
                        {photo.rejection_reason && (
                          <p className="text-xs text-red-500 mt-1">{photo.rejection_reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile?.gender !== 'female' && (
                <div className="text-center pt-4 border-t space-y-2">
                  <div>
                    <p className="text-sm font-medium mb-1">{t('profile.accountVerification')}</p>
                    <div className={`flex items-center gap-2 justify-center ${status.color}`}>
                      <StatusIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">{status.text}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t('profile.profileInfo')}</CardTitle>
              <CardDescription>{t('profile.updatePersonalInfo')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">{t('profile.fullName')}</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bio">{t('profile.bio')}</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder={t('profile.bioPlaceholder')}
                  />
                </div>


                {/* Age preferences section - locked for males until unlocked */}
                {profile?.gender === 'male' && !profile?.age_preferences_unlocked ? (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{t('profile.agePreferencesLocked')}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">18 - 100 {t('browse.years')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('profile.agePreferencesLockedDesc')}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUnlockAgePreferences}
                      disabled={unlocking || tokens < 2}
                      className="w-full"
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      {unlocking ? t('profile.unlocking') : `${t('profile.unlockFor')} 2 ${t('dashboard.tokens')} (${t('profile.youHave')} ${tokens})`}
                    </Button>
                    {tokens < 2 && (
                      <p className="text-xs text-destructive text-center">
                        {t('profile.notEnoughTokens')}{' '}
                        <Link to="/buy-tokens" className="underline">{t('profile.buyTokensLink')}</Link>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min_age" className="flex items-center gap-2">
                        {t('profile.minAge')}
                        {profile?.gender === 'male' && profile?.age_preferences_unlocked && (
                          <Unlock className="w-4 h-4 text-green-600" />
                        )}
                      </Label>
                      <Input
                        id="min_age"
                        type="number"
                        value={formData.min_age_preference}
                        onChange={(e) => setFormData({ ...formData, min_age_preference: e.target.value })}
                        min="18"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_age" className="flex items-center gap-2">
                        {t('profile.maxAge')}
                        {profile?.gender === 'male' && profile?.age_preferences_unlocked && (
                          <Unlock className="w-4 h-4 text-green-600" />
                        )}
                      </Label>
                      <Input
                        id="max_age"
                        type="number"
                        value={formData.max_age_preference}
                        onChange={(e) => setFormData({ ...formData, max_age_preference: e.target.value })}
                        min="18"
                        max="100"
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? t('profile.saving') : t('profile.saveChanges')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;