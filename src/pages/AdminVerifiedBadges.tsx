import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, BadgeCheck, ShieldOff } from 'lucide-react';

interface BadgeProfile {
  id: string;
  full_name: string;
  location_city: string | null;
  verified_badge_status: string;
  verified_badge_source: string | null;
  verified_badge_activated_at: string | null;
  verified_badge_expires_at: string | null;
  verified_badge_revoked_at: string | null;
  verified_badge_revoke_reason: string | null;
}

const AdminVerifiedBadges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<BadgeProfile[]>([]);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id ?? '')
        .eq('role', 'admin')
        .maybeSingle();

      if (!data) {
        toast({ title: 'Accesso negato', variant: 'destructive' });
        navigate('/dashboard');
        return;
      }
      await load();
      setLoading(false);
    };
    if (user) init();
  }, [user]);

  const load = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, location_city, verified_badge_status, verified_badge_source, verified_badge_activated_at, verified_badge_expires_at, verified_badge_revoked_at, verified_badge_revoke_reason')
      .eq('gender', 'female')
      .order('verified_badge_status', { ascending: true })
      .limit(500);

    if (error) {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
      return;
    }
    setProfiles((data || []) as BadgeProfile[]);
  };

  const setBadge = async (id: string, active: boolean) => {
    setProcessingId(id);
    const { error } = await supabase.rpc('admin_set_verified_badge', {
      _user_id: id,
      _active: active,
      _reason: active ? null : 'admin_revoked',
    });
    setProcessingId(null);

    if (error) {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: active ? 'Badge assegnato' : 'Badge revocato' });
    load();
  };

  const filtered = profiles.filter((p) =>
    p.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (p: BadgeProfile) => {
    if (p.verified_badge_status === 'active') {
      return <Badge className="bg-yellow-500 text-black"><BadgeCheck className="h-3 w-3 mr-1" />Attivo</Badge>;
    }
    if (p.verified_badge_status === 'revoked') {
      return <Badge variant="destructive">Revocato</Badge>;
    }
    return <Badge variant="secondary">Nessuno</Badge>;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin">
            <Button variant="ghost" size="icon" aria-label="Torna al pannello admin">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Badge Verificato</h1>
        </div>

        <Input
          placeholder="Cerca per nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6"
        />

        <div className="space-y-4">
          {filtered.length === 0 && (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Nessun profilo trovato</CardContent></Card>
          )}
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  {p.full_name}
                  {statusBadge(p)}
                  {p.verified_badge_source && (
                    <Badge variant="outline">
                      {p.verified_badge_source === 'subscription' ? 'Abbonamento' : 'Manuale'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-1">
                  {p.location_city && <p>Città: {p.location_city}</p>}
                  {p.verified_badge_activated_at && (
                    <p>Attivato: {new Date(p.verified_badge_activated_at).toLocaleString('it-IT')}</p>
                  )}
                  {p.verified_badge_expires_at && (
                    <p>Scadenza: {new Date(p.verified_badge_expires_at).toLocaleString('it-IT')}</p>
                  )}
                  {p.verified_badge_revoked_at && (
                    <p>
                      Revocato: {new Date(p.verified_badge_revoked_at).toLocaleString('it-IT')}
                      {p.verified_badge_revoke_reason ? ` (${p.verified_badge_revoke_reason})` : ''}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={processingId === p.id || p.verified_badge_status === 'active'}
                    onClick={() => setBadge(p.id, true)}
                  >
                    <BadgeCheck className="h-4 w-4 mr-1" />
                    Assegna badge
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={processingId === p.id || p.verified_badge_status !== 'active'}
                    onClick={() => setBadge(p.id, false)}
                  >
                    <ShieldOff className="h-4 w-4 mr-1" />
                    Revoca
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminVerifiedBadges;
