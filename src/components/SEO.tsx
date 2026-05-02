import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({
  title,
  description,
  keywords,
  image = '/icon.png',
  url = 'https://bnk-huub.vercel.app',
  type = 'website'
}: SEOProps) => {
  const defaultTitle = 'BNKhub — Le Cinéma du Monde, Sans Limites';
  const defaultDescription = 'La première plateforme BNKhub pour regarder les derniers films et séries en 4K gratuitement et sans publicités intrusives. Conçue et développée par Brahim Ben Keddache.';
  const defaultKeywords = 'BNK HUB, BNKhub, Brahim Ben Keddache, FILM GRATUIT, SERIES GRATUIT, films streaming, series streaming, regarder films, netflix gratuit, cinema';

  const siteTitle = title ? `${title} | BNK HUB` : defaultTitle;
  const siteDescription = description || defaultDescription;
  const siteKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  return (
    <Helmet>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="author" content="Brahim Ben Keddache" />
      <meta name="language" content="fr, en" />
      <meta name="robots" content="index, follow" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="BNK HUB" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={siteDescription} />
      <meta property="twitter:image" content={image} />
      
      {/* PWA / Mobile Tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="BNK HUB" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#D4A843" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="apple-touch-fullscreen" content="yes" />

      {/* Canonical URL for SEO */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};
