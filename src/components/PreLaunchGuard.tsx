import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isPreLaunch, isRouteAllowed } from '@/lib/prelaunch';
import { useAuth } from '@/contexts/AuthContext';

const PreLaunchGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (isPreLaunch() && !isRouteAllowed(location.pathname, user?.email)) {
      navigate('/prelaunch', { replace: true });
    }
  }, [location.pathname, navigate, user?.email]);

  return null;
};

export default PreLaunchGuard;
