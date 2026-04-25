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
import NotFound from "./pages/NotFound.tsx";

import { AmbientProvider, AmbientBackground } from "@/context/AmbientContext";
import { useTVNavigation } from "@/hooks/useTVNavigation";

const queryClient = new QueryClient();

const TVNavigationActivator = () => {
  const [tvSessionId] = useState(() => Math.random().toString(36).substring(7));
  useTVNavigation();
  useRemoteControl(tvSessionId);
  
  useEffect(() => {
    console.log("TV Session ID:", tvSessionId);
    (window as any).tvSessionId = tvSessionId;
  }, [tvSessionId]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AmbientProvider>
        <AmbientBackground />
        <div className="content-overlay">
          <SettingsProvider>
            <LanguageProvider>
              <AuthProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <TVNavigationActivator />
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
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </AuthProvider>
            </LanguageProvider>
          </SettingsProvider>
        </div>
      </AmbientProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
