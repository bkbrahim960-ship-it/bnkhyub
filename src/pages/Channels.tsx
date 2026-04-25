import { useEffect, useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Tv, Play, Loader2, Search, Info, X } from "lucide-react";
import { toast } from "sonner";
import Hls from "hls.js";

interface Channel {
  id: string;
  name: string;
  url: string;
  category: string;
  logo_url: string | null;
}

const Channels = () => {
  const { t } = useLanguage();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("live_channels")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) {
        if (error.code === "42P01") {
          // Table doesn't exist yet, we'll show mock data or a message
          setChannels([]);
        } else {
          throw error;
        }
      } else {
        setChannels(data as Channel[]);
      }
    } catch (err: any) {
      toast.error("Erreur lors du chargement des chaînes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel && videoRef.current) {
      const video = videoRef.current;
      const isM3U8 = selectedChannel.url.includes(".m3u8");

      if (isM3U8) {
        if (Hls.isSupported()) {
          if (hlsRef.current) hlsRef.current.destroy();
          const hls = new Hls();
          hls.loadSource(selectedChannel.url);
          hls.attachMedia(video);
          hlsRef.current = hls;
          hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = selectedChannel.url;
          video.addEventListener("loadedmetadata", () => video.play());
        }
      }
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedChannel]);

  const categories = ["all", ...new Set(channels.map((c) => c.category))];

  const filteredChannels = channels.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <section className="pt-28 pb-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-accent flex items-center gap-4">
                <Tv className="w-10 h-10 md:w-12 md:h-12 text-accent" />
                {t("nav_channels")}
              </h1>
              <p className="text-muted-foreground mt-2">Diffusez vos chaînes préférées en direct.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute top-1/2 start-4 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher une chaîne..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-surface-card border border-border rounded-full ps-10 pe-4 py-2.5 text-sm focus:border-accent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Player Section */}
          {selectedChannel && (
            <div className="mb-12 animate-scale-in">
              <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-accent/20 shadow-glow/10 group">
                {selectedChannel.url.includes(".m3u8") ? (
                  <video
                    ref={videoRef}
                    controls
                    autoPlay
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={selectedChannel.url}
                    title={selectedChannel.name}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                  />
                )}
                <button 
                  onClick={() => setSelectedChannel(null)}
                  className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between p-4 bg-surface-card border border-border rounded-2xl">
                <div className="flex items-center gap-4">
                  {selectedChannel.logo_url ? (
                    <img src={selectedChannel.logo_url} alt="" className="w-10 h-10 object-contain rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Tv className="w-5 h-5 text-accent" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-lg">{selectedChannel.name}</h2>
                    <span className="text-xs uppercase tracking-widest text-accent font-bold">{selectedChannel.category}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedChannel(null)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Fermer le lecteur
                </button>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                    selectedCategory === cat
                      ? "bg-gradient-accent text-accent-foreground shadow-accent"
                      : "bg-surface-card border border-border text-muted-foreground hover:border-accent-subtle"
                  }`}
                >
                  {cat === "all" ? "Toutes" : cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-muted-foreground animate-pulse">Chargement des chaînes...</p>
            </div>
          ) : filteredChannels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => {
                    setSelectedChannel(channel);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`group relative flex flex-col items-center p-6 rounded-2xl border transition-all duration-500 hover:-translate-y-2 ${
                    selectedChannel?.id === channel.id
                      ? "border-accent bg-accent/5 shadow-glow"
                      : "border-border bg-surface-card hover:border-accent-subtle"
                  }`}
                >
                  <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                    {channel.logo_url ? (
                      <img
                        src={channel.logo_url}
                        alt={channel.name}
                        className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Tv className="w-12 h-12 text-muted-foreground group-hover:text-accent transition-colors" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-xl">
                      <Play className="w-8 h-8 text-white fill-white animate-scale-in" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-center line-clamp-1 group-hover:text-accent transition-colors">
                    {channel.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 opacity-60">
                    {channel.category}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-surface-card border border-border rounded-2xl p-12 text-center flex flex-col items-center gap-4">
              <Info className="w-12 h-12 text-muted-foreground/30" />
              <div>
                <p className="text-lg font-medium text-muted-foreground">Aucune chaîne disponible.</p>
                <p className="text-sm text-muted-foreground/60 mt-1">L'administrateur n'a pas encore ajouté de chaînes.</p>
              </div>
              {/* Special Admin Prompt */}
              <div className="mt-8 p-4 bg-accent/5 border border-accent-subtle/20 rounded-xl text-xs text-accent max-w-md">
                <p>💡 <strong>Note pour l'admin :</strong> Rendez-vous dans le panneau d'administration pour créer la table <code>live_channels</code> et ajouter vos flux M3U8 ou Iframe.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Channels;
