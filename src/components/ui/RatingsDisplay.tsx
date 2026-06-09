import React from "react";

interface Rating {
  source: string;
  value: string;
  logo: React.ReactNode;
}

interface Props {
  tmdbRating?: number;
  tmdbVoteCount?: number;
  imdbRating?: string;
  rottenTomatoes?: string;
  metacritic?: string;
}

const TMDbLogo = () => (
  <img 
    src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg" 
    alt="TMDB" 
    className="w-10 h-10"
  />
);

const IMDbLogo = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-7" fill="#f5c518">
    <path d="M16.35 16.53h2.31v-9.06h-2.31zm.96-8.28c.37 0 .66.29.66.66v6.27c0 .38-.29.66-.66.66-.37 0-.66-.28-.66-.66V8.91c0-.37.29-.66.66-.66zm-3.63 8.28h2.04l-.54-2.13h2.37l-.54 2.13h2.04l1.59-6.09h-2.07l-.78 3.3h-2.4l-.75-3.3h-2.04l1.08 6.09zM5.73 16.53h2.31v-6.12h.93l1.35 6.12h2.37l-1.5-6.09c.99-.39 1.65-1.26 1.65-2.43 0-1.41-1.14-2.55-2.55-2.55h-4.56v11.07zm3.72-7.59h-1.41V8.22h1.41c.69 0 1.23.54 1.23 1.23s-.54 1.23-1.23 1.23z"/>
  </svg>
);

const RottenTomatoesLogo = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8">
    <circle cx="12" cy="14" r="9" fill="#fa320a" />
    <path d="M8 14c0 2 2 4 4 4s4-2 4-4" stroke="#000" strokeWidth="1.5" fill="none" />
    <circle cx="9" cy="12" r="1" fill="#fff" />
    <circle cx="15" cy="12" r="1" fill="#fff" />
    <path d="M9 6 L12 4 L15 6" stroke="#65a30d" strokeWidth="2" fill="none" />
  </svg>
);

const MetacriticLogo = () => (
  <div className="w-10 h-8 bg-green-400 flex items-center justify-center rounded">
    <span className="text-black font-bold text-xs">MC</span>
  </div>
);

export const RatingsDisplay: React.FC<Props> = ({
  tmdbRating,
  tmdbVoteCount,
  imdbRating,
  rottenTomatoes,
  metacritic,
}) => {
  const ratings: Rating[] = [];

  if (tmdbRating) {
    ratings.push({
      source: "TMDB",
      value: `${tmdbRating.toFixed(1)}/10`,
      logo: <TMDbLogo />,
    });
  }

  if (imdbRating) {
    ratings.push({
      source: "IMDb",
      value: imdbRating,
      logo: <IMDbLogo />,
    });
  }

  if (rottenTomatoes) {
    ratings.push({
      source: "Rotten Tomatoes",
      value: rottenTomatoes,
      logo: <RottenTomatoesLogo />,
    });
  }

  if (metacritic) {
    ratings.push({
      source: "Metacritic",
      value: metacritic,
      logo: <MetacriticLogo />,
    });
  }

  if (ratings.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-5 items-center py-3">
      {ratings.map((rating, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-0 py-0"
        >
          {rating.logo}
          <span className="text-lg font-bold text-white">{rating.value}</span>
        </div>
      ))}
      {tmdbVoteCount && (
        <span className="text-xs text-white/50">({tmdbVoteCount} votes)</span>
      )}
    </div>
  );
};
