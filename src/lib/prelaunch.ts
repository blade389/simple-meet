// Pre-launch configuration
export const LAUNCH_AT = new Date('2026-05-01T00:00:00+02:00'); // Europe/Rome (CEST)

export const isPreLaunch = () => Date.now() < LAUNCH_AT.getTime();

// Routes allowed during pre-launch
const ALLOWED_ROUTES = [
  '/',
  '/auth',
  '/dashboard',
  '/profile',
  '/buy-tokens',
  '/premium-subscription',
  '/premium-rates',
  '/verify',
  '/privacy-policy',
  '/terms-of-service',
  '/cookie-policy',
  '/faq',
  '/features',
  '/pricing',
  '/about',
  '/blocked',
  '/prelaunch',
  '/leaderboard',
  '/uomini',
  '/donne',
  '/influencer',
  '/invite',
  '/r',
  '/admin',
  '/free-premium-request',
];

export const isRouteAllowed = (pathname: string) => {
  if (!isPreLaunch()) return true;
  // Check exact match or starts with for dynamic routes
  return ALLOWED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
};
