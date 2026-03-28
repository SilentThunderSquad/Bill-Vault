import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  canonical?: string;
  noindex?: boolean;
  schema?: any;
}

const DEFAULT_SEO: Required<Omit<SEOProps, 'schema'>> = {
  title: 'Bill Vault - Free Warranty Tracker & Bill Scanner App',
  description: 'Free warranty tracker & digital receipt storage app with OCR scanning. Track product warranties, scan bills automatically, get expiry alerts. Cloud-based bill management for all your receipts. Never miss a warranty claim!',
  keywords: 'warranty tracker app, free warranty tracker, bill scanner app, digital receipt storage, OCR bill scanner, warranty management app, receipt organizer, invoice manager, warranty expiry alert, product warranty tracker, bill vault',
  image: 'https://billvault.silentthundersquad.in/og-image.png',
  url: 'https://billvault.silentthundersquad.in',
  type: 'website',
  canonical: 'https://billvault.silentthundersquad.in',
  noindex: false
};

export function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  canonical,
  noindex = false,
  schema
}: SEOProps) {
  const seoTitle = title ? `${title} | Bill Vault` : DEFAULT_SEO.title;
  const seoDescription = description || DEFAULT_SEO.description;
  const seoKeywords = keywords || DEFAULT_SEO.keywords;
  const seoImage = image || DEFAULT_SEO.image;
  const seoUrl = url || DEFAULT_SEO.url;
  const seoCanonical = canonical || seoUrl;

  useEffect(() => {
    // Update document title
    document.title = seoTitle;

    // Update meta tags
    updateMetaTag('description', seoDescription);
    updateMetaTag('keywords', seoKeywords);
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Update Open Graph tags
    updateMetaTag('og:title', seoTitle, 'property');
    updateMetaTag('og:description', seoDescription, 'property');
    updateMetaTag('og:image', seoImage, 'property');
    updateMetaTag('og:url', seoUrl, 'property');
    updateMetaTag('og:type', type, 'property');

    // Update Twitter tags
    updateMetaTag('twitter:title', seoTitle, 'property');
    updateMetaTag('twitter:description', seoDescription, 'property');
    updateMetaTag('twitter:image', seoImage, 'property');
    updateMetaTag('twitter:url', seoUrl, 'property');

    // Update canonical link
    updateCanonicalLink(seoCanonical);

    // Add structured data if provided
    if (schema) {
      updateStructuredData(schema);
    }
  }, [seoTitle, seoDescription, seoKeywords, seoImage, seoUrl, seoCanonical, type, noindex, schema]);

  return null;
}

function updateMetaTag(name: string, content: string, attributeName: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attributeName}="${name}"]`) as HTMLMetaElement;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function updateCanonicalLink(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', href);
}

function updateStructuredData(schema: any): void {
  const existingScript = document.querySelector('script[data-seo="dynamic"]');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-seo', 'dynamic');
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}