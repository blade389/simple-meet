import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="text-center">
        <h1 className="mb-4 font-serif text-7xl">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Pagina non trovata</p>
        <a
          href="/"
          className="text-sm font-bold uppercase tracking-widest text-primary underline-offset-4 hover:underline"
        >
          Torna alla home
        </a>
      </div>
    </div>
  );

};

export default NotFound;
