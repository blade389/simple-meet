import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path: string;
}

// Mappa delle pagine con i loro nomi in italiano
const pageNames: Record<string, string> = {
  "": "Home",
  "about": "Chi Siamo",
  "features": "Funzionalità",
  "pricing": "Prezzi",
  "faq": "FAQ",
  "auth": "Accedi",
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Termini di Servizio",
  "cookie-policy": "Cookie Policy",
  "dashboard": "Dashboard",
  "profile": "Profilo",
  "browse": "Esplora",
  "favorites": "Preferiti",
  "appointments": "Appuntamenti",
  "blocked": "Bloccati",
  "buy-tokens": "Acquista Gettoni",
  "premium-subscription": "Abbonamento Premium",
  "premium-profiles": "Profili Premium",
  "verify": "Verifica",
  "admin": "Admin",
};

const BASE_URL = "https://matchly.online";

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Non mostrare breadcrumbs sulla home
  if (pathSegments.length === 0) {
    return null;
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", path: "/" },
  ];

  let currentPath = "";
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = pageNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    breadcrumbItems.push({ label, path: currentPath });
  });

  // JSON-LD Structured Data per breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${BASE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="py-3 px-4">
        <ol className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;

            return (
              <li key={item.path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
                )}
                
                {isLast ? (
                  <span className="font-medium text-foreground" aria-current="page">
                    {index === 0 ? <Home className="h-4 w-4" /> : item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="hover:text-primary transition-colors flex items-center"
                  >
                    {index === 0 ? <Home className="h-4 w-4" /> : item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
