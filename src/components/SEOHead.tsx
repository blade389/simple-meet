import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  keywords?: string;
  noindex?: boolean;
}

const BASE_URL = "https://matchly.online";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

export const SEOHead = ({
  title,
  description,
  canonicalPath = "",
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  keywords,
  noindex = false,
}: SEOHeadProps) => {
  const fullTitle = title.includes("Matchly") ? title : `${title} | Matchly`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attributeName = isProperty ? "property" : "name";
      let tag = document.querySelector(`meta[${attributeName}="${name}"]`);
      
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attributeName, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // Helper function to update or create link tags
    const updateLinkTag = (rel: string, href: string) => {
      let tag = document.querySelector(`link[rel="${rel}"]`);
      
      if (!tag) {
        tag = document.createElement("link");
        tag.setAttribute("rel", rel);
        document.head.appendChild(tag);
      }
      tag.setAttribute("href", href);
    };

    // Update meta description
    updateMetaTag("description", description);

    // Update keywords if provided
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }

    // Update robots
    if (noindex) {
      updateMetaTag("robots", "noindex, nofollow");
    } else {
      updateMetaTag("robots", "index, follow");
    }

    // Update Open Graph tags
    updateMetaTag("og:title", fullTitle, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", ogType, true);
    updateMetaTag("og:url", canonicalUrl, true);
    updateMetaTag("og:image", ogImage, true);
    updateMetaTag("og:site_name", "Matchly", true);
    updateMetaTag("og:locale", "it_IT", true);

    // Update Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", ogImage);

    // Update canonical URL
    updateLinkTag("canonical", canonicalUrl);

    // Cleanup function to reset title on unmount (optional)
    return () => {
      // We don't reset as other pages will set their own
    };
  }, [fullTitle, description, canonicalUrl, ogImage, ogType, keywords, noindex]);

  return null;
};

export default SEOHead;
