import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPremium: boolean;
  isSubscriber: boolean;
  hasVerifiedBadge: boolean;
  badgeStatus: string;
  subscriptionEnd: string | null;
  isBlocked: boolean;
  checkPremiumStatus: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [badgeStatus, setBadgeStatus] = useState<string>('none');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkBlockedStatus = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_blocked')
        .eq('id', userId)
        .single();

      if (!error && profile) {
        setIsBlocked(profile.is_blocked || false);
        if (profile.is_blocked) {
          navigate('/blocked', { replace: true });
        }
      }
    } catch (error) {
      console.error('Error checking blocked status:', error);
    }
  };

  const checkPremiumStatus = async () => {
    if (!user) return;

    try {
      // First check directly from database for immediate response
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_premium, subscription_status, subscription_end, gender, verified_badge_status')
        .eq('id', user.id)
        .single();

      if (!profileError && profile) {
        const isActive = !!profile.is_premium && profile.subscription_status === 'active';
        // Female accounts get all premium features for free.
        // A paid subscription only adds the verified badge, featured placement
        // and worldwide visibility.
        setIsSubscriber(isActive);
        setIsPremium(isActive || profile.gender === 'female');
        setBadgeStatus((profile as any).verified_badge_status || 'none');
        setSubscriptionEnd(profile.subscription_end);
        return;
      }

      // Fallback to edge function
      const { data, error } = await supabase.functions.invoke('check-premium-subscription');
      if (error) throw error;

      setIsSubscriber(data.isPremium || false);
      setIsPremium(data.isPremium || false);
      setSubscriptionEnd(data.subscriptionEnd || null);
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  useEffect(() => {
    // Setup auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Avoid unexpected redirects: only send users to the dashboard right after login.
      if (event === 'SIGNED_IN' && (location.pathname === '/' || location.pathname === '/auth')) {
        // Check blocked status before redirecting
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_blocked')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.is_blocked) {
            setIsBlocked(true);
            navigate('/blocked', { replace: true });
            return;
          }
        }
        
        navigate('/dashboard', { replace: true });
        // Check premium status after sign in
        if (session) {
          setTimeout(() => {
            checkPremiumStatus();
          }, 0);
        }
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Check blocked and premium status if user exists
      if (session?.user) {
        await checkBlockedStatus(session.user.id);
        setTimeout(() => {
          checkPremiumStatus();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // Re-check blocked and premium status when user changes
  useEffect(() => {
    if (user) {
      checkBlockedStatus(user.id);
      checkPremiumStatus();
    }
  }, [user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isPremium, isSubscriber, hasVerifiedBadge: badgeStatus === 'active', badgeStatus, subscriptionEnd, isBlocked, checkPremiumStatus, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
