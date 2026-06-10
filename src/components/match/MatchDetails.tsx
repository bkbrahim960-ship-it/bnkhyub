import { Game, Stadium, getTeamFlag } from "@/services/worldcup";
import { MapPin, Calendar, Trophy, X } from "lucide-react";

interface MatchDetailsProps {
  game: Game;
  stadiumMap: Map<string, Stadium>;
  lang: "en" | "ar";
  onClose: () => void;
}

const STAGE_LABELS: Record<string, { en: string; ar: string }> = {
  group: { en: "Group Stage", ar: "دور المجموعات" },
  round_32: { en: "Round of 32", ar: "دور الـ32" },
  round_16: { en: "Round of 16", ar: "دور الـ16" },
  quarter: { en: "Quarter-finals", ar: "ربع النهائي" },
  semi: { en: "Semi-finals", ar: "نصف النهائي" },
  third: { en: "Third Place", ar: "المركز الثالث" },
  final: { en: "Final", ar: "النهائي" },
};

export const MatchDetails = ({ game, stadiumMap, lang, onClose }: MatchDetailsProps) => {
  const stadium = stadiumMap.get(game.stadium_id);
  const stageKey = game.type || "group";
  const stageLabel = game.group
    ? `${lang === "ar" ? "المجموعة" : "Group"} ${game.group}`
    : lang === "ar"
      ? STAGE_LABELS[stageKey]?.ar || stageKey
      : STAGE_LABELS[stageKey]?.en || stageKey;

  const formatCapacity = (cap: number) => {
    return cap.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-card border border-border rounded-3xl max-w-lg w-full overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="relative p-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent/10 text-accent uppercase tracking-wider">
              {stageLabel}
            </span>
          </div>

          <div className="flex items-center justify-center gap-6 md:gap-10 mb-6">
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                <img
                  src={getTeamFlag(game, game.home_team_id)}
                  alt={game.home_team_name_en || ""}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <span className="text-sm md:text-base font-bold text-center leading-tight">
                {game.home_team_name_en}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              {game.finished === "TRUE" ? (
                <span className="text-4xl md:text-5xl font-black font-mono tracking-wider text-accent">
                  {game.home_score} - {game.away_score}
                </span>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl md:text-3xl font-bold font-mono">
                    {game.local_date?.split(" ")[1]?.slice(0, 5) || "VS"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {game.finished !== "TRUE" && game.time_elapsed === "notstarted"
                      ? lang === "ar" ? "لم تبدأ" : "Not started"
                      : game.finished === "TRUE"
                        ? lang === "ar" ? "انتهت" : "Finished"
                        : ""}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                <img
                  src={getTeamFlag(game, game.away_team_id)}
                  alt={game.away_team_name_en || ""}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <span className="text-sm md:text-base font-bold text-center leading-tight">
                {game.away_team_name_en}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-8 py-5 space-y-3">
          {stadium && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
              <span>
                {stadium.name_en}
                {stadium.city_en ? `, ${stadium.city_en}` : ""}
                {stadium.country_en ? ` - ${stadium.country_en}` : ""}
                {stadium.capacity ? ` (${formatCapacity(stadium.capacity)})` : ""}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
            <span>
              {game.local_date || game.persian_date || ""}
              {game.matchday ? ` - ${lang === "ar" ? "الجولة" : "Matchday"} ${game.matchday}` : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
