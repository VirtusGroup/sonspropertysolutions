import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { MobileShell } from "@/components/layout/MobileShell";
import { PageTransition } from "@/components/PageTransition";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

// Disable browser's automatic scroll restoration globally
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import BookingPage from "./pages/BookingPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AccountPage from "./pages/AccountPage";
import SupportPage from "./pages/SupportPage";
import ContactPage from "./pages/ContactPage";
import InstallPage from "./pages/InstallPage";
import EstimatorPage from "./pages/EstimatorPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VideoLandingPage from "./pages/VideoLandingPage";
import NotFound from "./pages/NotFound";
import { validateCategoryMappings } from "@/config/acculynx";
import { demoServices } from "@/lib/demoData";

const queryClient = new QueryClient();

// Development: Validate AccuLynx category mappings
if (import.meta.env.DEV) {
  validateCategoryMappings(demoServices);
}

const authRoutes = ['/login', '/register', '/forgot-password'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = authRoutes.includes(location.pathname);

  useEffect(() => {
    if (loading) return;
    
    // If not logged in and not on auth page, redirect to login
    if (!user && !isAuthPage) {
      navigate('/login', { replace: true });
    }
    // If logged in and on auth page, redirect to home
    if (user && isAuthPage) {
      navigate('/', { replace: true });
    }
  }, [user, loading, isAuthPage, navigate]);

  // Show nothing while loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/services" element={<PageTransition><ServicesPage /></PageTransition>} />
        <Route path="/services/:slug" element={<PageTransition><ServiceDetailPage /></PageTransition>} />
        <Route path="/book" element={<PageTransition><BookingPage /></PageTransition>} />
        <Route path="/orders" element={<PageTransition><OrdersPage /></PageTransition>} />
        <Route path="/orders/:id" element={<PageTransition><OrderDetailPage /></PageTransition>} />
        <Route path="/account" element={<PageTransition><AccountPage /></PageTransition>} />
        <Route path="/support" element={<PageTransition><SupportPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="/install" element={<PageTransition><InstallPage /></PageTransition>} />
        <Route path="/estimator" element={<PageTransition><EstimatorPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
        <Route path="/video" element={<VideoLandingPage />} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
<BrowserRouter>
          <MobileShell>
            <AuthGuard>
              <AnimatedRoutes />
            </AuthGuard>
          </MobileShell>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
