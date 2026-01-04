import { useEffect } from "react";

const BASE_URL = "https://scopami.online";

interface OrganizationSchema {
  type: "Organization";
}

interface WebSiteSchema {
  type: "WebSite";
}

interface FAQSchema {
  type: "FAQPage";
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

interface WebApplicationSchema {
  type: "WebApplication";
}

type SchemaType = OrganizationSchema | WebSiteSchema | FAQSchema | WebApplicationSchema;

interface StructuredDataProps {
  schema: SchemaType;
}

const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SCOPAMI",
  "url": BASE_URL,
  "logo": `${BASE_URL}/og-image.jpg`,
  "description": "SCOPAMI è l'app di dating innovativa che mette le donne al comando. Incontri autentici e sicuri con sistema gettoni.",
  "email": "support@scopami.online",
  "sameAs": [],
  "foundingDate": "2024",
  "slogan": "L'app di dating che mette le donne al comando"
});

const generateWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SCOPAMI",
  "url": BASE_URL,
  "description": "L'app di dating innovativa che mette le donne al comando. Incontri autentici e sicuri.",
  "inLanguage": "it-IT",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/browse?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
});

const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

const generateWebApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SCOPAMI",
  "url": BASE_URL,
  "applicationCategory": "SocialNetworkingApplication",
  "operatingSystem": "Web",
  "description": "App di dating innovativa con sistema gettoni. Le donne scelgono, incontri sicuri e verificati.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "description": "Registrazione gratuita"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "10000",
    "bestRating": "5",
    "worstRating": "1"
  }
});

export const StructuredData = ({ schema }: StructuredDataProps) => {
  useEffect(() => {
    let jsonLd: object;

    switch (schema.type) {
      case "Organization":
        jsonLd = generateOrganizationSchema();
        break;
      case "WebSite":
        jsonLd = generateWebSiteSchema();
        break;
      case "FAQPage":
        jsonLd = generateFAQSchema(schema.faqs);
        break;
      case "WebApplication":
        jsonLd = generateWebApplicationSchema();
        break;
      default:
        return;
    }

    const scriptId = `structured-data-${schema.type}`;
    
    // Remove existing script if any
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schema]);

  return null;
};

export default StructuredData;
