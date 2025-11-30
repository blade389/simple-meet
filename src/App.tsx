import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import { PushNotificationManager } from "./components/PushNotificationManager";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import Profile from "./pages/Profile";
import Appointments from "./pages/Appointments";
import Verify from "./pages/Verify";
import Admin from "./pages/Admin";
import BuyTokens from "./pages/BuyTokens";
import PremiumProfiles from './pages/PremiumProfiles';
import PremiumRequests from './pages/PremiumRequests';
import PremiumSubscription from './pages/PremiumSubscription';
import PremiumRatesManagement from './pages/PremiumRatesManagement';
import ConversationReviews from './pages/ConversationReviews';
import AdminUserReviews from './pages/AdminUserReviews';
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import FAQ from "./pages/FAQ";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <PushNotificationManager />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/buy-tokens" element={<BuyTokens />} />
            <Route path="/premium-profiles" element={<PremiumProfiles />} />
            <Route path="/premium-requests" element={<PremiumRequests />} />
            <Route path="/premium-subscription" element={<PremiumSubscription />} />
            <Route path="/premium-rates" element={<PremiumRatesManagement />} />
            <Route path="/admin/verification-requests" element={<Admin />} />
            <Route path="/admin/photo-verification" element={<Admin />} />
            <Route path="/admin/premium-rates" element={<PremiumRatesManagement />} />
            <Route path="/admin/conversation-reviews" element={<ConversationReviews />} />
            <Route path="/admin/user-reviews" element={<AdminUserReviews />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
