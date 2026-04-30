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
  image = '/og-image.jpg',
  url = 'https://bnkhub.com',
  type = 'website'
}: SEOProps) => {
  const defaultTitle = 'BNK HUB | BNKhub - افلام و مسلسلات مترجمة مجانا | FILM GRATUIT SERIES GRATUIT';
  const defaultDescription = 'موقع BNKhub الأول لمشاهدة أحدث الأفلام والمسلسلات مترجمة بجودة عالية مجانا. BNK HUB Film Gratuit, Series Gratuit, أفلام و مسلسلات حصرية.';
  const defaultKeywords = 'BNK HUB, BNKhub, BNKHUB, FILM GRATUIT, SERIES GRATUIT, افلام و مسلسلات, فلم مترجم, مسلسلات مترجمة, مشاهدة افلام مجانا, موقع افلام, bnk hub movies';

  const siteTitle = title ? `${title} | BNK HUB` : defaultTitle;
  const siteDescription = description || defaultDescription;
  const siteKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="language" content="ar, fr, en" />
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
      
      {/* Canonical URL for SEO */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};
