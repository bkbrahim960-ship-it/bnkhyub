/**
 * BNKhub — Lecteur vidéo avec 10 sources.
 * ⚠️ Changement de source UNIQUEMENT manuel (pas de fallback auto).
 * Le timeout de 5s n'a été conservé que pour marquer visuellement une source
 * comme potentiellement indisponible, mais il NE bascule plus automatiquement.
 */
import { useEffect, useRef, useState } from "react";
import { getMovieSources, getTVSources, SOURCE_LABELS } from "@/services/player";
import { AdsNoticeModal, hasSeenAdsNotice } from "./AdsNoticeModal";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, AlertCircle, RotateCw, Users, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWatchParty } from "@/hooks/useWatchParty";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  imdb_id: string;
  tmdb_id: number | string;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  title?: string;
  /** Index initial de source (pour reprise depuis historique) */
  initialSourceIndex?: number;
  /** Callback à chaque changement manuel de source (pour synchro Cloud) */
  onSourceChange?: (index: number, label: string) => void;
  /** Callback au lancement du lecteur (1re lecture) — pour créer l'entrée historique */
  onPlayStart?: (index: number, label: string) => void;
  /** URL directe pour les contenus personnalisés */
  customUrl?: string;
}

export const VideoPlayer = ({
  imdb_id,
  tmdb_id,
  type,
  season,
  episode,
  title,
  initialSourceIndex = 0,
  onSourceChange,
  onPlayStart,
  customUrl,
}: Props) => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const partyId = searchParams.get("party");
  const { participants } = useWatchParty(partyId || undefined);
  const [sourceIndex, setSourceIndex] = useState(initialSourceIndex);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState<boolean[]>(Array(50).fill(false));
  const [adsOpen, setAdsOpen] = useState(!hasSeenAdsNotice());
  const [playerActive, setPlayerActive] = useState(hasSeenAdsNotice());
  const timeoutRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const baseSources =
    type === "movie"
      ? getMovieSources(imdb_id, tmdb_id)
      : getTVSources(imdb_id, tmdb_id, season ?? 1, episode ?? 1);

  const [customSources, setCustomSources] = useState<string[]>([]);
  const [customLabels, setCustomLabels] = useState<string[]>([]);

  const sources = customUrl ? [customUrl] : [...baseSources, ...customSources];
  const allLabels = customUrl ? ["Source Directe"] : [...SOURCE_LABELS, ...customLabels];

  useEffect(() => {
    const fetchCustomServers = async () => {
      try {
        const { data, error } = await supabase.from("custom_servers").select("*");
        if (!error && data) {
          const relevant = data.filter((s: any) => s.type === "both" || s.type === type);
          const cSources: string[] = [];
          const cLabels: string[] = [];
          relevant.forEach((s: any) => {
            let url = s.url_pattern
              .replace(/{imdb}/g, imdb_id || "")
              .replace(/{tmdb}/g, String(tmdb_id || ""))
              .replace(/{s}/g, String(season || 1))
              .replace(/{e}/g, String(episode || 1));
            cSources.push(url);
            cLabels.push(`S${10 + cLabels.length + 1} · ${s.name}`);
          });
          setCustomSources(cSources);
          setCustomLabels(cLabels);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchCustomServers();
  }, [imdb_id, tmdb_id, type, season, episode]);

  // Recharge quand on change de source / d'item (sans auto-switch)
  useEffect(() => {
    if (!playerActive) return;
    setLoading(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    // Simple indicateur visuel "source lente" après 8s, sans bascule auto
    timeoutRef.current = window.setTimeout(() => {
      setSlow((prev) => {
        const copy = [...prev];
        copy[sourceIndex] = true;
        return copy;
      });
    }, 8000);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [sourceIndex, playerActive, imdb_id, tmdb_id, season, episode]);

  useEffect(() => {
    if (playerActive && !startedRef.current) {
      startedRef.current = true;
      onPlayStart?.(sourceIndex, allLabels[sourceIndex] || SOURCE_LABELS[sourceIndex]);
    }
  }, [playerActive, sourceIndex, onPlayStart, allLabels]);

  const handleLoad = () => {
    setLoading(false);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  };

  const selectSource = (idx: number) => {
    if (idx === sourceIndex) return;
    setSourceIndex(idx);
    // Réinitialise le flag "lent" pour la source choisie
    setSlow((prev) => {
      const copy = [...prev];
      copy[idx] = false;
      return copy;
    });
    onSourceChange?.(idx, allLabels[idx] || SOURCE_LABELS[idx]);
  };

  const retry = () => {
    setSlow(Array(50).fill(false));
    setLoading(true);
  };

  return (
    <div className="w-full">
      <AdsNoticeModal
        open={adsOpen}
        onAccept={() => {
          setAdsOpen(false);
          setPlayerActive(true);
        }}
        onClose={() => setAdsOpen(false)}
      />

      {title && (
        <h2 className="font-display text-xl md:text-2xl text-accent mb-3 px-1">{title}</h2>
      )}

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-border shadow-card-luxe">
        {!playerActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-elevated">
            <button
              onClick={() => {
                setAdsOpen(false);
                setPlayerActive(true);
              }}
              className="bg-gradient-accent text-accent-foreground font-semibold px-8 py-4 rounded-full shadow-accent animate-pulse-glow"
            >
              ▶ {t("hero_watch")}
            </button>
          </div>
        )}

        {playerActive && (
          <iframe
            key={sourceIndex}
            src={sources[sourceIndex]}
            title="BNKhub player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            onLoad={handleLoad}
            className="absolute inset-0 w-full h-full"
          />
        )}

        {playerActive && loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">{t("player_loading")}</p>
            <p className="text-xs text-accent mt-1">{allLabels[sourceIndex] || SOURCE_LABELS[sourceIndex]}</p>
          </div>
        )}

        {playerActive && slow[sourceIndex] && !loading && (
          <div className="absolute top-3 end-3 flex items-center gap-2 bg-black/70 border border-border rounded-full px-3 py-1.5 text-xs">
            <AlertCircle className="w-3.5 h-3.5 text-accent" />
            <button onClick={retry} className="inline-flex items-center gap-1 hover:text-accent">
              <RotateCw className="w-3 h-3" /> {t("player_retry")}
            </button>
          </div>
        )}
      </div>

      {/* Sélecteur manuel S1–S10 */}
      <div className="mt-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {t("player_source")}
        </p>
        <div className="flex flex-wrap gap-2">
          {sources.map((_, idx) => {
            const isActive = idx === sourceIndex;
            const isSlow = slow[idx];
            return (
              <button
                key={idx}
                onClick={() => selectSource(idx)}
                className={`relative text-xs font-medium px-3 py-2 rounded-lg border transition-all duration-300 ease-luxe ${
                  isActive
                    ? "border-accent bg-accent/10 text-accent shadow-accent"
                    : isSlow
                    ? "border-border bg-surface-card text-muted-foreground"
                    : "border-border bg-surface-card hover:border-accent-subtle text-foreground/80"
                }`}
                title={allLabels[idx] || SOURCE_LABELS[idx]}
              >
                {isActive && (
                  <span
                    className="absolute -top-1 -end-1 w-2 h-2 rounded-full animate-pulse-dot"
                    style={{ background: "hsl(142 70% 50%)" }}
                  />
                )}
                S{idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Watch Party & Info */}
      <div className="mt-6 p-4 rounded-xl bg-surface-card border border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">{partyId ? "Party Active" : "Watch Party"}</p>
              <p className="text-[10px] text-muted-foreground">{partyId ? `${participants} watching together` : "Watch with friends"}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => {
            const id = partyId || Math.random().toString(36).substring(7);
            const url = new URL(window.location.href);
            url.searchParams.set("party", id);
            navigator.clipboard.writeText(url.toString());
            toast.success("Watch Party Link copied!");
            if (!partyId) window.location.search = url.search;
          }}
          className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold px-4 py-2 rounded-full transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          {partyId ? "Invite Friends" : "Create Party"}
        </button>
      </div>
    </div>
  );
};
