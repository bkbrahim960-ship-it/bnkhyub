/**
 * BNKhub — Sélecteur de langue FR / AR / EN / ES.
 */
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import { Lang } from "@/services/i18n";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-card border border-border hover:border-accent-subtle transition-colors duration-300 text-sm"
          aria-label="Langue"
        >
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground/90 font-medium uppercase text-xs">{lang}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-surface-elevated border-border min-w-[180px]">
        {(Object.entries(LANGUAGES) as [Lang, (typeof LANGUAGES)[Lang]][]).map(([code, info]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLang(code)}
            className={`flex items-center gap-3 cursor-pointer ${
              lang === code ? "text-accent" : ""
            }`}
          >
            <span className="text-base">{info.flag}</span>
            <span className="flex-1">{info.label}</span>
            {lang === code && <span className="text-accent">●</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
