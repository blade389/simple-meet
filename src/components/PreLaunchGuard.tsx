import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isPreLaunch, isRouteAllowed } from '@/lib/prelaunch';

const PreLaunchGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isPreLaunch() && !isRouteAllowed(location.pathname)) {
      navigate('/prelaunch', { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
};

export default PreLaunchGuard;
