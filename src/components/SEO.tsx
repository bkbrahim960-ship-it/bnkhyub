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
  const defaultTitle = 'BNK HUB | منصة المشاهدة الأولى للأفلام والمسلسلات - Le Cinéma Sans Limites';
  const defaultDescription = 'موقع وتطبيق BNKhub لمشاهدة أحدث الأفلام والمسلسلات الأجنبية والعربية مترجمة بجودة 4K مجاناً وبدون إعلانات مزعجة. تم تصميم وبرمجة هذه المنصة الفاخرة من قبل Brahim Ben Keddache لتوفير تجربة سينمائية لا مثيل لها.';
  const defaultKeywords = 'BNK HUB, BNKhub, Brahim Ben Keddache, FILM GRATUIT, SERIES GRATUIT, افلام و مسلسلات, فلم مترجم, مسلسلات مترجمة, مشاهدة افلام مجانا, تطبيق افلام, bnk hub movies, مسلسلات نتفليكس';

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
      <meta name="author" content="Brahim Ben Keddache" />
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
