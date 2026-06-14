import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

const SITE_NAME = "StudentHub by GenSync";
const DEFAULT_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/ORdKdiguusSK8AVHp9ZHZdlKoHf2/social-images/social-1772950688034-Screenshot_2026-03-08_114755.webp";
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

const SEO = ({
  title,
  description = "StudentHub by GenSync is the #1 campus collaboration platform for students. Share notes, find internships, join projects, chat with peers, and attend events. Free for all college students.",
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  twitterTitle,
  twitterDescription,
  twitterImage,
  jsonLd,
  noindex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Student Sharing & Campus Collaboration Platform`;
  const resolvedCanonical = canonical ? `${BASE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      {resolvedCanonical && <meta property="og:url" content={resolvedCanonical} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitle || ogTitle || fullTitle} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
      <meta name="twitter:image" content={twitterImage || ogImage} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
