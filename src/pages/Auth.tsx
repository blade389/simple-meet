import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri").max(100),
  email: z.string().email("Email non valida"),
  gender: z.enum(["male", "female"], { required_error: "Seleziona un genere" }),
  birthDate: z.string().min(1, "Data di nascita richiesta"),
  city: z.string().min(2, "Città richiesta"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"]
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast.success("Login effettuato con successo!");
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "Errore durante il login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const formValues = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      gender: formData.get('gender') as string,
      birthDate: formData.get('birthDate') as string,
      city: formData.get('city') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string
    };

    try {
      // Validate form
      const validated = signupSchema.parse(formValues);

      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: validated.name
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Registrazione fallita");

      // Create profile - set default age preferences for males
      const profileData: any = {
        id: authData.user.id,
        full_name: validated.name,
        gender: validated.gender,
        birth_date: validated.birthDate,
        location_city: validated.city
      };

      // Males get default locked age preferences
      if (validated.gender === 'male') {
        profileData.min_age_preference = 18;
        profileData.max_age_preference = 100;
        profileData.age_preferences_unlocked = false;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) throw profileError;

      // If male, create token record with 1 free token
      if (validated.gender === 'male') {
        const { error: tokenError } = await supabase
          .from('tokens')
          .insert({
            user_id: authData.user.id,
            amount: 1
          });

        if (tokenError) throw tokenError;
      }

      // Send welcome email
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: validated.email,
            name: validated.name,
            gender: validated.gender
          }
        });
        console.log('Welcome email sent successfully');
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail registration if email fails
      }

      toast.success("Registrazione completata! Accedi per continuare.");
      // Switch to login tab
      const loginTab = document.querySelector('[value="login"]') as HTMLButtonElement;
      loginTab?.click();
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Errore durante la registrazione");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-hero">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Heart className="w-10 h-10 text-primary fill-primary" />
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            SCOPAMI
          </h1>
        </Link>

        <Card className="p-8 shadow-glow border-0">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Accedi</TabsTrigger>
              <TabsTrigger value="signup">Registrati</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="tua@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Accesso..." : "Accedi"}
                </Button>
                <div className="text-center">
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Password dimenticata?
                  </a>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder="Il tuo nome"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="tua@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-gender">Genere</Label>
                  <select
                    id="signup-gender"
                    name="gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Seleziona...</option>
                    <option value="female">Femminile (Registrazione Gratuita)</option>
                    <option value="male">Maschile (1 Gettone Gratuito)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-birthdate">Data di Nascita</Label>
                  <Input
                    id="signup-birthdate"
                    name="birthDate"
                    type="date"
                    required
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-city">Città</Label>
                  <Input
                    id="signup-city"
                    name="city"
                    type="text"
                    placeholder="La tua città"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Conferma Password</Label>
                  <Input
                    id="signup-confirm"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    Accetto i{" "}
                    <Link to="/terms-of-service" className="text-primary hover:underline">
                      Termini di Servizio
                    </Link>{" "}
                    e la{" "}
                    <Link to="/privacy-policy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Registrazione..." : "Registrati"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Note:</strong> La registrazione è gratuita per le donne. Gli uomini ricevono
              1 gettone gratuito alla registrazione.
            </p>
          </div>
        </Card>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">
            ← Torna alla Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;
