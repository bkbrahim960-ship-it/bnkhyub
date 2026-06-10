import { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { fetchChannels, Channel } from "@/services/channels";
import { ChannelPlayer } from "@/components/channel/ChannelPlayer";
import { Loader2, Tv, Search, Play } from "lucide-react";

const Channels = () => {
  const { lang } = useLanguage();
  const [groups, setGroups] = useState<string[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeGroup, setActiveGroup] = useState("");
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchChannels({ page: 1 });
        setGroups(data.groups);
      } catch {}
    })();
  }, []);

  const loadChannels = useCallback(async (group: string, p: number, q?: string) => {
    setLoadingChannels(true);
    setError(null);
    try {
      const data = await fetchChannels({
        page: p,
        group: group && group !== "__all__" ? group : undefined,
        search: q || search || undefined,
      });
      setChannels(data.channels);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingChannels(false);
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (activeGroup) {
      loadChannels(activeGroup, page);
    } else {
      setChannels([]);
      setTotal(0);
      setTotalPages(1);
      setLoading(false);
    }
  }, [activeGroup, page, loadChannels]);

  const handleGroupClick = (group: string) => {
    setActiveGroup(activeGroup === group ? "" : group);
    setPage(1);
    setActiveChannel(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    if (activeGroup) {
      loadChannels(activeGroup, 1);
    } else {
      loadChannels("__all__", 1);
    }
  };

  return (
    <Layout>
      <section className="pt-24 pb-6 h-screen flex flex-col">
        <div className="flex-1 flex overflow-hidden gap-0">
          <div className="w-56 lg:w-64 shrink-0 border-r border-border overflow-y-auto bg-surface-card/50 py-4">
            <div className="px-4 mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {lang === "ar" ? "التصنيفات" : "Categories"}
              </h3>
            </div>
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => handleGroupClick(g)}
                className={`w-full text-right px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/[0.04] ${
                  activeGroup === g
                    ? "bg-accent/10 text-accent border-r-2 border-accent"
                    : "text-foreground/70"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="w-72 lg:w-80 shrink-0 border-r border-border flex flex-col">
            <div className="p-3 border-b border-border">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={lang === "ar" ? "بحث..." : "Search..."}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-card border border-border text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </form>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!activeGroup ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm p-6 text-center">
                  <Tv className="w-10 h-10 mb-3 opacity-30" />
                  {lang === "ar" ? "اختر تصنيفاً" : "Select a category"}
                </div>
              ) : loadingChannels ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-accent animate-spin" />
                </div>
              ) : channels.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm p-6 text-center">
                  <Tv className="w-10 h-10 mb-3 opacity-30" />
                  {lang === "ar" ? "لا توجد قنوات" : "No channels"}
                </div>
              ) : (
                <>
                  {channels.map((ch, i) => (
                    <button
                      key={`${ch.name}-${i}`}
                      onClick={() => setActiveChannel(ch)}
                      className={`w-full text-right px-4 py-3 flex items-center gap-3 transition-colors hover:bg-white/[0.04] ${
                        activeChannel?.url === ch.url
                          ? "bg-accent/10 text-accent"
                          : "text-foreground/80"
                      }`}
                    >
                      {ch.logo ? (
                        <img
                          src={ch.logo}
                          alt=""
                          className="w-8 h-8 rounded-lg object-contain bg-black/20 flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : null}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ch.name}</p>
                      </div>
                      <Play className="w-3.5 h-3.5 opacity-30 flex-shrink-0" />
                    </button>
                  ))}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        {lang === "ar" ? "السابق" : "Prev"}
                      </button>
                      <span className="text-xs text-muted-foreground">{page}/{totalPages}</span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        {lang === "ar" ? "التالي" : "Next"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex-1 bg-black flex items-center justify-center relative">
            {activeChannel ? (
              <ChannelPlayer
                name={activeChannel.name}
                logo={activeChannel.logo}
                url={activeChannel.url}
                group={activeChannel.group}
                onClose={() => setActiveChannel(null)}
                standalone
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Tv className="w-16 h-16 opacity-20" />
                <p className="text-lg font-medium">
                  {lang === "ar" ? "اختر قناة للمشاهدة" : "Select a channel to watch"}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Channels;
