// Pre-launch configuration
export const LAUNCH_AT = new Date('2026-07-10T00:00:00+02:00'); // Europe/Rome (CEST)
export const CONTEST_DEADLINE = new Date('2026-08-30T23:59:59+02:00'); // Contest end date

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

const BYPASS_EMAILS = [
  'panarisiandrea@gmail.com',
  'panarisiandrea.trade@gmail.com',
];

export const isRouteAllowed = (pathname: string, userEmail?: string | null) => {
  if (!isPreLaunch()) return true;
  if (userEmail && BYPASS_EMAILS.includes(userEmail)) return true;
  return ALLOWED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
};
