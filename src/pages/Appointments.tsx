import { Card } from '@/components/ui/card';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Appointments = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SCOPAMI
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">I Miei Appuntamenti</h2>
        
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nessun appuntamento programmato
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Appointments;