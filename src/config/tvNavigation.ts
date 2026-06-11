/**
 * BNKhub — أزرار التنقل الرئيسية للتلفاز / TV main navigation routes.
 */
export interface TVNavItem {
  path: string;
  labelFr: string;
  labelAr: string;
  labelEn: string;
  icon: string;
}

export const TV_MAIN_NAV: TVNavItem[] = [
  { path: "/", labelFr: "Accueil", labelAr: "الرئيسية", labelEn: "Home", icon: "home" },
  { path: "/movies", labelFr: "Films", labelAr: "أفلام", labelEn: "Movies", icon: "film" },
  { path: "/series", labelFr: "Séries", labelAr: "مسلسلات", labelEn: "Series", icon: "tv" },
  { path: "/my-list", labelFr: "Ma Liste", labelAr: "قائمتي", labelEn: "My List", icon: "list" },
  { path: "/search", labelFr: "Recherche", labelAr: "البحث", labelEn: "Search", icon: "search" },
  { path: "/profile", labelFr: "Profil", labelAr: "الملف الشخصي", labelEn: "Profile", icon: "user" },
];

export function getTVNavLabel(item: TVNavItem, lang: string): string {
  if (lang === "ar") return item.labelAr;
  if (lang === "en") return item.labelEn;
  return item.labelFr;
}
