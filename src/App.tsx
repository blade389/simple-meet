import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
