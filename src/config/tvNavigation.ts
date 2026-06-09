/**
 * BNKhub — أزرار التنقل الرئيسية للتلفاز / TV main navigation routes.
 */
export interface TVNavItem {
  path: string;
  labelFr: string;
  labelAr: string;
  labelEn: string;
}

export const TV_MAIN_NAV: TVNavItem[] = [
  { path: "/", labelFr: "Accueil", labelAr: "الرئيسية", labelEn: "Home" },
  { path: "/movies", labelFr: "Films", labelAr: "أفلام", labelEn: "Movies" },
  { path: "/series", labelFr: "Séries", labelAr: "مسلسلات", labelEn: "Series" },
  { path: "/my-list", labelFr: "Ma Liste", labelAr: "قائمتي", labelEn: "My List" },
  { path: "/search", labelFr: "Recherche", labelAr: "البحث", labelEn: "Search" },
  { path: "/profile", labelFr: "Profil", labelAr: "الملف الشخصي", labelEn: "Profile" },
];

export function getTVNavLabel(item: TVNavItem, lang: string): string {
  if (lang === "ar") return item.labelAr;
  if (lang === "en") return item.labelEn;
  return item.labelFr;
}
