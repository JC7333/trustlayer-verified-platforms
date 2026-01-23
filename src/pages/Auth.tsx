import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Shield, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const emailSchema = z.string().trim().email("Adresse email invalide").max(255);
const passwordSchema = z.string().min(8, "Minimum 8 caractères").max(128);
const nameSchema = z.string().trim().min(2, "Minimum 2 caractères").max(100);

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading, signIn, signUp } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: state "check email"
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const checkEmail = searchParams.get("check_email") === "1";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailResult = emailSchema.safeParse(formData.email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(formData.password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (!isLogin) {
      const nameResult = nameSchema.safeParse(formData.fullName);
      if (!nameResult.success) {
        newErrors.fullName = nameResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBackToLogin = () => {
    setIsLogin(true);
    setErrors({});
    setSearchParams({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou mot de passe incorrect");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Connexion réussie !");
        navigate("/app/dashboard", { replace: true });
        return;
      }

      // SIGN UP FLOW (fixed)
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
      );

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Cet email est déjà utilisé");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // ✅ Do NOT redirect to dashboard here
      // ✅ Show a proper "check your email" screen
      setPendingEmail(formData.email);
      setIsLogin(true); // user will login after confirming email
      setFormData((prev) => ({ ...prev, password: "" })); // avoid keeping password in UI
      setErrors({});
      setSearchParams({ check_email: "1" });

      toast.success(
        "Compte créé. Vérifiez votre email pour confirmer l'inscription.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent shadow-glow">
              <Shield className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              TrustLayer
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {checkEmail
              ? "Vérifiez votre email"
              : isLogin
                ? "Bon retour"
                : "Créer un compte"}
          </h1>

          <p className="text-muted-foreground mb-8">
            {checkEmail
              ? "Un lien de confirmation vient de vous être envoyé."
              : isLogin
                ? "Connectez-vous pour accéder à votre plateforme"
                : "Démarrez votre essai gratuit de 14 jours"}
          </p>

          {/* ✅ CHECK EMAIL SCREEN */}
          {checkEmail ? (
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Mail className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      Confirmation requise
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cliquez sur le lien reçu par email pour activer votre
                      compte.
                    </p>
                    {pendingEmail ? (
                      <p className="text-sm text-muted-foreground">
                        Email :{" "}
                        <span className="font-medium text-foreground">
                          {pendingEmail}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="accent"
                size="lg"
                className="w-full"
                onClick={handleBackToLogin}
              >
                J&apos;ai confirmé — Se connecter
                <ArrowRight className="h-5 w-5" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleBackToLogin}
              >
                Retour à la connexion
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nom complet
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="Jean Dupont"
                        className="pl-11"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email professionnel
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="vous@entreprise.com"
                      className="pl-11"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="pl-11"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Se connecter" : "Créer mon compte"}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                    }}
                    className="ml-2 text-accent font-medium hover:underline"
                  >
                    {isLogin ? "S'inscrire" : "Se connecter"}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"></div>
            <div className="relative bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/10">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Vérifications", value: "2M+" },
                  { label: "Plateformes", value: "500+" },
                  { label: "Uptime", value: "99.9%" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-primary-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-primary-foreground/60">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-badge">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="text-primary-foreground font-medium">
                  Prestataire Vérifié
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground text-xs">
                  ✓
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Automatisez 90% de vos vérifications
          </h2>
          <p className="text-primary-foreground/70">
            Rejoignez 500+ plateformes qui font confiance à TrustLayer pour
            sécuriser leur réseau de prestataires.
          </p>
        </div>
      </div>
    </div>
  );
}
