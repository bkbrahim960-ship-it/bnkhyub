export interface CustomMediaItem {
  id: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path?: string;
  category: string;
  release_date: string;
  vote_average: number;
  isDubbed?: boolean;
  video_url?: string; // Pour les films
  media_type: "movie" | "tv";
  keywords: string[];
  episodes?: { id: number; title: string; videoUrl: string }[]; // Pour les séries
}

export const KABYLE_CONTENT: CustomMediaItem[] = [
  // MOVIES
  {
    id: 'm-amechah-new',
    title: 'Amecḥaḥ',
    overview: 'D asaru n uḍsa n teqbaylit yettmeslayen ɣef yiwen n umechaḥ i iḥemmlen idrimen aṭas. D yiwen n wudem i d-yessufuɣen tikliwin n uḍsa n "Amecḥaḥ" (The Miser).',
    poster_path: 'https://i.ytimg.com/vi/xJTRs4u-FgU/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLDa8mptZXG8ahUgbL5e9j17LxfJGA',
    category: 'Comédie • Classique',
    release_date: '2010',
    vote_average: 4.8,
    isDubbed: false,
    video_url: 'https://www.youtube.com/watch?v=xJTRs4u-FgU&t=762s',
    media_type: 'movie',
    keywords: ['kabyle', 'film', 'amechah', 'comedie']
  },
  {
    id: 'm-ikerri-izimer',
    title: 'Ikerri izimer',
    overview: 'Deg tmeddit n Yennayer, lferḥ n wakraren yettuɣal d aɛewwiq. D asaru n uḍsa d unecreḥ i dderyet (Shaun the Sheep).',
    poster_path: 'https://abdessah15.github.io/Asekles/ikerri.jpg',
    category: 'Comédie • Animation',
    release_date: '2024',
    vote_average: 4.8,
    isDubbed: true,
    video_url: 'https://odysee.com/$/embed/@asekles:d/Ixerri-izimer:1?autoplay=true',
    media_type: 'movie',
    keywords: ['kabyle', 'animation', 'ikerri', 'izimer', 'doublage']
  },
  {
    id: 'm-amghar-aneghrum',
    title: 'Amɣar aneɣrum',
    overview: 'D asaru wezzil ɣef yiwen n uneɣrum , ifuk-as kullec di tneɣrumt-is , dɣa yusa-as-d rbeḥ ur yebni fell-as.',
    poster_path: 'https://abdessah15.github.io/Asekles/photo.jpg',
    category: 'Animation • Short-Film',
    release_date: '2024',
    vote_average: 4.9,
    isDubbed: false,
    video_url: 'https://odysee.com/$/embed/@kabdessah:f/amghar-aneghrum:a?r=6iYSaBuiEF9uLCHrRX8LasgA4Mirpv88&autoplay=true',
    media_type: 'movie',
    keywords: ['kabyle', 'animation', 'amghar', 'aneghrum']
  },
  {
    id: 'm-hmimi-d-lyes',
    title: 'Ḥmimi d Lyes',
    overview: 'Ḥmimi d Lyes, d asaru n unecreḥ, yettales-d yiwet n tmacahut yellan deg zman anda llan idinuẓuṛen !',
    poster_path: 'https://abdessah15.github.io/Asekles/hmimi.jpg',
    category: 'Animation • Aventure',
    release_date: '2025',
    vote_average: 5.0,
    isDubbed: true,
    video_url: 'https://odysee.com/$/embed/@asekles:d/Hmimi-d-lyes:e?r=6iYSaBuiEF9uLCHrRX8LasgA4Mirpv88&autoplay=true',
    media_type: 'movie',
    keywords: ['kabyle', 'animation', 'hmimi', 'lyes', 'doublage']
  },
  {
    id: 'm-uccen-d-wayziw',
    title: 'Uccen d Wayziw',
    overview: 'Tamast n wuccen d tabaquzt. Yiwen n usaru i d-yettawin ɣef tkerkas d wayen i d-sseglayent.',
    poster_path: 'https://i.ytimg.com/vi/6f-rK0N9-rU/hqdefault.jpg',
    category: 'Animation • Conte',
    release_date: '2023',
    vote_average: 4.5,
    isDubbed: false,
    video_url: 'https://www.youtube.com/watch?v=6f-rK0N9-rU',
    media_type: 'movie',
    keywords: ['kabyle', 'conte', 'uccen', 'wayziw']
  },
  {
    id: 'm-tiziri-n-tefsut',
    title: 'Tiziri n Tefsut',
    overview: 'Asaru ddarama i d-yettmeslayen ɣef yiwet n tullas i d-yegran weḥd-as deg taddart.',
    poster_path: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    category: 'Drame • Social',
    release_date: '2022',
    vote_average: 4.7,
    isDubbed: false,
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    media_type: 'movie',
    keywords: ['kabyle', 'drame', 'tiziri', 'tefsut']
  },

  // SERIES
  {
    id: 's-da-meziane',
    title: 'Da meziane',
    overview: 'Da Meziane d amazrar n uḍsa i d-yessenṭaqen tamentilt n tudert n yal ass n leqbayel.',
    poster_path: 'https://tse3.mm.bing.net/th/id/OIP.elpAeRJmL2xQKAf4GM3YaQHaLH?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3',
    category: 'Comédie • Social',
    release_date: '2010',
    vote_average: 4.9,
    isDubbed: false,
    media_type: 'tv',
    keywords: ['kabyle', 'serie', 'da meziane', 'comedie'],
    episodes: [
      { id: 1, title: 'Tasedmirt 01', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6hz' },
      { id: 2, title: 'Tasedmirt 02', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6i4' },
      { id: 3, title: 'Tasedmirt 03', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6i5' },
      { id: 4, title: 'Tasedmirt 04', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6i8' },
      { id: 5, title: 'Tasedmirt 05', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6ia' },
      { id: 6, title: 'Tasedmirt 06', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6if' },
      { id: 7, title: 'Tasedmirt 07', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6ii' },
      { id: 8, title: 'Tasedmirt 08', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6il' },
      { id: 9, title: 'Tasedmirt 09', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6io' },
      { id: 10, title: 'Tasedmirt 10', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6iq' }
    ]
  },
  {
    id: 's-maca-micka',
    title: 'Maca ak d Micka',
    overview: 'Yiwet n teqrurt isemman Maca yettidiren ak d wersel iwumi semman Micka (Masha and the Bear).',
    poster_path: 'https://abdessah15.github.io/Asekles/Sans%20titre6.jpg',
    category: 'Comédie • Animation',
    release_date: '2024',
    vote_average: 4.9,
    isDubbed: true,
    media_type: 'tv',
    keywords: ['kabyle', 'animation', 'maca', 'micka', 'doublage'],
    episodes: [
      { id: 1, title: 'Tasedmirt 01', videoUrl: 'https://odysee.com/$/embed/@asekles:d/maca-ak-d-micka-EP-(1):a?autoplay=true' },
      { id: 2, title: 'Tasedmirt 02', videoUrl: 'https://odysee.com/$/embed/@asekles:d/maca-ak-d-micka-EP-(2):9?autoplay=true' },
      { id: 3, title: 'Tasedmirt 03', videoUrl: 'https://odysee.com/$/embed/@asekles:d/maca-ak-d-micka-EP-(3):d?autoplay=true' },
      { id: 4, title: 'Tasedmirt 04', videoUrl: 'https://odysee.com/$/embed/@asekles:d/maca-ak-d-micka-EP-(4):5?autoplay=true' },
      { id: 5, title: 'Tasedmirt 05', videoUrl: 'https://odysee.com/$/embed/@asekles:d/maca-ak-d-micka-EP-(5):1?autoplay=true' },
      { id: 6, title: 'Tasedmirt 06', videoUrl: 'https://odysee.com/$/embed/@asekles:d/maca-ak-d-micka-EP-(6):c?autoplay=true' },
      { id: 7, title: 'Tasedmirt 07', videoUrl: 'https://odysee.com/$/embed/@asekles:d/maca-ak-d-micka-EP-(7):b?autoplay=true' },
      { id: 8, title: 'Tasedmirt 08', videoUrl: 'https://odysee.com/$/embed/@asekles:d/maca-ak-d-micka-EP-(8):f?autoplay=true' }
    ]
  },
  {
    id: 's-tom-jerry-ny',
    title: 'Tom et Jerry à New York',
    overview: 'Tom et Jerry se retrouvent à New York où their eternal rivalry continues (Dubbed in Kabyle).',
    poster_path: 'https://abdessah15.github.io/Asekles/Sans%20titre11.jpg',
    category: 'Comédie • Animation',
    release_date: '2024',
    vote_average: 4.9,
    isDubbed: true,
    media_type: 'tv',
    keywords: ['kabyle', 'animation', 'tom', 'jerry', 'doublage'],
    episodes: [
      { id: 1, title: 'Tasedmirt 01', videoUrl: 'https://odysee.com/$/embed/@asekles:d/ep1:9c?autoplay=true' },
      { id: 2, title: 'Tasedmirt 02', videoUrl: 'https://odysee.com/$/embed/@asekles:d/ep2:12a?autoplay=true' },
      { id: 3, title: 'Tasedmirt 03', videoUrl: 'https://odysee.com/$/embed/@asekles:d/ep3:1b?autoplay=true' },
      { id: 4, title: 'Tasedmirt 04', videoUrl: 'https://odysee.com/$/embed/@asekles:d/ep4:2a?autoplay=true' },
      { id: 5, title: 'Tasedmirt 05', videoUrl: 'https://odysee.com/$/embed/@asekles:d/ep5:3c?autoplay=true' }
    ]
  }
];

export const searchCustomContent = (query: string): CustomMediaItem[] => {
  const q = query.toLowerCase();
  return KABYLE_CONTENT.filter(item => 
    item.title.toLowerCase().includes(q) || 
    item.keywords.some(k => k.includes(q))
  );
};
