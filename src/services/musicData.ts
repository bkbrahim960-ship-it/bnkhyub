export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  thumbnail: string;
  audioUrl: string;
  duration?: number;
  category?: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'm-01',
    title: 'A Vava Inouva',
    artist: 'Idir',
    thumbnail: 'https://i.ytimg.com/vi/pZkCgR-cmCs/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=pZkCgR-cmCs',
    category: 'Kabyle',
  },
  {
    id: 'm-02',
    title: 'Taqbaylit',
    artist: 'Idir',
    thumbnail: 'https://i.ytimg.com/vi/-GEG6RHHBh4/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=-GEG6RHHBh4',
    category: 'Kabyle',
  },
  {
    id: 'm-03',
    title: 'Cravat',
    artist: 'Matoub Lounès',
    thumbnail: 'https://i.ytimg.com/vi/y1uYmK5-cCg/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=y1uYmK5-cCg',
    category: 'Kabyle',
  },
  {
    id: 'm-04',
    title: 'Kenza',
    artist: 'Matoub Lounès',
    thumbnail: 'https://i.ytimg.com/vi/PSqA0TY6bCg/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=PSqA0TY6bCg',
    category: 'Kabyle',
  },
  {
    id: 'm-05',
    title: 'A Yemma',
    artist: 'Aït Menguellet',
    thumbnail: 'https://i.ytimg.com/vi/5x3b3eLyTls/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=5x3b3eLyTls',
    category: 'Kabyle',
  },
  {
    id: 'm-06',
    title: 'Aden',
    artist: 'Aït Menguellet',
    thumbnail: 'https://i.ytimg.com/vi/If7a2ThZv3Y/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=If7a2ThZv3Y',
    category: 'Kabyle',
  },
  {
    id: 'm-07',
    title: 'Tamurt-iw',
    artist: 'Lounis Aït Menguellet',
    thumbnail: 'https://i.ytimg.com/vi/_w5nPlcMytk/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=_w5nPlcMytk',
    category: 'Kabyle',
  },
  {
    id: 'm-08',
    title: 'Yemma',
    artist: 'Takfarinas',
    thumbnail: 'https://i.ytimg.com/vi/hc1bq1b2dFY/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=hc1bq1b2dFY',
    category: 'Kabyle',
  },
  {
    id: 'm-09',
    title: 'Zaâma Zaâma',
    artist: 'Djamel Laroussi',
    thumbnail: 'https://i.ytimg.com/vi/oHGkW-5FnLE/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=oHGkW-5FnLE',
    category: 'Kabyle',
  },
  {
    id: 'm-10',
    title: 'A Yemma',
    artist: 'Slimane Azem',
    thumbnail: 'https://i.ytimg.com/vi/5PBddxflPtU/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=5PBddxflPtU',
    category: 'Kabyle',
  },
  {
    id: 'm-11',
    title: 'Estaca',
    artist: 'Slimane Azem',
    thumbnail: 'https://i.ytimg.com/vi/htZz7eYhMqI/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=htZz7eYhMqI',
    category: 'Kabyle',
  },
  {
    id: 'm-12',
    title: 'Tafsut',
    artist: 'Idir',
    thumbnail: 'https://i.ytimg.com/vi/70WRPEvSIRc/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=70WRPEvSIRc',
    category: 'Kabyle',
  },
  {
    id: 'm-13',
    title: 'Azawan',
    artist: 'Amazigh Kateb',
    thumbnail: 'https://i.ytimg.com/vi/m5Tct_qkH1I/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=m5Tct_qkH1I',
    category: 'Kabyle',
  },
  {
    id: 'm-14',
    title: 'Thassadart',
    artist: 'Massinissa',
    thumbnail: 'https://i.ytimg.com/vi/n1OcfAe4-o8/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=n1OcfAe4-o8',
    category: 'Kabyle',
  },
  {
    id: 'm-15',
    title: 'Tamurt',
    artist: 'Oulahlou',
    thumbnail: 'https://i.ytimg.com/vi/8L5ta7EBPLQ/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=8L5ta7EBPLQ',
    category: 'Kabyle',
  },
  {
    id: 'm-16',
    title: 'Tantazart',
    artist: 'Thamu',
    thumbnail: 'https://i.ytimg.com/vi/o2YAB6Bp0x0/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=o2YAB6Bp0x0',
    category: 'Kabyle',
  },
  {
    id: 'm-17',
    title: 'Achrif',
    artist: 'Taos Amrouche',
    thumbnail: 'https://i.ytimg.com/vi/IMQ3kM8Z5VA/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=IMQ3kM8Z5VA',
    category: 'Kabyle',
  },
  {
    id: 'm-18',
    title: 'Thamghart',
    artist: 'Cheikh Sadi',
    thumbnail: 'https://i.ytimg.com/vi/ZUCSXGNUGqI/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=ZUCSXGNUGqI',
    category: 'Kabyle',
  },
];
