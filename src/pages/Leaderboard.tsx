import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Trophy, Medal, Crown, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CONTEST_DEADLINE } from '@/lib/prelaunch';
import SEOHead from '@/components/SEOHead';
import { useTranslation } from 'react-i18next';

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  points: number;
  rank: number;
}

const PRIZES: Record<number, string> = {
  1: '1.000€',
  2: '300€',
  3: '200€',
  4: '100€',
};

const getPrize = (rank: number): string => {
  if (PRIZES[rank]) return PRIZES[rank];
  if (rank >= 5 && rank <= 8) return '50€';
  if (rank >= 9 && rank <= 12) return '25€';
  if (rank >= 13 && rank <= 20) return '10 gettoni / 2 mesi premium';
  if (rank >= 21 && rank <= 50) return '5 gettoni / 1 mese premium';
  return '';
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
};

const Leaderboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myPosition, setMyPosition] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, CONTEST_DEADLINE.getTime() - Date.now());
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      });
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const loadLeaderboard = async () => {
    try {
      // Get referral counts grouped by referrer
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('referrer_user_id');

      if (error) throw error;

      // Count points per user
      const pointsMap: Record<string, number> = {};
      referrals?.forEach(r => {
        pointsMap[r.referrer_user_id] = (pointsMap[r.referrer_user_id] || 0) + 1;
      });

      // Get user names
      const userIds = Object.keys(pointsMap);
      if (userIds.length === 0) {
        setEntries([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .in('id', userIds);

      // Build entries sorted by points desc, created_at asc
      const list: (LeaderboardEntry & { created_at: string })[] = (profiles || []).map(p => ({
        user_id: p.id,
        full_name: p.full_name,
        points: pointsMap[p.id] || 0,
        rank: 0,
        created_at: p.created_at || '',
      }));

      list.sort((a, b) => b.points - a.points || a.created_at.localeCompare(b.created_at));
      list.forEach((e, i) => { e.rank = i + 1; });

      const top50 = list.slice(0, 50);
      setEntries(top50);

      // Find logged user position
      if (user) {
        const myEntry = list.find(e => e.user_id === user.id);
        if (myEntry) {
          setMyPosition(myEntry);
        } else {
          // User has 0 points
          setMyPosition({ user_id: user.id, full_name: '', points: 0, rank: list.length + 1 });
        }
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Classifica Referral | FlashMatch" description="Classifica dei migliori referrer con premi fino a 1000€!" canonicalPath="/leaderboard" />
      <div className="min-h-screen bg-gradient-hero">
        <header className="border-b bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">FlashMatch</span>
            </Link>
            <div className="flex gap-2">
              {user && <Button variant="outline" asChild><Link to="/invite">{t('prelaunch.inviteFriends', 'Invita amici')}</Link></Button>}
              <Button variant="ghost" asChild><Link to="/">← {t('common.backToHome')}</Link></Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-primary" />
              {t('leaderboard.title', 'Classifica Referral')}
            </h1>
            <p className="text-muted-foreground mb-2">
              {t('leaderboard.subtitle', 'Invita amici per scalare la classifica e vincere premi!')}
            </p>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {t('leaderboard.endsIn', 'Termina tra')}: {countdown.days}g {countdown.hours}h {countdown.minutes}m
            </div>
          </div>

          {/* My position */}
          {user && myPosition && (
            <Card className="p-4 mb-6 bg-gradient-primary text-primary-foreground">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">#{myPosition.rank}</span>
                  <span>{t('leaderboard.yourPosition', 'La tua posizione')}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{myPosition.points}</div>
                  <div className="text-sm opacity-80">{t('leaderboard.points', 'punti')}</div>
                </div>
              </div>
              {myPosition.rank <= 50 && (
                <div className="mt-2 text-sm opacity-90">
                  🏆 {t('leaderboard.prize', 'Premio')}: {getPrize(myPosition.rank)}
                </div>
              )}
            </Card>
          )}

          {/* Leaderboard */}
          <Card className="overflow-hidden shadow-card">
            <div className="p-4 border-b bg-muted/30">
              <div className="grid grid-cols-[40px_1fr_80px_auto] gap-2 text-xs font-semibold text-muted-foreground uppercase">
                <span>#</span>
                <span>{t('leaderboard.user', 'Utente')}</span>
                <span className="text-right">{t('leaderboard.points', 'Punti')}</span>
                <span className="text-right min-w-[100px]">{t('leaderboard.prize', 'Premio')}</span>
              </div>
            </div>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : entries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {t('leaderboard.noEntries', 'Nessun partecipante ancora. Sii il primo!')}
              </div>
            ) : (
              <div className="divide-y">
                {entries.map(entry => (
                  <div
                    key={entry.user_id}
                    className={`grid grid-cols-[40px_1fr_80px_auto] gap-2 p-3 items-center text-sm ${
                      user?.id === entry.user_id ? 'bg-primary/10 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center">{getRankIcon(entry.rank)}</div>
                    <div className="truncate">{entry.full_name}</div>
                    <div className="text-right font-bold">{entry.points}</div>
                    <div className="text-right text-xs text-muted-foreground min-w-[100px]">{getPrize(entry.rank)}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Prize table */}
          <Card className="mt-8 p-6">
            <h2 className="text-xl font-bold mb-4">{t('leaderboard.prizeTable', 'Tabella Premi')}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 rounded bg-primary/10 font-semibold">
                <span>🥇 1°</span><span>1.000€</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span>🥈 2°</span><span>300€</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span>🥉 3°</span><span>200€</span>
              </div>
              <div className="flex justify-between p-2 rounded"><span>4°</span><span>100€</span></div>
              <div className="flex justify-between p-2 rounded"><span>5°-8°</span><span>50€</span></div>
              <div className="flex justify-between p-2 rounded"><span>9°-12°</span><span>25€</span></div>
              <div className="flex justify-between p-2 rounded"><span>13°-20°</span><span>10 gettoni / 2 mesi premium ♀</span></div>
              <div className="flex justify-between p-2 rounded"><span>21°-50°</span><span>5 gettoni / 1 mese premium ♀</span></div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              {t('prelaunch.prizeNote', 'Premium donne applicabile solo agli account femminili. Per uomini: equivalente in gettoni.')}
            </p>
          </Card>
        </main>
      </div>
    </>
  );
};

export default Leaderboard;
