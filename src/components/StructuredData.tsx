import { useEffect } from "react";

const BASE_URL = "https://flashmatch.org";

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
  "name": "FlashMatch",
  "url": BASE_URL,
  "logo": `${BASE_URL}/og-image.jpg`,
  "description": "FlashMatch è la piattaforma di appuntamenti a pagamento: le donne fissano le proprie tariffe, gli uomini pagano 1 gettone per inviare la richiesta di appuntamento.",
  "email": "support@flashmatch.org",
  "sameAs": [],
  "foundingDate": "2024",
  "slogan": "Appuntamenti a pagamento, alle condizioni decise da lei"
});

const generateWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "FlashMatch",
  "url": BASE_URL,
  "description": "Piattaforma di appuntamenti a pagamento: tariffe decise dalle donne, richieste inviate con gettoni.",
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
  "name": "FlashMatch",
  "url": BASE_URL,
  "applicationCategory": "SocialNetworkingApplication",
  "operatingSystem": "Web",
  "description": "Piattaforma di appuntamenti a pagamento con sistema a gettoni: 1 gettone per inviare una richiesta, tariffe decise dalle donne e pagate di persona.",
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
