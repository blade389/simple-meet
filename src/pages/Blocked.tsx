import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Blocked = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Account Bloccato</CardTitle>
          <CardDescription className="text-base mt-2">
            Il tuo account è stato bloccato da un amministratore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Se ritieni che questo sia un errore o desideri richiedere lo sblocco del tuo account, 
            contatta il nostro team di supporto spiegando le ragioni della tua richiesta.
          </p>
          
          <Button 
            className="w-full" 
            asChild
          >
            <a href="mailto:support@flashmatch.org?subject=Richiesta%20sblocco%20account">
              <Mail className="w-4 h-4 mr-2" />
              Contatta il Supporto
            </a>
          </Button>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleLogout}
          >
            Esci
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Blocked;
