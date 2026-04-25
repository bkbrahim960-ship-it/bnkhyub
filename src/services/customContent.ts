
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
  {
    id: 'm-hmimi-lyes',
    title: 'Ḥmimi d Lyes',
    overview: 'Ḥmimi d Lyes, d asaru n unecreḥ, yettales-d yiwet n tmacahut yellan deg zman anda llan idinuẓuṛen !',
    poster_path: 'https://abdessah15.github.io/Asekles/hmimi.jpg',
    category: 'Uskan • Tasawant',
    release_date: '2025',
    vote_average: 5.0,
    isDubbed: true,
    video_url: 'https://odysee.com/$/embed/@asekles:d/Hmimi-d-lyes:e',
    media_type: "movie",
    keywords: ["kabyle", "pucci", "doublage", "hmimi", "lyes"]
  },
  {
    id: 'm-amechah-new',
    title: 'Amecḥaḥ',
    overview: 'D asaru n uḍsa n teqbaylit yettmeslayen ɣef yiwen n umechaḥ i iḥemmlen idrimen aṭas.',
    poster_path: 'https://i.ytimg.com/vi/xJTRs4u-FgU/hq720.jpg',
    category: 'Uḍsa • Akalas',
    release_date: '2010',
    vote_average: 4.8,
    isDubbed: false,
    video_url: 'https://www.youtube.com/watch?v=xJTRs4u-FgU',
    media_type: "movie",
    keywords: ["kabyle", "pucci", "doublage", "amechah"]
  },
  {
    id: 'm-ikerri-izimer',
    title: 'Ikerri izimer',
    overview: 'Asaru n uḍsa d unecreḥ i dderyet (Yettwasuḍ s teqbaylit).',
    poster_path: 'https://abdessah15.github.io/Asekles/ikerri.jpg',
    category: 'Uḍsa • Uskan',
    release_date: '2024',
    vote_average: 4.8,
    isDubbed: true,
    video_url: 'https://odysee.com/$/embed/@asekles:d/Ixerri-izimer:1',
    media_type: "movie",
    keywords: ["kabyle", "pucci", "doublage", "ikerri", "izimer"]
  },
  {
    id: 'm-at-dawuzru',
    title: 'At Dawuzru',
    overview: 'D afilm n tmaziɣt i d-yettmeslayen ɣef tudert d imeṭṭawen n leqbayel.',
    poster_path: 'https://github.com/amazighkab/cinema-kabyle/blob/master/img/atdawuzru.jpg?raw=true',
    category: 'Amazruy • Tasawant',
    release_date: '2015',
    vote_average: 4.6,
    isDubbed: false,
    video_url: 'https://vk.com/video_ext.php?oid=267205663&id=169867258&hash=c9c250a4dfcef4f9&hd=2',
    media_type: "movie",
    keywords: ["kabyle", "pucci", "doublage", "at dawuzru"]
  },
  {
    id: 'm-bebelilly',
    title: 'Bebe Lili',
    overview: 'Afilm n uḍsa i d-yessefkayen tasekla n teqbaylit.',
    poster_path: 'https://th.bing.com/th/id/OIP.54aLHygZ_XsYmkiRRv2c7gAAAA?w=115&h=180&c=7&r=0&o=7&pid=1.7&rm=3',
    category: 'Uḍsa • Akalas',
    release_date: '2012',
    vote_average: 4.4,
    isDubbed: false,
    video_url: 'https://vk.com/video_ext.php?oid=267205663&id=169821305&hash=ae3eb8506578e6cb&hd=3',
    media_type: "movie",
    keywords: ["kabyle", "pucci", "doublage", "bebe lili"]
  },
  {
    id: 'm-iqjanimcac',
    title: 'Iqjan Imcac',
    overview: 'Afilm n teqbaylit i d-yettawin ɣef tmetti d taddart.',
    poster_path: 'https://github.com/amazighkab/cinema-kabyle/blob/master/img/iqjanimcac.jpg?raw=true',
    category: 'Imetti • Tasawant',
    release_date: '2014',
    vote_average: 4.3,
    isDubbed: false,
    video_url: 'https://vk.com/video_ext.php?oid=267205663&id=169798608&hash=688c354f4d01f753&hd=1',
    media_type: "movie",
    keywords: ["kabyle", "pucci", "doublage", "iqjan imcac"]
  },
  {
    id: 'm-vriroch',
    title: 'Vriroch',
    overview: 'Tamacahut n tmeṭṭut d tettebwiḍ n wussan n leqbayel.',
    poster_path: 'https://github.com/amazighkab/cinema-kabyle/blob/master/img/vriroch.jpg?raw=true',
    category: 'Amazruy • Tasawant',
    release_date: '2011',
    vote_average: 4.2,
    isDubbed: false,
    video_url: 'https://vk.com/video_ext.php?oid=267205663&id=169797301&hash=7cf1f92039f951fc&hd=1',
    media_type: "movie",
    keywords: ["kabyle", "pucci", "doublage", "vriroch"]
  },
  {
    id: 'm-alidwali',
    title: 'Ali d Wali',
    overview: 'Afilm n uḍsa d tamedyazt n teqbaylit.',
    poster_path: 'https://github.com/amazighkab/cinema-kabyle/blob/master/img/alidwali.jpg?raw=true',
    category: 'Uḍsa • Akalas',
    release_date: '2009',
    vote_average: 4.5,
    isDubbed: false,
    video_url: 'https://luluvid.com/ftbi9zs1g70i',
    media_type: "movie",
    keywords: ["kabyle", "pucci", "doublage", "ali", "wali"]
  },
  {
    id: 'm-iferfucen',
    title: 'Iferfucen',
    overview: 'Asaru n uḍsa i d-yettwanefk ɣef yimeṭṭawen n leqbayel.',
    poster_path: 'https://github.com/amazighkab/cinema-kabyle/blob/master/img/iferfucen.jpg?raw=true',
    category: 'Uḍsa • Akalas',
    release_date: '2013',
    vote_average: 4.3,
    isDubbed: false,
    video_url: 'https://vk.com/video_ext.php?oid=267205663&id=169791511&hash=449213e4d507224e&hd=1',
    media_type: "movie",
    keywords: ["kabyle", "pucci", "doublage", "iferfucen"]
  },
  {
    id: 'm-skarfez',
    title: 'Skarfez',
    overview: 'Afilm n tmaziɣt i d-yettmeslayen ɣef tazmert d tefsut n teqbaylit.',
    poster_path: 'https://github.com/amazighkab/cinema-kabyle/blob/master/img/skarfez.jpg?raw=true',
    category: 'Amazruy • Tasawant',
    release_date: '2016',
    vote_average: 4.4,
    isDubbed: false,
    video_url: 'https://vk.com/video_ext.php?oid=267205663&id=169786324&hash=804f4a5c7470ea93&hd=1',
    media_type: "movie",
    keywords: ["kabyle", "pucci", "doublage", "skarfez"]
  },
  {
    id: 's-imuhuchen',
    title: 'IMUḤUCEN',
    overview: 'Reda, Ɛisa, Ɛliluc, Ḥmimuc d imuḥucen, d iɛlaḍ. Yal tikkelt ara binen sewjaden taxnanast iwakken ad rewlen seg lḥebs.',
    poster_path: 'https://abdessah15.github.io/Asekles/imuhuchen.jpg',
    category: 'Uḍsa • Uskan n warrac',
    release_date: '2025',
    vote_average: 4.9,
    media_type: "tv",
    keywords: ["kabyle", "pucci", "doublage", "imuhuchen"],
    episodes: [
      { id: 1, title: 'Tasedmirt 01: Yewhec lfil yernad gma-s', videoUrl: 'https://odysee.com/$/embed/@asekles:d/EP1--Yewhec-lfil-yernad-gma-s:6' },
      { id: 2, title: 'Tasedmirt 02: Tamuffirt', videoUrl: 'https://odysee.com/$/embed/@asekles:d/EP2--Tamuffirt:d' },
      { id: 3, title: 'Tasedmirt 03: Ilat anect ilat', videoUrl: 'https://odysee.com/$/embed/@asekles:d/EP3--Ilat-anect-ilat:a' },
      { id: 4, title: 'Tasedmirt 04: Nuli s aggur', videoUrl: 'https://odysee.com/$/embed/@asekles:d/EP4--Nuli-s-aggur:3' },
      { id: 5, title: 'Tasedmirt 05: Timesrifegt', videoUrl: 'https://odysee.com/$/embed/@asekles:d/EP5--Timesrifegt:7' },
      { id: 6, title: 'Tasedmirt 06: Taxnanast n wekbal', videoUrl: 'https://odysee.com/$/embed/@asekles:d/EP6--Taxnanast-n-wekbal:0' },
      { id: 7, title: 'Tasedmirt 07: Belqasem n 3li ca3ban', videoUrl: 'https://odysee.com/$/embed/@kabdessah:f/EP7--Belqasem-n-3li-ca3ban-(-lmahfud-):9' },
      { id: 8, title: 'Tasedmirt 08: Nura', videoUrl: 'https://odysee.com/$/embed/@kabdessah:f/EP8--Nura:9' }
    ]
  },
  {
    id: 's-da-meziane',
    title: 'Da Meziane',
    overview: 'Imuzrar n ddarama d uḍsa i d-yettmeslayen ɣef tudert n yal ass deg taddart.',
    poster_path: 'https://tse4.mm.bing.net/th/id/OIP.Xt37oNcdPKUiXAVRc0mhRAAAAA?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3',
    category: 'Uḍsa • Imetti',
    release_date: '2011',
    vote_average: 4.9,
    media_type: "tv",
    keywords: ["kabyle", "pucci", "doublage", "da meziane"],
    episodes: [
      { id: 1, title: 'Tasedmirt 01', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6hz' },
      { id: 2, title: 'Tasedmirt 02', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6i4' },
      { id: 3, title: 'Tasedmirt 03', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6i5' },
      { id: 4, title: 'Tasedmirt 04', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6i8' },
      { id: 5, title: 'Tasedmirt 05', videoUrl: 'https://geo.dailymotion.com/player.html?video=xkn6ir' }
    ]
  },
  {
    id: 's-wa3li-tzizwit',
    title: 'Waɛli ak tzizwit',
    overview: 'Yiwen n wegaz isemis Waɛli yettnadi ɣef uxeddim, Ddant-d tmucuha n tmeḥqranit mi yettɛerriḍ ad iḥareb ɣef wexxam.',
    poster_path: 'https://abdessah15.github.io/Asekles/Sans%20titre4.jpg',
    category: 'Uḍsa • Tazwuɣa',
    release_date: '2023',
    vote_average: 4.8,
    media_type: "tv",
    keywords: ["kabyle", "pucci", "doublage", "wa3li", "tzizwit"],
    episodes: [
      { id: 1, title: 'Tasedmirt 01', videoUrl: 'https://odysee.com/$/embed/@asekles:d/wa3li-ak-tzizwit-EP-(1):f' },
      { id: 2, title: 'Tasedmirt 02', videoUrl: 'https://odysee.com/$/embed/@asekles:d/wa3li-ak-tzizwit-EP-(2):2' },
      { id: 3, title: 'Tasedmirt 03', videoUrl: 'https://odysee.com/$/embed/@asekles:d/wa3li-ak-tzizwit-EP-(3):e' }
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
