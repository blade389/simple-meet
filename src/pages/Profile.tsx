import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, ArrowLeft, Upload, CheckCircle, Clock, XCircle, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location_city: '',
    min_age_preference: '',
    max_age_preference: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

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
        location_city: data.location_city || '',
        min_age_preference: data.min_age_preference?.toString() || '',
        max_age_preference: data.max_age_preference?.toString() || ''
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile caricare il profilo",
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
          location_city: formData.location_city,
          min_age_preference: formData.min_age_preference ? parseInt(formData.min_age_preference) : null,
          max_age_preference: formData.max_age_preference ? parseInt(formData.max_age_preference) : null
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche sono state salvate con successo"
      });
      loadProfile();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      toast({
        title: "Foto caricata",
        description: "La tua foto profilo è stata aggiornata"
      });
      loadProfile();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getVerificationStatus = () => {
    if (!profile?.is_verified) return { icon: Clock, text: 'In attesa', color: 'text-yellow-600' };
    if (profile.is_verified === 'verified') return { icon: CheckCircle, text: 'Verificato', color: 'text-green-600' };
    if (profile.is_verified === 'rejected') return { icon: XCircle, text: 'Rifiutato', color: 'text-red-600' };
    return { icon: Clock, text: 'In attesa', color: 'text-yellow-600' };
  };

  const status = getVerificationStatus();
  const StatusIcon = status.icon;

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
        <h2 className="text-3xl font-bold mb-6">Il Mio Profilo</h2>
        
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Foto Profilo</CardTitle>
              <CardDescription>Carica la tua foto profilo</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile?.profile_photo_url} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  id="photo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={uploading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {uploading ? 'Caricamento...' : 'Cambia Foto'}
                </Button>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm font-medium mb-1">Stato Verifica</p>
                <div className={`flex items-center gap-2 ${status.color}`}>
                  <StatusIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">{status.text}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informazioni Profilo</CardTitle>
              <CardDescription>Aggiorna le tue informazioni personali</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Raccontaci qualcosa di te..."
                  />
                </div>

                <div>
                  <Label htmlFor="location_city">Città</Label>
                  <Input
                    id="location_city"
                    value={formData.location_city}
                    onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_age">Età Minima Preferita</Label>
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
                    <Label htmlFor="max_age">Età Massima Preferita</Label>
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

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Salvataggio...' : 'Salva Modifiche'}
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