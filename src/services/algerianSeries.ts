// ============================================================
// ALGERIAN SERIES — روابط تضمين YouTube
// تم جمعها يدوياً من نتائج البحث — يونيو 2026
// ============================================================

export interface AlgerianEpisode {
  id: number;
  title: string;
  videoUrl: string;
}

export interface AlgerianSeries {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  year: string;
  rating: number;
  playlistUrl?: string;
  tmdbNames?: string[];
  episodes: AlgerianEpisode[];
}

const yt = (id: string) => `https://www.youtube.com/embed/${id}`;

export const ALGERIAN_SERIES: AlgerianSeries[] = [

  // ─────────────────────────────────────────────────────────
  // 1. Sultan Achour 10 — 66 حلقة (3 مواسم)
  // ─────────────────────────────────────────────────────────
  {
    id: "s-sultan-achour-10",
    title: "Sultan Achour 10",
    description: "مسلسل جزائري كوميدي درامي — 3 مواسم، 66 حلقة — إخراج جعفر قاسم",
    thumbnail: "",
    category: "كوميديا",
    year: "2015",
    rating: 0,
    playlistUrl: "https://www.youtube.com/playlist?list=PLZzO5Omem8DavaiMFocimjn6br6kzUUPa",
    episodes: [
      { id: 1,  title: "م1 ح01 — إعلان الحرب",         videoUrl: yt("ZmcIFk3hE94") },
      { id: 2,  title: "م1 ح02 — زواج المصلحة",         videoUrl: yt("zl1pXExTbpg") },
      { id: 3,  title: "م1 ح03 — مرض السلطانة",          videoUrl: yt("dnwNCQEbLqg") },
      { id: 4,  title: "م1 ح04 — مقابلة تاريخية 1",      videoUrl: yt("mV6a9HrcBS0") },
      { id: 5,  title: "م1 ح05 — مقابلة تاريخية 2",      videoUrl: yt("U9J5rnyVQgw") },
      { id: 6,  title: "م1 ح06 — المحاجب",               videoUrl: yt("3ArceVzNp5k") },
      { id: 7,  title: "م1 ح07 — عبلة الأميرة المتمردة", videoUrl: yt("pOOrxOsB_vo") },
      { id: 8,  title: "م1 ح08 — الوسواس 1",             videoUrl: yt("bGpBOPSTsYY") },
      { id: 9,  title: "م1 ح09 — الوسواس 2",             videoUrl: yt("sCPbyoHsU_g") },
      { id: 10, title: "م1 ح10 — التسامح",               videoUrl: yt("D2NQu5egKJU") },
      { id: 11, title: "م1 ح11 — الحقيقة ضد الكذب 1",   videoUrl: yt("AY8knrICZng") },
      { id: 12, title: "م1 ح12 — الحقيقة ضد الكذب 2",   videoUrl: yt("Z9NnN_0d9Hc") },
      { id: 13, title: "م1 ح13 — السفر عبر الزمن 1",     videoUrl: yt("Ud3v4joJONM") },
      { id: 14, title: "م1 ح14 — السفر عبر الزمن 2",     videoUrl: yt("2jhjGHTxrqk") },
      { id: 15, title: "م1 ح15 — السلطان لقما...شور",    videoUrl: yt("sIk3PTAonMM") },
      { id: 16, title: "م1 ح16 — الربيع العاشوري 1",     videoUrl: yt("v51sNf8S-l8") },
      { id: 17, title: "م1 ح17 — الربيع العاشوري 2",     videoUrl: yt("uiT2EZ3-f04") },
      { id: 18, title: "م1 ح18 — زواج عبلة 1",           videoUrl: yt("k6uGmEY1I_E") },
      { id: 19, title: "م1 ح19 — زواج عبلة 2",           videoUrl: yt("Ri-98DpWyZM") },
      { id: 20, title: "م1 ح20 — الملك ففو",             videoUrl: yt("MXvuu1uWEDo") },
      { id: 21, title: "م2 ح01 — عودة بنيبن",            videoUrl: yt("EflUSggXcP0") },
      { id: 22, title: "م2 ح02 — امتحان الباكالوريا",    videoUrl: yt("seEkoonkdF0") },
      { id: 23, title: "م2 ح03",                          videoUrl: yt("CJkARgrLUzk") },
      { id: 24, title: "م2 ح04",                          videoUrl: "" },
      { id: 25, title: "م2 ح05 — ملكة النساء",           videoUrl: yt("ffJMJxiKyOI") },
      { id: 26, title: "م2 ح06 — عاشورة الخادمة",        videoUrl: yt("lc9JPCgVpRs") },
      { id: 27, title: "م2 ح07 — ميراث ماريا",           videoUrl: yt("ofOS_m6p8mc") },
      { id: 28, title: "م2 ح08 — جيش المكاسير",          videoUrl: yt("vvQSnh7xJB0") },
      { id: 29, title: "م2 ح09 — فرصة الجنرال",          videoUrl: yt("Z5zrRP_l6Ls") },
      { id: 30, title: "م2 ح10 — الوباء",                videoUrl: yt("1OTyNdm9kF4") },
      { id: 31, title: "م2 ح11 — الكسلاء",               videoUrl: yt("ANpDikx-xc0") },
      { id: 32, title: "م2 ح12 — سلطان بدون شعب",        videoUrl: yt("wRMQyUKole4") },
      { id: 33, title: "م2 ح13",                          videoUrl: "" },
      { id: 34, title: "م2 ح14 — الألعاب الأولمبية",     videoUrl: "" },
      { id: 35, title: "م2 ح15 — ليلة الشك",             videoUrl: yt("wm06MHiuwN4") },
      { id: 36, title: "م2 ح16 — ديموقراطوس",            videoUrl: yt("iVcEf96R7WA") },
      { id: 37, title: "م2 ح17 — انتقام حمودي",          videoUrl: yt("bb-9KHWD_Bs") },
      { id: 38, title: "م2 ح18 — الأميرة الهاربة",       videoUrl: yt("kvmJNlyfyo4") },
      { id: 39, title: "م2 ح19 — المكيدة",               videoUrl: yt("Owlous7gJr4") },
      { id: 40, title: "م2 ح20 — سيف السلطان",           videoUrl: yt("Twr0tkwXpG4") },
      { id: 41, title: "م2 ح21",                          videoUrl: "" },
      { id: 42, title: "م2 ح22 — السلطان لقمان",         videoUrl: yt("RIDe3l_fJV0") },
      { id: 43, title: "م2 ح23 — يحيا السلطان",          videoUrl: yt("H3co48LCkvk") },
      { id: 44, title: "م3 ح01",  videoUrl: yt("JeatMGD3fyQ") },
      { id: 45, title: "م3 ح02",  videoUrl: yt("29gNkcYzfSc") },
      { id: 46, title: "م3 ح03",  videoUrl: yt("m1H0V_3ObJQ") },
      { id: 47, title: "م3 ح04",  videoUrl: yt("3OWlOPkw_Qg") },
      { id: 48, title: "م3 ح05",  videoUrl: yt("YxCS97PkClk") },
      { id: 49, title: "م3 ح06",  videoUrl: yt("jZ23oVfhMDk") },
      { id: 50, title: "م3 ح07",  videoUrl: yt("X1WpNK_QF8c") },
      { id: 51, title: "م3 ح08",  videoUrl: "" },
      { id: 52, title: "م3 ح09",  videoUrl: "" },
      { id: 53, title: "م3 ح10",  videoUrl: "" },
      { id: 54, title: "م3 ح11",  videoUrl: yt("pefgLOv6hys") },
      { id: 55, title: "م3 ح12",  videoUrl: yt("DBXoPa4Cxzw") },
      { id: 56, title: "م3 ح13",  videoUrl: yt("fwqrSlAWUMc") },
      { id: 57, title: "م3 ح14",  videoUrl: yt("eOGQpOb3opQ") },
      { id: 58, title: "م3 ح15",  videoUrl: "" },
      { id: 59, title: "م3 ح16",  videoUrl: yt("W8ikcgz4w00") },
      { id: 60, title: "م3 ح17",  videoUrl: yt("7SYAN1MmG40") },
      { id: 61, title: "م3 ح18",  videoUrl: yt("AEVFTCTQc7I") },
      { id: 62, title: "م3 ح19",  videoUrl: yt("6ULoYelQDvE") },
      { id: 63, title: "م3 ح20",  videoUrl: yt("MkoucXr856E") },
      { id: 64, title: "م3 ح21",  videoUrl: yt("ojvDFnG6MLo") },
      { id: 65, title: "م3 ح22",  videoUrl: yt("-VxsXJGxGDU") },
      { id: 66, title: "م3 ح23 — الأخيرة", videoUrl: yt("B8kuet_7Uo0") },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 2. Nass Mlah City
  // ─────────────────────────────────────────────────────────
  {
    id: "s-nass-mlah-city",
    title: "Nass Mlah City",
    description: "مسلسل جزائري كوميدي — 3 مواسم — إخراج جعفر قاسم — 2002",
    thumbnail: "",
    category: "كوميديا",
    year: "2003",
    rating: 0,
    playlistUrl: "https://www.youtube.com/playlist?list=PLrin8jqFiLs-PfglguSFiEiAevIqEj6CZ",
    episodes: [
      { id: 1,  title: "م1 ح01 — الإقامة",          videoUrl: yt("ayvMBSfvQOY") },
      { id: 2,  title: "م1 ح02 — الزواج بالبريد",   videoUrl: yt("q4pnpq6iNAA") },
      { id: 3,  title: "م1 ح03 — سيد الطالب",       videoUrl: yt("y-kowzYv0d8") },
      { id: 4,  title: "م1 ح04 — العرافة",           videoUrl: yt("qOd36ta0hRc") },
      { id: 5,  title: "م1 ح05",                     videoUrl: "" },
      { id: 6,  title: "م1 ح06 — الدالة",            videoUrl: yt("TaJgl14e7WE") },
      { id: 7,  title: "م1 ح07 — الشكارة",           videoUrl: yt("eNbVwkRV5IQ") },
      { id: 8,  title: "م1 ح08 — استدعاء",           videoUrl: yt("5q8ZaKk4iNc") },
      { id: 9,  title: "م1 ح09",                     videoUrl: "" },
      { id: 10, title: "م1 ح10",                     videoUrl: "" },
      { id: 11, title: "م1 ح11 — طاكسي فون",        videoUrl: yt("q_EQ9bt80fE") },
      { id: 12, title: "م1 ح12",                     videoUrl: "" },
      { id: 13, title: "م1 ح13 — مسبح حسان بيش",   videoUrl: yt("zBKE3wujZvg") },
      { id: 14, title: "م1 ح14",                     videoUrl: "" },
      { id: 15, title: "م1 ح15",                     videoUrl: "" },
      { id: 16, title: "م1 ح16 — ألف ليلة وبيونة",  videoUrl: yt("Pn1bjTPIlPY") },
      { id: 17, title: "م1 ح17",                     videoUrl: "" },
      { id: 18, title: "م1 ح18 — سندريلا",           videoUrl: yt("oz7HoNYdSYI") },
      { id: 19, title: "م1 ح19 — مطعم 5 فصول",      videoUrl: yt("u7f0Vcopm5g") },
      { id: 20, title: "م1 ح20",                     videoUrl: "" },
      { id: 21, title: "م1 ح21 — المتهم",            videoUrl: yt("-baWwRHuBis") },
      { id: 22, title: "م1 ح22",                     videoUrl: "" },
      { id: 23, title: "م1 ح23",                     videoUrl: "" },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 3. البرّاني
  // ─────────────────────────────────────────────────────────
  {
    id: "s-el-barrani",
    title: "البرّاني",
    description: "مسلسل جزائري درامي — 2024 — موسمان — قناة الشروق",
    thumbnail: "",
    category: "دراما",
    year: "2024",
    rating: 0,
    tmdbNames: ["El Barrani", "El Barani"],
    playlistUrl: "https://www.youtube.com/playlist?list=PLcYJXtxPnMY0QFT3XOGbRAKvPB1Cobvxr",
    episodes: [
      { id: 1,  title: "م1 ح01", videoUrl: yt("_AZeND5pQ7w") },
      { id: 2,  title: "م1 ح02", videoUrl: yt("Ya2qw8Cel6E") },
      { id: 3,  title: "م1 ح03", videoUrl: yt("KaxxmzlSyho") },
      { id: 4,  title: "م1 ح04", videoUrl: yt("GrsJON28mkc") },
      { id: 5,  title: "م1 ح05", videoUrl: yt("JjAMZ3csEBg") },
      { id: 6,  title: "م1 ح06", videoUrl: yt("O_q_-CPMrGM") },
      { id: 7,  title: "م1 ح07", videoUrl: yt("CrXZIRxK7VY") },
      { id: 8,  title: "م1 ح08", videoUrl: yt("BONU0uD2gWM") },
      { id: 9,  title: "م1 ح09", videoUrl: yt("kYyDb8mMEBc") },
      { id: 10, title: "م1 ح10", videoUrl: yt("-sFopHK_I0I") },
      { id: 11, title: "م1 ح11", videoUrl: yt("SemnIPdWFhQ") },
      { id: 12, title: "م1 ح12", videoUrl: "" },
      { id: 13, title: "م1 ح13", videoUrl: yt("Q5E2OQhQj7E") },
      { id: 14, title: "م1 ح14", videoUrl: yt("YQH7A-4dEGs") },
      { id: 15, title: "م1 ح15", videoUrl: "" },
      { id: 16, title: "م1 ح16", videoUrl: "" },
      { id: 17, title: "م1 ح17", videoUrl: "" },
      { id: 18, title: "م1 ح18", videoUrl: yt("XZ0TYPtG44U") },
      { id: 19, title: "م1 ح19", videoUrl: "" },
      { id: 20, title: "م1 ح20 — الأخيرة", videoUrl: yt("-ix4SjwPMYQ") },
      { id: 21, title: "م2 ح01", videoUrl: yt("4Nm7Ck8ST6I") },
      { id: 22, title: "م2 ح02", videoUrl: "" },
      { id: 23, title: "م2 ح03", videoUrl: "" },
      { id: 24, title: "م2 ح04", videoUrl: "" },
      { id: 25, title: "م2 ح05", videoUrl: "" },
      { id: 26, title: "م2 ح06", videoUrl: "" },
      { id: 27, title: "م2 ح07", videoUrl: "" },
      { id: 28, title: "م2 ح08", videoUrl: "" },
      { id: 29, title: "م2 ح09", videoUrl: "" },
      { id: 30, title: "م2 ح10", videoUrl: "" },
      { id: 31, title: "م2 ح11", videoUrl: yt("gXsEIxI-x34") },
      { id: 32, title: "م2 ح12", videoUrl: yt("pSTwB61LGEc") },
      { id: 33, title: "م2 ح13", videoUrl: "" },
      { id: 34, title: "م2 ح14", videoUrl: "" },
      { id: 35, title: "م2 ح15", videoUrl: yt("Xb6siFpzEus") },
      { id: 36, title: "م2 ح16", videoUrl: "" },
      { id: 37, title: "م2 ح17", videoUrl: yt("86deQFz6wB0") },
      { id: 38, title: "م2 ح18", videoUrl: "" },
      { id: 39, title: "م2 ح19", videoUrl: yt("Lg3DKXX5JL0") },
      { id: 40, title: "م2 ح20", videoUrl: yt("DtdTMR1Or3U") },
      { id: 41, title: "م2 ح21 — الأخيرة", videoUrl: yt("zu4XJ0tmN54") },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 4. البطحة
  // ─────────────────────────────────────────────────────────
  {
    id: "s-el-batha",
    title: "البطحة",
    description: "مسلسل جزائري كوميدي — 2023 — موسمان — قناة الشروق",
    thumbnail: "",
    category: "كوميديا",
    year: "2023",
    rating: 0,
    tmdbNames: ["El Batha", "Labatha"],
    episodes: [
      { id: 1,  title: "م1 ح01 — صراع الحومات", videoUrl: yt("krQ5xB7zER8") },
      { id: 2,  title: "م1 ح02",                 videoUrl: "" },
      { id: 3,  title: "م1 ح03",                 videoUrl: "" },
      { id: 4,  title: "م1 ح04",                 videoUrl: "" },
      { id: 5,  title: "م1 ح05",                 videoUrl: "" },
      { id: 6,  title: "م1 ح06",                 videoUrl: "" },
      { id: 7,  title: "م1 ح07",                 videoUrl: "" },
      { id: 8,  title: "م1 ح08",                 videoUrl: "" },
      { id: 9,  title: "م1 ح09",                 videoUrl: "" },
      { id: 10, title: "م1 ح10",                 videoUrl: "" },
      { id: 11, title: "م1 ح11",                 videoUrl: "" },
      { id: 12, title: "م1 ح12",                 videoUrl: "" },
      { id: 13, title: "م1 ح13",                 videoUrl: "" },
      { id: 14, title: "م1 ح14",                 videoUrl: "" },
      { id: 15, title: "م1 ح15",                 videoUrl: "" },
      { id: 16, title: "م1 ح16",                 videoUrl: "" },
      { id: 17, title: "م1 ح17",                 videoUrl: "" },
      { id: 18, title: "م1 ح18",                 videoUrl: "" },
      { id: 19, title: "م1 ح19",                 videoUrl: "" },
      { id: 20, title: "م1 ح20",                 videoUrl: "" },
      { id: 21, title: "م2 ح01",                 videoUrl: "" },
      { id: 22, title: "م2 ح02",                 videoUrl: "" },
      { id: 23, title: "م2 ح03",                 videoUrl: yt("4o_xwUbCNVs") },
      { id: 24, title: "م2 ح04",                 videoUrl: "" },
      { id: 25, title: "م2 ح05",                 videoUrl: "" },
      { id: 26, title: "م2 ح06",                 videoUrl: "" },
      { id: 27, title: "م2 ح07",                 videoUrl: "" },
      { id: 28, title: "م2 ح08",                 videoUrl: "" },
      { id: 29, title: "م2 ح09",                 videoUrl: "" },
      { id: 30, title: "م2 ح10",                 videoUrl: yt("oYL1HBvkOiA") },
      { id: 31, title: "م2 ح11",                 videoUrl: "" },
      { id: 32, title: "م2 ح12",                 videoUrl: "" },
      { id: 33, title: "م2 ح13",                 videoUrl: "" },
      { id: 34, title: "م2 ح14",                 videoUrl: "" },
      { id: 35, title: "م2 ح15",                 videoUrl: "" },
      { id: 36, title: "م2 ح16",                 videoUrl: "" },
      { id: 37, title: "م2 ح17",                 videoUrl: "" },
      { id: 38, title: "م2 ح18",                 videoUrl: "" },
      { id: 39, title: "م2 ح19",                 videoUrl: yt("5jXGRFCbfwA") },
      { id: 40, title: "م2 ح20",                 videoUrl: "" },
      { id: 41, title: "م2 ح21 — الأخيرة",      videoUrl: "" },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 5. حداش حداش
  // ─────────────────────────────────────────────────────────
  {
    id: "s-hdach-hdach",
    title: "حداش حداش",
    description: "مسلسل جزائري درامي — 2023 — قناة الشروق",
    thumbnail: "",
    category: "دراما",
    year: "2023",
    rating: 0,
    playlistUrl: "https://www.youtube.com/playlist?list=PL8p5iW92-TUPLKWhk7GReaLiXcxbGvHjz",
    episodes: [
      { id: 1,  title: "م1 ح01", videoUrl: "" },
      { id: 2,  title: "م1 ح02", videoUrl: "" },
      { id: 3,  title: "م1 ح03", videoUrl: "" },
      { id: 4,  title: "م1 ح04", videoUrl: "" },
      { id: 5,  title: "م1 ح05", videoUrl: "" },
      { id: 6,  title: "م1 ح06", videoUrl: "" },
      { id: 7,  title: "م1 ح07", videoUrl: "" },
      { id: 8,  title: "م1 ح08", videoUrl: "" },
      { id: 9,  title: "م1 ح09", videoUrl: "" },
      { id: 10, title: "م1 ح10", videoUrl: "" },
      { id: 11, title: "م1 ح11", videoUrl: "" },
      { id: 12, title: "م1 ح12", videoUrl: "" },
      { id: 13, title: "م1 ح13", videoUrl: "" },
      { id: 14, title: "م1 ح14", videoUrl: "" },
      { id: 15, title: "م1 ح15 — ياسين المتهم", videoUrl: yt("wKPB0LDzYqs") },
      { id: 16, title: "م1 ح16", videoUrl: "" },
      { id: 17, title: "م1 ح17", videoUrl: "" },
      { id: 18, title: "م1 ح18", videoUrl: "" },
      { id: 19, title: "م1 ح19", videoUrl: "" },
      { id: 20, title: "م1 ح20", videoUrl: "" },
      { id: 21, title: "م1 ح21", videoUrl: "" },
      { id: 22, title: "م1 ح22", videoUrl: "" },
      { id: 23, title: "م1 ح23", videoUrl: "" },
      { id: 24, title: "م1 ح24", videoUrl: yt("yXaiOPkA-cs") },
      { id: 25, title: "م1 ح25", videoUrl: "" },
      { id: 26, title: "م1 ح26", videoUrl: "" },
      { id: 27, title: "م1 ح27", videoUrl: "" },
      { id: 28, title: "م1 ح28", videoUrl: "" },
      { id: 29, title: "م1 ح29", videoUrl: "" },
      { id: 30, title: "م1 ح30", videoUrl: "" },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 6. دقيوس ومقيوس
  // ─────────────────────────────────────────────────────────
  {
    id: "s-dakious-makious",
    title: "دقيوس ومقيوس",
    description: "مسلسل جزائري كوميدي — 2018 — عدة مواسم",
    thumbnail: "",
    category: "كوميديا",
    year: "2018",
    rating: 0,
    playlistUrl: "https://www.youtube.com/playlist?list=PL4EC6COjNylzID8QR2uFLCiPBfdbbnWBB",
    episodes: [
      { id: 1,  title: "م1 ح01", videoUrl: yt("0A4q7002JJs") },
      { id: 2,  title: "م1 ح02", videoUrl: "" },
      { id: 3,  title: "م1 ح03", videoUrl: "" },
      { id: 4,  title: "م1 ح04", videoUrl: "" },
      { id: 5,  title: "م1 ح05", videoUrl: "" },
      { id: 6,  title: "م1 ح06", videoUrl: "" },
      { id: 7,  title: "م1 ح07", videoUrl: "" },
      { id: 8,  title: "م1 ح08", videoUrl: "" },
      { id: 9,  title: "م1 ح09", videoUrl: "" },
      { id: 10, title: "م1 ح10", videoUrl: "" },
      { id: 11, title: "م1 ح11", videoUrl: "" },
      { id: 12, title: "م1 ح12", videoUrl: "" },
      { id: 13, title: "م1 ح13", videoUrl: "" },
      { id: 14, title: "م1 ح14", videoUrl: "" },
      { id: 15, title: "م1 ح15", videoUrl: "" },
      { id: 16, title: "م1 ح16", videoUrl: "" },
      { id: 17, title: "م1 ح17", videoUrl: "" },
      { id: 18, title: "م1 ح18", videoUrl: "" },
      { id: 19, title: "م1 ح19", videoUrl: "" },
      { id: 20, title: "م1 ح20", videoUrl: "" },
      { id: 21, title: "م1 ح21", videoUrl: "" },
      { id: 22, title: "م1 ح22", videoUrl: "" },
      { id: 23, title: "م1 ح23", videoUrl: "" },
      { id: 24, title: "م1 ح24", videoUrl: "" },
      { id: 25, title: "م1 ح25", videoUrl: "" },
      { id: 26, title: "م1 ح26", videoUrl: "" },
      { id: 27, title: "م1 ح27", videoUrl: "" },
      { id: 28, title: "م1 ح28", videoUrl: "" },
      { id: 29, title: "م1 ح29", videoUrl: "" },
      { id: 30, title: "م1 ح30", videoUrl: "" },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 7. بنات المحروسة — 2025
  // ─────────────────────────────────────────────────────────
  {
    id: "s-bnat-el-mahrousa",
    title: "بنات المحروسة",
    description: "مسلسل جزائري درامي — 2025",
    thumbnail: "",
    category: "دراما",
    year: "2025",
    rating: 0,
    episodes: Array.from({length: 30}, (_, i) => ({
      id: i + 1, title: `الحلقة ${i + 1}`, videoUrl: ""
    })),
  },

  // ─────────────────────────────────────────────────────────
  // 8. L'Incendie (El Harik) — 1974
  // ─────────────────────────────────────────────────────────
  {
    id: "s-el-harik",
    title: "L'Incendie (El Harik)",
    description: "مسلسل جزائري درامي تاريخي — 1974",
    thumbnail: "",
    category: "دراما",
    year: "1974",
    rating: 0,
    episodes: Array.from({length: 15}, (_, i) => ({
      id: i + 1, title: `الحلقة ${i + 1}`, videoUrl: ""
    })),
  },

  // ─────────────────────────────────────────────────────────
  // 9. BOUDAW — 2013
  // ─────────────────────────────────────────────────────────
  {
    id: "s-boudaw",
    title: "BOUDAW",
    description: "مسلسل جزائري كوميدي — 2013",
    thumbnail: "",
    category: "كوميديا",
    year: "2013",
    rating: 0,
    episodes: Array.from({length: 30}, (_, i) => ({
      id: i + 1, title: `الحلقة ${i + 1}`, videoUrl: ""
    })),
  },

  // ─────────────────────────────────────────────────────────
  // 10. الإخوة — 2014
  // ─────────────────────────────────────────────────────────
  {
    id: "s-el-ikhwa",
    title: "الإخوة",
    description: "مسلسل جزائري درامي — 2014",
    thumbnail: "",
    category: "دراما",
    year: "2014",
    rating: 0,
    episodes: Array.from({length: 30}, (_, i) => ({
      id: i + 1, title: `الحلقة ${i + 1}`, videoUrl: ""
    })),
  },

  // ─────────────────────────────────────────────────────────
  // 11. فاطمة — 2026
  // ─────────────────────────────────────────────────────────
  {
    id: "s-fatima",
    title: "فاطمة",
    description: "مسلسل جزائري درامي — 2026",
    thumbnail: "",
    category: "دراما",
    year: "2026",
    rating: 0,
    episodes: Array.from({length: 30}, (_, i) => ({
      id: i + 1, title: `الحلقة ${i + 1}`, videoUrl: ""
    })),
  },

  // ─────────────────────────────────────────────────────────
  // 12. Da meziane — 2010
  // ─────────────────────────────────────────────────────────
  {
    id: "s-da-meziane",
    title: "Da meziane",
    description: "مسلسل جزائري كوميدي — 2010",
    thumbnail: "",
    category: "كوميديا",
    year: "2010",
    rating: 0,
    episodes: Array.from({length: 16}, (_, i) => ({
      id: i + 1, title: `الحلقة ${i + 1}`, videoUrl: ""
    })),
  },

  // ─────────────────────────────────────────────────────────
  // 13. Bled Music — 1991
  // ─────────────────────────────────────────────────────────
  {
    id: "s-bled-music",
    title: "Bled Music",
    description: "مسلسل جزائري كوميدي — 1991",
    thumbnail: "",
    category: "كوميديا",
    year: "1991",
    rating: 0,
    episodes: Array.from({length: 15}, (_, i) => ({
      id: i + 1, title: `الحلقة ${i + 1}`, videoUrl: ""
    })),
  },

  // ─────────────────────────────────────────────────────────
  // 14. Rebaa — 2025
  // ─────────────────────────────────────────────────────────
  {
    id: "s-rebaa",
    title: "Rebaa",
    description: "مسلسل جزائري درامي — 2025",
    thumbnail: "",
    category: "دراما",
    year: "2025",
    rating: 0,
    episodes: Array.from({length: 30}, (_, i) => ({
      id: i + 1, title: `الحلقة ${i + 1}`, videoUrl: ""
    })),
  },

  // ─────────────────────────────────────────────────────────
  // 15. Bila Houdoud — 1990
  // ─────────────────────────────────────────────────────────
  {
    id: "s-bila-houdoud",
    title: "Bila Houdoud",
    description: "مسلسل جزائري درامي — 1990",
    thumbnail: "",
    category: "دراما",
    year: "1990",
    rating: 0,
    episodes: Array.from({length: 15}, (_, i) => ({
      id: i + 1, title: `الحلقة ${i + 1}`, videoUrl: ""
    })),
  },

  // ─────────────────────────────────────────────────────────
  // 16. Les DZ in Dubaï — 2021
  // ─────────────────────────────────────────────────────────
  {
    id: "s-les-dz-in-dubai",
    title: "Les DZ in Dubaï",
    description: "مسلسل جزائري كوميدي — 2021",
    thumbnail: "",
    category: "كوميديا",
    year: "2021",
    rating: 0,
    episodes: Array.from({length: 30}, (_, i) => ({
      id: i + 1, title: `الحلقة ${i + 1}`, videoUrl: ""
    })),
  },

  // ─────────────────────────────────────────────────────────
  // 17. عايش بالهف — 1992
  // ─────────────────────────────────────────────────────────
  {
    id: "s-ayech-balahf",
    title: "عايش بالهف",
    description: "مسلسل جزائري درامي — 1992",
    thumbnail: "",
    category: "دراما",
    year: "1992",
    rating: 0,
    episodes: Array.from({length: 15}, (_, i) => ({
      id: i + 1, title: `الحلقة ${i + 1}`, videoUrl: ""
    })),
  },

  // ─────────────────────────────────────────────────────────
  // 18. جروح الحياة — 2009
  // ─────────────────────────────────────────────────────────
  {
    id: "s-jouhouh-el-hayat",
    title: "جروح الحياة",
    description: "مسلسل جزائري درامي — 2009",
    thumbnail: "",
    category: "دراما",
    year: "2009",
    rating: 0,
    episodes: Array.from({length: 30}, (_, i) => ({
      id: i + 1, title: `الحلقة ${i + 1}`, videoUrl: ""
    })),
  },

];

export const TOTAL_EPISODES = ALGERIAN_SERIES.reduce((s, r) => s + r.episodes.length, 0);
export const FOUND_LINKS = ALGERIAN_SERIES.reduce(
  (s, r) => s + r.episodes.filter(e => e.videoUrl).length, 0
);
