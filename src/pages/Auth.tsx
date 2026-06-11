import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import SEOHead from "@/components/SEOHead";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { saveReferralCode } from "@/lib/referral";

const Auth = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) saveReferralCode(ref);
  }, [searchParams]);

  const signupSchema = z.object({
    name: z.string().min(2, t("auth.fullName")).max(100),
    email: z.string().email(t("auth.email")),
    gender: z.enum(["male", "female"]),
    birthDate: z.string().min(1, t("auth.birthDate")),
    password: z.string().min(6, t("auth.password")),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("auth.confirmPassword"),
    path: ["confirmPassword"]
  });

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

      // Get current language for user preferences
      const currentLanguage = i18n.language?.substring(0, 2) || 'it';

      // Create profile - set default age preferences for males
      const profileData: any = {
        id: authData.user.id,
        full_name: validated.name,
        gender: validated.gender,
        birth_date: validated.birthDate,
        preferred_language: currentLanguage
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

      // Send welcome email with user's language
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: validated.email,
            name: validated.name,
            gender: validated.gender,
            language: currentLanguage
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
    <>
      <SEOHead
        title="Accedi o Registrati | FlashMatch"
        description="Accedi al tuo account FlashMatch o registrati gratuitamente. L'app di dating sicura con verifica identità e sistema gettoni."
        canonicalPath="/auth"
        keywords="login flashmatch, registrazione dating, accedi app incontri"
        noindex={true}
      />
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-hero">
        <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-10 h-10 text-primary fill-primary" />
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              FlashMatch
            </h1>
          </Link>
          <LanguageSelector />
        </div>

        <Card className="p-8 shadow-glow border-0">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t("auth.email")}</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder={t("auth.yourEmail")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t("auth.password")}</Label>
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
                  {isLoading ? t("auth.logging") : t("auth.login")}
                </Button>
                <div className="text-center">
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("auth.forgotPassword")}
                  </a>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{t("auth.fullName")}</Label>
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder={t("auth.yourName")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t("auth.email")}</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder={t("auth.yourEmail")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-gender">{t("auth.gender")}</Label>
                  <select
                    id="signup-gender"
                    name="gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="">{t("auth.selectGender")}</option>
                    <option value="female">{t("auth.female")}</option>
                    <option value="male">{t("auth.male")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-birthdate">{t("auth.birthDate")}</Label>
                  <Input
                    id="signup-birthdate"
                    name="birthDate"
                    type="date"
                    required
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t("auth.password")}</Label>
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
                  <Label htmlFor="signup-confirm">{t("auth.confirmPassword")}</Label>
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
                    {t("auth.termsAgree")}{" "}
                    <Link to="/terms-of-service" className="text-primary hover:underline">
                      {t("common.termsOfService")}
                    </Link>{" "}
                    {t("auth.and")}{" "}
                    <Link to="/privacy-policy" className="text-primary hover:underline">
                      {t("common.privacyPolicy")}
                    </Link>
                  </label>
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? t("auth.registering") : t("auth.signup")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <strong>{t("auth.note")}</strong> {t("auth.registrationNote")}
            </p>
          </div>
        </Card>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">
            ← {t("common.backToHome")}
          </Link>
        </p>
      </div>
    </div>
    </>
  );
};

export default Auth;