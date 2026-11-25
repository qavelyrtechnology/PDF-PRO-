import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { SITE_URL } from '../config/brand';

interface PageSeoProps {
  pageKey: string;
  jsonLd?: Record<string, unknown>;
}

export const PageSeo: React.FC<PageSeoProps> = ({ pageKey, jsonLd }) => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const seoEntry = t.seo.pages[pageKey] || {
    title: t.appName,
    description: t.appDescription,
  };

  const normalizedPath = location.pathname === '/' ? '/' : location.pathname.replace(/\/+$/, '');
  const canonicalUrl = `${SITE_URL}${normalizedPath}`;
  const ogLocale = language === 'ar' ? 'ar_SA' : 'en_US';

  return (
    <>
      <title>{seoEntry.title}</title>
      <meta name="description" content={seoEntry.description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={seoEntry.title} />
      <meta property="og:description" content={seoEntry.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:site_name" content="Free PDF Studio" />
      <meta name="twitter:title" content={seoEntry.title} />
      <meta name="twitter:description" content={seoEntry.description} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </>
  );
};
