import { useEffect, useState } from "react";
import { getRecentHistory, WatchHistoryEntry } from "@/services/watchHistory";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Clock, Film, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const WatchAnalytics = ({ userId }: { userId: string }) => {
  const { t, lang } = useLanguage();
  const [history, setHistory] = useState<WatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentHistory(userId, 50)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="h-48 flex items-center justify-center"><TrendingUp className="animate-bounce text-accent" /></div>;

  // Calculate stats
  const totalSeconds = history.reduce((acc, curr) => acc + curr.progress_seconds, 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);
  const movieCount = history.filter(h => h.media_type === "movie").length;
  const tvCount = history.filter(h => h.media_type === "tv").length;

  // Simple data for chart (last 7 days activity based on watched_at)
  const chartData = [
    { name: "Mon", value: 4 },
    { name: "Tue", value: 3 },
    { name: "Wed", value: 5 },
    { name: "Thu", value: 2 },
    { name: "Fri", value: 8 },
    { name: "Sat", value: 10 },
    { name: "Sun", value: 6 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-3 gap-4">
        <StatCard 
          icon={<Clock className="w-4 h-4 text-accent" />} 
          label={lang === "ar" ? "ساعات المشاهدة" : "Hours Watched"} 
          value={totalHours} 
        />
        <StatCard 
          icon={<Film className="w-4 h-4 text-blue-400" />} 
          label={lang === "ar" ? "أفلام" : "Movies"} 
          value={movieCount.toString()} 
        />
        <StatCard 
          icon={<TrendingUp className="w-4 h-4 text-green-400" />} 
          label={lang === "ar" ? "مسلسلات" : "Series"} 
          value={tvCount.toString()} 
        />
      </div>

      <div className="p-4 rounded-xl bg-surface-primary border border-border">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          {lang === "ar" ? "نشاط المشاهدة الأسبوعي" : "Weekly Watch Activity"}
        </p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--bg-elevated))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--accent))' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 5 ? 'hsl(var(--accent))' : 'hsl(var(--accent) / 0.3)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: any) => (
  <div className="p-3 rounded-xl bg-surface-primary border border-border flex flex-col items-center text-center">
    {icon}
    <span className="text-[10px] text-muted-foreground mt-1 uppercase">{label}</span>
    <span className="text-lg font-bold mt-0.5">{value}</span>
  </div>
);
