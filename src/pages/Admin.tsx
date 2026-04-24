import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, Server, AlertTriangle } from "lucide-react";

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
    }
  }, [user]);

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
    </Layout>
  );
};

export default Admin;
