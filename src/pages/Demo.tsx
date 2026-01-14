import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Calendar, Sparkles, Clock, Users, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const benefits = [
  "Voir le workflow de vérification complet en action",
  "Configurer un package de règles pour votre secteur",
  "Tester l'API et les intégrations webhook",
  "Explorer la console reviewer et le coffre-fort",
  "Obtenir des réponses à vos questions spécifiques",
];

const stats = [
  { icon: Clock, value: "30 min", label: "Durée de la démo" },
  { icon: Users, value: "1-on-1", label: "Avec un expert produit" },
  { icon: Zap, value: "Immédiat", label: "Accès sandbox après" },
];

const demoSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  company: z.string().trim().min(1).max(100),
  vertical: z.string().min(1, "Veuillez sélectionner un secteur"),
  volume: z.string().min(1, "Veuillez sélectionner un volume"),
});

export default function Demo() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    vertical: "",
    volume: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = demoSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Insert into database
      const { error: dbError } = await supabase.from("contact_requests").insert({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        vertical: formData.vertical,
        volume: formData.volume,
        request_type: "demo",
      });
      
      if (dbError) throw dbError;
      
      // Send email notification via Edge Function
      const { error: emailError } = await supabase.functions.invoke("send-demo-email", {
        body: {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          vertical: formData.vertical,
          volume: formData.volume,
        },
      });
      
      if (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail the whole request if email fails
      }
      
      toast.success("Demande reçue ! Consultez votre email pour les créneaux disponibles.");
      setFormData({ name: "", email: "", company: "", vertical: "", volume: "" });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error submitting demo request:", error);
      }
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      
      <main className="pt-24">
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left side - Value Prop */}
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                    <Sparkles className="h-4 w-4" />
                    Démo personnalisée gratuite
                  </div>
                  <h1 className="text-4xl font-bold text-foreground mb-4">
                    Réservez votre démo personnalisée
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Découvrez comment TrustLayer peut simplifier vos workflows de vérification. 
                    Nous adapterons la présentation à votre cas d'usage spécifique.
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {stats.map((stat) => (
                      <div key={stat.label} className="text-center p-4 bg-secondary/50 rounded-xl">
                        <stat.icon className="h-6 w-6 text-accent mx-auto mb-2" />
                        <p className="text-lg font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {benefits.map((benefit) => (
                      <div key={benefit} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 p-6 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl border border-accent/20">
                    <p className="text-sm text-foreground">
                      <strong>Après la démo :</strong> Vous recevrez un accès sandbox gratuit et la documentation 
                      pour explorer TrustLayer à votre rythme. Aucun engagement requis.
                    </p>
                  </div>
                </div>

                {/* Right side - Form */}
                <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-accent">
                      <Calendar className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Demander ma démo</h2>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Votre nom
                      </label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jean Dupont"
                      />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email professionnel
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jean@entreprise.com"
                      />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                        Entreprise
                      </label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Votre Entreprise"
                      />
                      {errors.company && <p className="text-sm text-destructive mt-1">{errors.company}</p>}
                    </div>
                    <div>
                      <label htmlFor="vertical" className="block text-sm font-medium text-foreground mb-2">
                        Votre secteur
                      </label>
                      <Select 
                        value={formData.vertical} 
                        onValueChange={(value) => setFormData({ ...formData, vertical: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre secteur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sante">Santé</SelectItem>
                          <SelectItem value="services-domicile">Services à domicile</SelectItem>
                          <SelectItem value="marketplace">Marketplace B2B</SelectItem>
                          <SelectItem value="services-financiers">Services financiers</SelectItem>
                          <SelectItem value="education">Éducation</SelectItem>
                          <SelectItem value="logistique">Transport & Logistique</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.vertical && <p className="text-sm text-destructive mt-1">{errors.vertical}</p>}
                    </div>
                    <div>
                      <label htmlFor="volume" className="block text-sm font-medium text-foreground mb-2">
                        Vérifications mensuelles estimées
                      </label>
                      <Select 
                        value={formData.volume} 
                        onValueChange={(value) => setFormData({ ...formData, volume: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un volume" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="moins-100">Moins de 100</SelectItem>
                          <SelectItem value="100-500">100 - 500</SelectItem>
                          <SelectItem value="500-1000">500 - 1 000</SelectItem>
                          <SelectItem value="1000-5000">1 000 - 5 000</SelectItem>
                          <SelectItem value="plus-5000">Plus de 5 000</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.volume && <p className="text-sm text-destructive mt-1">{errors.volume}</p>}
                    </div>
                    <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Envoi en cours..." : "Réserver ma démo"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Nous vous répondrons sous 24h avec les créneaux disponibles.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
