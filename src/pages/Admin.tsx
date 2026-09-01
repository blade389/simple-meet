import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Crown, Heart, ThumbsDown, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ reports: 0, conversations: 0, premium: 0 });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id ?? '')
        .eq('role', 'admin')
        .maybeSingle();

      if (!data) {
        toast({ title: 'Accesso negato', description: 'Non hai i permessi per accedere a questa pagina', variant: 'destructive' });
        navigate('/dashboard');
        return;
      }

      const [reports, conversations, premium] = await Promise.all([
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('reported', true).eq('admin_status', 'pending'),
        supabase.from('conversation_reviews').select('*', { count: 'exact', head: true }).is('action_taken', null),
        supabase.from('free_premium_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setCounts({ reports: reports.count ?? 0, conversations: conversations.count ?? 0, premium: premium.count ?? 0 });
      setLoading(false);
    };

    if (user) load();
  }, [user, navigate, toast]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;

  const items = [
    { to: '/admin/conversation-reviews', icon: AlertTriangle, title: 'Revisioni', description: 'Revisiona conversazioni scadute', count: counts.conversations },
    { to: '/admin/user-reviews', icon: ThumbsDown, title: 'Segnalazioni', description: 'Gestisci recensioni negative', count: counts.reports },
    { to: '/admin/blocked-users', icon: UserX, title: 'Utenti bloccati', description: 'Gestisci e sblocca utenti', count: 0 },
    { to: '/admin/verified-badges', icon: Crown, title: 'Badge Premium', description: 'Assegna o disattiva il vantaggio Premium', count: 0 },
    { to: '/admin/free-premium', icon: Crown, title: 'Richieste Premium', description: 'Gestisci le richieste gratuite per influencer', count: counts.premium },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" />Dashboard</Link>
          <div className="flex items-center gap-2"><Heart className="h-7 w-7 fill-primary text-primary" /><span className="text-xl font-bold">FlashMatch</span></div>
          <div className="w-24" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Pannello Admin</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map(({ to, icon: Icon, title, description, count }) => (
            <Link to={to} key={to}>
              <Card className="relative h-full p-6 transition-shadow hover:shadow-glow">
                <Icon className="mb-4 h-10 w-10 text-primary" />
                <h2 className="mb-2 text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
                {count > 0 && <Badge className="absolute right-4 top-4 bg-destructive text-destructive-foreground">{count}</Badge>}
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Admin;