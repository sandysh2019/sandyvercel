import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import { lazy, Suspense, useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import AuroraBackground from '@/components/ui/aurora-background';
import { AnimatePresence } from 'framer-motion';
import { settingsAPI, getAssetUrl } from '@/lib/api';
import type { SiteSettings } from '@/types';
import PremiumLoader from '@/components/PremiumLoader';

const Hero = lazy(() => import('@/sections/Hero'));
const About = lazy(() => import('@/sections/About'));
const Portfolio = lazy(() => import('@/sections/Portfolio'));
const Services = lazy(() => import('@/sections/Services'));
const Contact = lazy(() => import('@/sections/Contact'));
const Footer = lazy(() => import('@/sections/Footer'));
const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const AdminLayout = lazy(() => import('@/pages/admin/Layout'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const PortfolioAdmin = lazy(() => import('@/pages/admin/Portfolio'));
const PortfolioForm = lazy(() => import('@/pages/admin/PortfolioForm'));
const Messages = lazy(() => import('@/pages/admin/Messages'));
const Settings = lazy(() => import('@/pages/admin/Settings'));



// SEO Component
const SEO = () => {
  useEffect(() => {
    const applyDynamicSEO = async () => {
      try {
        const settings: SiteSettings = await settingsAPI.get();
        
        // Update document title
        if (settings.siteTitle) {
          document.title = settings.siteTitle;
        }
        
        // Update document description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        if (settings.siteDescription) {
          metaDescription.setAttribute('content', settings.siteDescription);
        }
        
        // Update favicon / title icon
        if (settings.titleIcon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = getAssetUrl(settings.titleIcon);
        }
      } catch (err) {
        console.error('Failed to load SEO settings:', err);
      }
    };
    
    applyDynamicSEO();
  }, []);
  
  return null;
};

// Main Website Layout
const MainLayout = () => {
  const [isAppLoaded, setIsAppLoaded] = useState(false);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isAppLoaded && <PremiumLoader key="premium-loader" onComplete={() => setIsAppLoaded(true)} />}
      </AnimatePresence>

      <SEO />
      <Navigation />
      <AuroraBackground>
        <Suspense fallback={<RouteLoading />}>
          <main className="relative z-10 w-full h-full overflow-y-auto">
            <Hero />
            <About />
            <Portfolio />
            <Services />
            <Contact />
          </main>
          <Footer />
        </Suspense>
      </AuroraBackground>
    </>
  );
};

const RouteLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <RouteLoading />;
  if (!isAuthenticated) return <Navigate to="/admin" replace />;

  return <>{children}</>;
};

// Public Admin Route (redirects if already logged in)
const PublicAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <RouteLoading />;
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  return <>{children}</>;
};

// App Routes
const AppRoutes = () => (
  <Routes>
    {/* Main Website */}
    <Route path="/" element={<MainLayout />} />

    {/* Admin Routes */}
    <Route
      path="/admin"
      element={
        <PublicAdminRoute>
          <Suspense fallback={<RouteLoading />}>
            <AdminLogin />
          </Suspense>
        </PublicAdminRoute>
      }
    />
    <Route
      path="/admin/*"
      element={
        <ProtectedRoute>
          <Suspense fallback={<RouteLoading />}>
            <AdminLayout />
          </Suspense>
        </ProtectedRoute>
      }
    >
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="portfolio" element={<PortfolioAdmin />} />
      <Route path="portfolio/new" element={<PortfolioForm />} />
      <Route path="portfolio/edit/:id" element={<PortfolioForm />} />
      <Route path="messages" element={<Messages />} />
      <Route path="settings" element={<Settings />} />
    </Route>

    {/* Catch all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

// Main App
function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="bottom-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
