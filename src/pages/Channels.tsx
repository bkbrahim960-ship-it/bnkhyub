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
      // 1. Fetch from Supabase
      const { data: dbData, error } = await supabase
        .from("live_channels")
        .select("*")
        .order("name", { ascending: true });
      
      let mergedChannels: Channel[] = [];
      if (!error && dbData) {
        mergedChannels = dbData as Channel[];
      }

      // 2. Fetch from External M3U (iptv-org) - Just a sample to avoid overload
      try {
        const response = await fetch("https://iptv-org.github.io/iptv/index.m3u");
        const text = await response.text();
        const lines = text.split("\n");
        const externalChannels: Channel[] = [];
        
        let currentChannel: Partial<Channel> = {};
        // We only take first 200 channels for performance
        for (let i = 0; i < lines.length && externalChannels.length < 200; i++) {
          const line = lines[i].trim();
          if (line.startsWith("#EXTINF:")) {
            const nameMatch = line.match(/,(.*)$/);
            const logoMatch = line.match(/tvg-logo="([^"]*)"/);
            const groupMatch = line.match(/group-title="([^"]*)"/);
            currentChannel = {
              id: `ext-${externalChannels.length}`,
              name: nameMatch ? nameMatch[1].trim() : "Unknown",
              logo_url: logoMatch ? logoMatch[1] : null,
              category: groupMatch ? groupMatch[1] : "Global TV"
            };
          } else if (line.startsWith("http")) {
            if (currentChannel.name) {
              externalChannels.push({ ...currentChannel, url: line } as Channel);
              currentChannel = {};
            }
          }
        }
        mergedChannels = [...mergedChannels, ...externalChannels];
      } catch (err) {
        console.warn("Failed to fetch external M3U", err);
      }

      // 3. User's Custom HLS Streams
      const customStaticChannels: Channel[] = [
        { id: "bein-1", name: "بي إن سبورت 1 - HD", url: "https://vidsrc.xyz/embed/movie/tt0000001", category: "الرياضة", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/beIN_Sports_1_logo.svg/1200px-beIN_Sports_1_logo.svg.png" },
        { id: "bein-2", name: "بي إن سبورت 2 - HD", url: "https://vidsrc.xyz/embed/movie/tt0000002", category: "الرياضة", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/beIN_Sports_2_logo.svg/1200px-beIN_Sports_2_logo.svg.png" },
        { id: "bein-3", name: "بي إن سبورت 3 - HD", url: "https://vidsrc.xyz/embed/movie/tt0000003", category: "الرياضة", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/beIN_Sports_3_logo.svg/1200px-beIN_Sports_3_logo.svg.png" },
        { id: "bein-4", name: "بي إن سبورت 4 - HD", url: "https://vidsrc.xyz/embed/movie/tt0000004", category: "الرياضة", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/beIN_Sports_4_logo.svg/1200px-beIN_Sports_4_logo.svg.png" },
        { id: "bein-prem-1", name: "بي إن سبورت Premium 1", url: "https://vidsrc.xyz/embed/movie/tt0000005", category: "الرياضة", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/BeIN_Sports_Premium_1_logo.svg/1200px-BeIN_Sports_Premium_1_logo.svg.png" },
        { id: "bein-xtra-1", name: "بي إن سبورت XTRA 1", url: "https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8", category: "الرياضة", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/BeIN_Sports_Xtra_logo.svg/1200px-BeIN_Sports_Xtra_logo.svg.png" },
        { id: "bein-news", name: "بي إن سبورت الإخبارية", url: "https://beinsports-news.akamaized.net/hls/live/2000341/test/master.m3u8", category: "الرياضة", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/BeIN_Sports_News_logo.svg/1200px-BeIN_Sports_News_logo.svg.png" },
        { id: "c-1", name: "Becoming You (4K)", url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/adv_dv_atmos/main.m3u8", category: "Premium 4K", logo_url: "https://m.media-amazon.com/images/M/MV5BMTE0MGM4ODctMzRiZS00ZmM5LTg3YTMtYzg5YzY3YjM2MDllXkEyXkFqcGdeQXVyMTI1NDEyNTM5._V1_.jpg" },
        { id: "c-2", name: "Skate Phantom Flex", url: "https://sample.vodobox.net/skate_phantom_flex_4k/skate_phantom_flex_4k.m3u8", category: "Premium 4K", logo_url: "https://i.ytimg.com/vi/6zFv8IOn0io/maxresdefault.jpg" },
        { id: "c-3", name: "Tears of Steel (JW)", url: "https://content.jwplatform.com/manifests/vM7nH0Kl.m3u8", category: "Sci-Fi", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Tears_of_Steel_poster.jpg/800px-Tears_of_Steel_poster.jpg" },
        { id: "c-11", name: "Sky News (LIVE)", url: "https://skynewsau-live.akamaized.net/hls/live/2002689/skynewsau-extra1/master.m3u8", category: "Live TV", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Sky_News_2015_logo.svg/1200px-Sky_News_2015_logo.svg.png" },
        { id: "p-1", name: "Portrait Video 1", url: "https://flipfit-cdn.akamaized.net/flip_hls/661f570aab9d840019942b80-473e0b/video_h1.m3u8", category: "Portrait Shorts", logo_url: null },
        { id: "p-2", name: "Portrait Video 2", url: "https://flipfit-cdn.akamaized.net/flip_hls/662aae7a42cd740019b91dec-3e114f/video_h1.m3u8", category: "Portrait Shorts", logo_url: null },
        { id: "p-3", name: "Portrait Video 3", url: "https://flipfit-cdn.akamaized.net/flip_hls/663e5a1542cd740019b97dfa-ccf0e6/video_h1.m3u8", category: "Portrait Shorts", logo_url: null },
        { id: "p-4", name: "Portrait Video 4", url: "https://flipfit-cdn.akamaized.net/flip_hls/663d1244f22a010019f3ec12-f3c958/video_h1.m3u8", category: "Portrait Shorts", logo_url: null },
        { id: "p-5", name: "Portrait Video 5", url: "https://flipfit-cdn.akamaized.net/flip_hls/664ce52bd6fcda001911a88c-8f1c4d/video_h1.m3u8", category: "Portrait Shorts", logo_url: null },
        { id: "p-6", name: "Portrait Video 6", url: "https://flipfit-cdn.akamaized.net/flip_hls/664d87dfe8e47500199ee49e-dbd56b/video_h1.m3u8", category: "Portrait Shorts", logo_url: null },
        { id: "p-7", name: "Portrait Video 7", url: "https://flipfit-cdn.akamaized.net/flip_hls/6656423247ffe600199e8363-15125d/video_h1.m3u8", category: "Portrait Shorts", logo_url: null },
      ];

      mergedChannels = [...customStaticChannels, ...mergedChannels, ...externalChannels];

      setChannels(mergedChannels);
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
    
    // Si "Toutes" est sélectionné, on masque les chaînes algériennes selon la demande de l'utilisateur
    let matchesCategory = false;
    if (selectedCategory === "all") {
      matchesCategory = c.category !== "الجزائر";
    } else {
      matchesCategory = c.category === selectedCategory;
    }
    
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
