import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseM3U } from "@/services/m3uParser";
import { Trash2, Plus, Server, AlertTriangle, BarChart, Users, TrendingUp, Monitor } from "lucide-react";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CustomServer {
  id: string;
  name: string;
  url_pattern: string;
  type: "movie" | "tv" | "both";
  created_at: string;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [servers, setServers] = useState<CustomServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSql, setShowSql] = useState(false);

  const [newName, setNewName] = useState("");
  const [newUrlPattern, setNewUrlPattern] = useState("");
  const [newType, setNewType] = useState<"movie" | "tv" | "both">("both");
  
  const [channels, setChannels] = useState<any[]>([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelUrl, setNewChannelUrl] = useState("");
  const [newChannelCategory, setNewChannelCategory] = useState("Général");
  const [newChannelLogo, setNewChannelLogo] = useState("");
  const [m3uContent, setM3uContent] = useState("");
  const [importing, setImporting] = useState(false);

  // Vérifier l'admin
  useEffect(() => {
    if (!authLoading && user?.email !== "bkbrahim960@gmail.com") {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const fetchServers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("custom_servers").select("*").order("created_at", { ascending: false });
      if (error) {
        if (error.code === "42P01") {
          // Relation (table) n'existe pas
          setShowSql(true);
        } else {
          throw error;
        }
      } else {
        setServers(data as CustomServer[]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur lors de la récupération des serveurs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email === "bkbrahim960@gmail.com") {
      fetchServers();
      fetchChannels();
    }
  }, [user]);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase.from("live_channels").select("*").order("name");
      if (!error) setChannels(data || []);
    } catch (err) {}
  };

  const addServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrlPattern) return;
    
    try {
      const { error } = await supabase.from("custom_servers").insert([
        { name: newName, url_pattern: newUrlPattern, type: newType }
      ]);
      if (error) throw error;
      
      toast.success("Serveur ajouté avec succès !");
      setNewName("");
      setNewUrlPattern("");
      fetchServers();
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    }
  };

  const deleteServer = async (id: string) => {
    try {
      const { error } = await supabase.from("custom_servers").delete().eq("id", id);
      if (error) throw error;
      toast.success("Serveur supprimé");
      fetchServers();
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    }
  };

  const addChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("live_channels").insert([{
        name: newChannelName,
        url: newChannelUrl,
        category: newChannelCategory,
        logo_url: newChannelLogo || null
      }]);
      if (error) throw error;
      toast.success("Chaîne ajoutée !");
      setNewChannelName("");
      setNewChannelUrl("");
      setNewChannelLogo("");
      fetchChannels();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteChannel = async (id: string) => {
    try {
      await supabase.from("live_channels").delete().eq("id", id);
      toast.success("Chaîne supprimée");
      fetchChannels();
    } catch (err) {}
  };

  const importM3U = async () => {
    if (!m3uContent.trim()) return;
    setImporting(true);
    try {
      const parsedChannels = parseM3U(m3uContent);
      if (parsedChannels.length === 0) throw new Error("Aucune chaîne trouvée dans le texte.");

      const { error } = await supabase.from("live_channels").insert(
        parsedChannels.map(c => ({
          name: c.name,
          url: c.url,
          logo_url: c.logo,
          category: c.category
        }))
      );

      if (error) throw error;
      toast.success(`${parsedChannels.length} chaînes importées !`);
      setM3uContent("");
      fetchChannels();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setImporting(false);
    }
  };

  const sqlCode = `
CREATE TABLE custom_servers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  url_pattern TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS (Row Level Security)
ALTER TABLE custom_servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les serveurs" 
ON custom_servers FOR SELECT USING (true);

CREATE POLICY "Seul l'admin peut ajouter des serveurs" 
ON custom_servers FOR INSERT 
WITH CHECK (auth.email() = 'bkbrahim960@gmail.com');

CREATE POLICY "Seul l'admin peut modifier/supprimer des serveurs" 
ON custom_servers FOR ALL 
USING (auth.email() = 'bkbrahim960@gmail.com');

-- ═══════════════════════════════════════
-- TABLE FAVORIS (Ma Liste)
-- ═══════════════════════════════════════

CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  backdrop_path TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, tmdb_id, media_type)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
ON favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON favorites FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- TABLE REVIEWS (Avis)
-- ═══════════════════════════════════════

CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, tmdb_id, media_type)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les avis" ON reviews FOR SELECT USING (true);
CREATE POLICY "Les utilisateurs peuvent poster des avis" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres avis" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- TABLE LIVE CHANNELS
-- ═══════════════════════════════════════

CREATE TABLE live_channels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Général',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE live_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tout le monde peut voir les chaînes" ON live_channels FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON live_channels FOR ALL USING (auth.email() = 'bkbrahim960@gmail.com');
  `.trim();

  if (authLoading || user?.email !== "bkbrahim960@gmail.com") {
    return <Layout><div className="pt-32 text-center">Chargement...</div></Layout>;
  }

  return (
    <Layout>
      <div className="container max-w-4xl pt-32 pb-20">
        <h1 className="text-3xl font-display font-bold text-gradient-accent mb-8 flex items-center gap-3">
          <Server className="w-8 h-8 text-accent" /> Panneau d'Administration
        </h1>

        {showSql && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8 text-red-200">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-2 text-red-400">
              <AlertTriangle className="w-6 h-6" /> Configuration Requise
            </h2>
            <p className="mb-4 text-sm text-red-200/80">
              La table <code>custom_servers</code> n'existe pas dans votre base de données Supabase.
              Pour pouvoir ajouter des serveurs, veuillez exécuter le code SQL suivant dans l'éditeur SQL de votre tableau de bord Supabase :
            </p>
            <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-xs text-white/90 border border-white/10 select-all">
              {sqlCode}
            </pre>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-surface-card border border-border rounded-xl p-6 shadow-card-luxe">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-6 h-6 text-accent" />
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Utilisateurs</span>
            </div>
            <p className="text-3xl font-display font-bold">1,284</p>
            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% cette semaine
            </p>
          </div>
          <div className="bg-surface-card border border-border rounded-xl p-6 shadow-card-luxe">
            <div className="flex items-center justify-between mb-4">
              <Server className="w-6 h-6 text-accent" />
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Vues Totales</span>
            </div>
            <p className="text-3xl font-display font-bold">45.2k</p>
            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +5% cette semaine
            </p>
          </div>
          <div className="bg-surface-card border border-border rounded-xl p-6 shadow-card-luxe">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-6 h-6 text-accent" />
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Avis Clients</span>
            </div>
            <p className="text-3xl font-display font-bold">892</p>
            <p className="text-xs text-accent mt-1 flex items-center gap-1">
              ⭐ 4.8 moyenne
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-surface-card border border-border rounded-xl p-6 shadow-card-luxe mb-10">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-accent" /> Activité de visionnage (7 derniers jours)
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={[
                { name: 'Lun', views: 4000 },
                { name: 'Mar', views: 3000 },
                { name: 'Mer', views: 2000 },
                { name: 'Jeu', views: 2780 },
                { name: 'Ven', views: 1890 },
                { name: 'Sam', views: 2390 },
                { name: 'Dim', views: 3490 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--bg-card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                  itemStyle={{ color: 'hsl(var(--accent))' }}
                />
                <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                  <Cell fill="hsl(var(--accent))" />
                  <Cell fill="hsl(var(--accent))" />
                  <Cell fill="hsl(var(--accent))" />
                  <Cell fill="hsl(var(--accent))" />
                  <Cell fill="hsl(var(--accent))" />
                  <Cell fill="hsl(var(--accent))" />
                  <Cell fill="hsl(var(--accent))" />
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-card border border-border rounded-xl p-6 shadow-card-luxe mb-8">
          <h2 className="text-xl font-semibold mb-4">Ajouter un nouveau serveur de streaming</h2>
          <form onSubmit={addServer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Nom du Serveur</label>
              <input
                required
                placeholder="Ex: Mon Serveur VIP"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-primary border border-border focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-primary border border-border focus:border-accent outline-none"
              >
                <option value="both">Films et Séries</option>
                <option value="movie">Films Uniquement</option>
                <option value="tv">Séries Uniquement</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Format d'URL</label>
              <p className="text-xs text-muted-foreground mb-2">Utilisez <code>{"{imdb}"}</code>, <code>{"{tmdb}"}</code>, <code>{"{s}"}</code> (saison) et <code>{"{e}"}</code> (épisode). Exemple: <code>https://serveur.com/embed/{"{imdb}"}</code></p>
              <input
                required
                placeholder="https://serveur.com/embed/{imdb}/{s}/{e}"
                value={newUrlPattern}
                onChange={(e) => setNewUrlPattern(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-primary border border-border focus:border-accent outline-none font-mono text-sm"
              />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                disabled={showSql}
                className="inline-flex items-center gap-2 bg-gradient-accent text-accent-foreground font-semibold px-6 py-2.5 rounded-lg shadow-accent hover:scale-[1.02] transition disabled:opacity-50"
              >
                <Plus className="w-5 h-5" /> Ajouter
              </button>
            </div>
          </form>
        </div>

        <div className="bg-surface-card border border-border rounded-xl p-6 shadow-card-luxe">
          <h2 className="text-xl font-semibold mb-4">Serveurs personnalisés ({servers.length})</h2>
          
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : servers.length === 0 && !showSql ? (
            <div className="text-center py-8 text-muted-foreground bg-surface-primary/50 rounded-lg">Aucun serveur ajouté pour le moment.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {servers.map((server) => (
                <div key={server.id} className="flex items-center justify-between p-4 rounded-lg bg-surface-primary border border-border">
                  <div>
                    <div className="font-semibold">{server.name} <span className="text-xs uppercase px-2 py-0.5 ml-2 bg-accent/20 text-accent rounded-full">{server.type}</span></div>
                    <div className="text-sm font-mono text-muted-foreground mt-1">{server.url_pattern}</div>
                  </div>
                  <button
                    onClick={() => deleteServer(server.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>

        {/* Section Chaînes TV */}
        <div className="mt-16">
          <h2 className="text-2xl font-display font-bold text-gradient-accent mb-6 flex items-center gap-2">
            <Monitor className="w-6 h-6 text-accent" /> Gestion des Chaînes TV
          </h2>

          <div className="bg-surface-card border border-border rounded-xl p-6 shadow-card-luxe mb-8">
            <h3 className="text-lg font-semibold mb-4">Ajouter une chaîne en direct</h3>
            <form onSubmit={addChannel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Nom de la Chaîne</label>
                <input
                  required
                  placeholder="Ex: Al Jazeera"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-primary border border-border focus:border-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Catégorie</label>
                <select
                  value={newChannelCategory}
                  onChange={(e) => setNewChannelCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-primary border border-border focus:border-accent outline-none"
                >
                  <option value="Général">Général</option>
                  <option value="Infos">Infos</option>
                  <option value="Sports">Sports</option>
                  <option value="Films">Films</option>
                  <option value="Kids">Kids</option>
                  <option value="Documentaires">Documentaires</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">URL du Flux (Iframe ou M3U8)</label>
                <input
                  required
                  placeholder="https://..."
                  value={newChannelUrl}
                  onChange={(e) => setNewChannelUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-primary border border-border focus:border-accent outline-none font-mono text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">URL du Logo (Optionnel)</label>
                <input
                  placeholder="https://logo-url.png"
                  value={newChannelLogo}
                  onChange={(e) => setNewChannelLogo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-primary border border-border focus:border-accent outline-none"
                />
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-gradient-accent text-accent-foreground font-semibold px-6 py-2.5 rounded-lg shadow-accent hover:scale-[1.02] transition"
                >
                  <Plus className="w-5 h-5" /> Ajouter la Chaîne
                </button>
              </div>
            </form>
          </div>

          <div className="bg-surface-card border border-border rounded-xl p-6 shadow-card-luxe">
            <h3 className="text-lg font-semibold mb-4">Chaînes existantes ({channels.length})</h3>
            <div className="flex flex-col gap-3">
              {channels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-4 rounded-lg bg-surface-primary border border-border">
                  <div className="flex items-center gap-3">
                    {channel.logo_url && <img src={channel.logo_url} alt="" className="w-8 h-8 object-contain" />}
                    <div>
                      <div className="font-semibold">{channel.name} <span className="text-xs uppercase px-2 py-0.5 ml-2 bg-accent/20 text-accent rounded-full">{channel.category}</span></div>
                      <div className="text-xs font-mono text-muted-foreground mt-1 truncate max-w-md">{channel.url}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteChannel(channel.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {channels.length === 0 && <div className="text-center py-8 text-muted-foreground">Aucune chaîne enregistrée.</div>}
            </div>
          </div>

          {/* Import M3U Section */}
          <div className="bg-surface-card border border-border rounded-xl p-6 shadow-card-luxe mb-8">
            <h3 className="text-lg font-semibold mb-2">Importation en masse (M3U)</h3>
            <p className="text-xs text-muted-foreground mb-4">Collez votre contenu de fichier .m3u ici pour importer toutes les قنوات d'un coup.</p>
            <textarea
              value={m3uContent}
              onChange={(e) => setM3uContent(e.target.value)}
              placeholder="#EXTM3U..."
              className="w-full h-40 px-3 py-2.5 rounded-lg bg-surface-primary border border-border focus:border-accent outline-none font-mono text-[10px] mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={importM3U}
                disabled={importing || !m3uContent.trim()}
                className="inline-flex items-center gap-2 bg-surface-elevated text-foreground border border-border px-6 py-2 rounded-lg hover:border-accent transition disabled:opacity-50"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Lancer l'importation
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
