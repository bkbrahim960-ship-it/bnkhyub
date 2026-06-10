import { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { fetchChannels, Channel } from "@/services/channels";
import { ChannelPlayer } from "@/components/channel/ChannelPlayer";
import { Loader2, Tv, Search, ChevronLeft, ChevronRight, Play } from "lucide-react";

const ITEMS_PER_PAGE = 50;

const Channels = () => {
  const { lang } = useLanguage();
  const [groups, setGroups] = useState<string[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Channel | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChannels({
        page,
        group: activeGroup || undefined,
        search: search || undefined,
      });
      setChannels(data.channels);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      if (data.groups.length > 0) setGroups(data.groups);
    } catch (err: any) {
      setError(err.message || "Failed to load channels");
    } finally {
      setLoading(false);
    }
  }, [page, activeGroup, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGroupClick = (group: string) => {
    setActiveGroup(activeGroup === group ? "" : group);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <Layout>
      <section className="pt-28 pb-12">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <Tv className="w-8 h-8 text-accent" />
            <h1 className="font-display text-4xl font-bold">
              {lang === "ar" ? "القنوات التلفزيونية" : "TV Channels"}
            </h1>
            <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-surface-card border border-border">
              {total}
            </span>
          </div>

          <form onSubmit={handleSearch} className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "ابحث عن قناة..." : "Search channels..."}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-card border border-border focus:outline-none focus:border-accent transition-colors"
            />
          </form>

          <div className="flex flex-wrap gap-2 mb-6">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => handleGroupClick(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeGroup === g
                    ? "bg-accent text-accent-foreground"
                    : "bg-surface-card border border-border hover:border-accent-subtle"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-muted-foreground">
                {lang === "ar" ? "جاري تحميل القنوات..." : "Loading channels..."}
              </p>
            </div>
          ) : error ? (
            <div className="bg-surface-card border border-border rounded-2xl p-12 text-center">
              <Tv className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">{error}</p>
              <button
                onClick={load}
                className="mt-4 px-6 py-2 rounded-full bg-accent text-accent-foreground font-bold text-sm"
              >
                {lang === "ar" ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          ) : channels.length === 0 ? (
            <div className="bg-surface-card border border-border rounded-2xl p-12 text-center">
              <Tv className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {lang === "ar" ? "لا توجد قنوات" : "No channels found"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {channels.map((ch, i) => (
                  <button
                    key={`${ch.name}-${i}`}
                    onClick={() => setPlaying(ch)}
                    className="group bg-surface-card border border-border rounded-xl p-4 hover:border-accent-subtle transition-all duration-200 text-right flex items-center gap-3"
                  >
                    {ch.logo ? (
                      <img
                        src={ch.logo}
                        alt={ch.name}
                        className="w-10 h-10 rounded-lg object-contain bg-black/20 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{ch.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{ch.group}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Play className="w-4 h-4 text-accent" />
                    </div>
                  </button>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-full bg-surface-card border border-border hover:border-accent-subtle transition-all disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-full bg-surface-card border border-border hover:border-accent-subtle transition-all disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {playing && (
        <ChannelPlayer
          name={playing.name}
          logo={playing.logo}
          url={playing.url}
          group={playing.group}
          onClose={() => setPlaying(null)}
        />
      )}
    </Layout>
  );
};

export default Channels;
