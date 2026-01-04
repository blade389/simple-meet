import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Shield, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import SEOHead from "@/components/SEOHead";
import StructuredData from "@/components/StructuredData";
import LanguageSelector from "@/components/LanguageSelector";

const Index = () => {
  return (
    <>
      <SEOHead
        title="SCOPAMI - App di Dating Innovativa | Incontri Sicuri"
        description="SCOPAMI è l'app di dating che mette le donne al comando. Sistema innovativo con gettoni per incontri autentici, sicuri e verificati. Registrazione gratuita."
        canonicalPath="/"
        keywords="dating app, incontri online, app incontri Italia, dating sicuro, incontri verificati, app appuntamenti"
      />
      <StructuredData schema={{ type: "Organization" }} />
      <StructuredData schema={{ type: "WebSite" }} />
      <StructuredData schema={{ type: "WebApplication" }} />
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SCOPAMI
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Caratteristiche
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              Come Funziona
            </a>
            <LanguageSelector />
            <Link to="/auth">
              <Button variant="ghost">Accedi</Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero">Registrati</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-hero">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Trova il Tuo{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Incontro Perfetto
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                L'app di dating che mette le donne al comando. Sistema innovativo con gettoni per
                incontri autentici e sicuri.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Inizia Ora Gratis
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    Scopri di Più
                  </Button>
                </Link>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Utenti Attivi</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">95%</div>
                  <div className="text-sm text-muted-foreground">Incontri Riusciti</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">4.8★</div>
                  <div className="text-sm text-muted-foreground">Rating Medio</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl"></div>
              <img
                src={heroImage}
                alt="Coppie felici al tramonto"
                className="relative rounded-2xl shadow-glow w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Perché Scegliere SCOPAMI?</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un'esperienza di dating unica con funzionalità innovative per connessioni autentiche
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Donne al Comando</h4>
              <p className="text-muted-foreground">
                Le donne scelgono, gli uomini rispondono. Un approccio che rispetta tutti.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Sicurezza Garantita</h4>
              <p className="text-muted-foreground">
                Verifica identità obbligatoria e sistema di recensioni per tutti.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Sistema Gettoni</h4>
              <p className="text-muted-foreground">
                Incontri seri garantiti dal nostro innovativo sistema con gettoni.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Recensioni Verified</h4>
              <p className="text-muted-foreground">
                Solo recensioni da incontri reali per massima trasparenza.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Come Funziona</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tre semplici passi per iniziare la tua avventura
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto shadow-glow">
                1
              </div>
              <h4 className="text-xl font-semibold">Registrati</h4>
              <p className="text-muted-foreground">
                Crea il tuo profilo, carica una foto e verifica la tua identità
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-2xl font-bold text-secondary-foreground mx-auto shadow-glow">
                2
              </div>
              <h4 className="text-xl font-semibold">Connettiti</h4>
              <p className="text-muted-foreground">
                Scorri i profili nella tua zona e invia richieste di incontro
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-2xl font-bold text-accent-foreground mx-auto shadow-glow">
                3
              </div>
              <h4 className="text-xl font-semibold">Incontra</h4>
              <p className="text-muted-foreground">
                Organizza il tuo incontro e lascia una recensione dopo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl font-bold text-primary-foreground mb-6">
            Pronto a Trovare la Tua Connessione?
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Unisciti a migliaia di persone che hanno già trovato incontri autentici su SCOPAMI
          </p>
          <Link to="/auth">
            <Button
              size="xl"
              className="bg-background text-foreground hover:bg-background/90 shadow-glow"
            >
              Inizia Gratuitamente
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-primary fill-primary" />
                <span className="text-xl font-bold">SCOPAMI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                L'app di dating che mette le donne al comando
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Prodotto</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/features" className="hover:text-foreground transition-colors">
                    Caratteristiche
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-foreground transition-colors">
                    Prezzi
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Azienda</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="hover:text-foreground transition-colors">
                    Chi Siamo
                  </Link>
                </li>

                <li>
                  <a href="mailto:support@scopami.online" className="hover:text-foreground transition-colors">
                    Contattaci
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legale</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="hover:text-foreground transition-colors">
                    Termini di Servizio
                  </Link>
                </li>
                <li>
                  <Link to="/cookie-policy" className="hover:text-foreground transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 SCOPAMI. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Index;
