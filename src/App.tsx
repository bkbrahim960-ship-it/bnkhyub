import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import Home from "./pages/Home";
import Movie from "./pages/Movie";
import Series from "./pages/Series";
import Channels from "./pages/Channels";
import Search from "./pages/Search";
import Catalog from "./pages/Catalog";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import MyList from "./pages/MyList";
import Landing from "./pages/Landing";
import Remote from "./pages/Remote";
import Person from "./pages/Person";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound.tsx";

import { AmbientProvider, AmbientBackground } from "@/context/AmbientContext";
import { useTVNavigation } from "@/hooks/useTVNavigation";
import { HelmetProvider } from "react-helmet-async";
import { SEO } from "@/components/SEO";
import { useRemoteControl } from "@/hooks/useRemoteControl";
import { VirtualCursor } from "@/components/ui/VirtualCursor";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Analytics } from "@vercel/analytics/react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes (data remains fresh)
      gcTime: 1000 * 60 * 30, // 30 minutes (cache persists)
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});

import { useNavigate } from "react-router-dom";

const TVNavigationActivator = () => {
  const [tvSessionId] = useState(() => Math.random().toString(36).substring(7));
  const navigate = useNavigate();
  useTVNavigation();
  const { lastCommand } = useRemoteControl(tvSessionId);
  
  useEffect(() => {
    if (lastCommand?.startsWith("NAV:")) {
      const path = lastCommand.replace("NAV:", "");
      navigate(path);
    } else if (lastCommand?.startsWith("KEYBOARD:")) {
      const text = lastCommand.replace("KEYBOARD:", "");
      navigate(`/search?q=${encodeURIComponent(text)}`, { replace: true });
    }
  }, [lastCommand, navigate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).tvSessionId = tvSessionId;
    }
  }, [tvSessionId]);

  return null;
};

const SiteVisitTracker = () => {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        let visitorId = localStorage.getItem("bnkhub_visitor_id");
        if (!visitorId) {
          visitorId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
          localStorage.setItem("bnkhub_visitor_id", visitorId);
        }
        
        // Try to insert the visitor ID. Will fail silently if already exists (due to RLS or unique constraint), which is fine.
        await supabase.from('site_visits').insert([{ session_id: visitorId }]);
      } catch (err) {
        // Ignore tracking errors
      }
    };
    trackVisit();
  }, []);

  return null;
};

import { Onboarding } from "@/components/ui/Onboarding";
import { SplashScreen } from "@/components/SplashScreen";

const AppContent = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AmbientProvider>
        <div className="relative min-h-screen bg-background">
          <AmbientBackground />
          <div className="relative z-10">
            <SettingsProvider>
              <LanguageProvider>
                <AuthProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <SEO />
                    <Onboarding />
                    <BrowserRouter>
                      <SiteVisitTracker />
                      <TVNavigationActivator />
                      <VirtualCursor />
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/movies" element={<Catalog mode="movies" />} />
                        <Route path="/series" element={<Catalog mode="series" />} />
                        <Route path="/movie/:id" element={<Movie />} />
                        <Route path="/series/:id" element={<Series />} />
                        <Route path="/channels" element={<Channels />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/my-list" element={<MyList />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/welcome" element={<Landing />} />
                        <Route path="/remote" element={<Remote />} />
                        <Route path="/person/:id" element={<Person />} />
                        <Route path="/coming-soon" element={<ComingSoon />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                    <Analytics />
                  </TooltipProvider>
                </AuthProvider>
              </LanguageProvider>
            </SettingsProvider>
          </div>
        </div>
      </AmbientProvider>
    </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash only once per session
    if (sessionStorage.getItem("bnkhub_splash_shown")) return false;
    return true;
  });

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem("bnkhub_splash_shown", "1");
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <AppContent />
    </>
  );
};

export default App;
