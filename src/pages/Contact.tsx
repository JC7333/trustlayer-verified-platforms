import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Building2, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Minimum 2 caractères").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  company: z.string().trim().min(1, "Requis").max(100),
  message: z.string().trim().min(10, "Minimum 10 caractères").max(2000),
});

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = contactSchema.safeParse(formData);
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
      const { error } = await supabase.from("contact_requests").insert({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        message: formData.message,
        request_type: "contact",
      });
      
      if (error) throw error;
      
      toast.success("Merci pour votre message ! Nous vous répondrons sous 24h.");
      setFormData({ name: "", email: "", company: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
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
                {/* Left side - Info */}
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-4">
                    Parlons de votre projet
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Que vous exploriez les solutions de vérification ou que vous soyez prêt à démarrer, 
                    nous serions ravis d'échanger avec vous.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Réserver une démo</h3>
                        <p className="text-sm text-muted-foreground">
                          Découvrez TrustLayer en action avec une présentation personnalisée adaptée à votre cas d'usage.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Demandes Enterprise</h3>
                        <p className="text-sm text-muted-foreground">
                          Intégrations sur mesure, support dédié et tarification volume pour les grandes plateformes.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Questions générales</h3>
                        <p className="text-sm text-muted-foreground">
                          contact@trustlayer.io
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="mt-10 p-6 bg-secondary/50 rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-accent" />
                      <span className="text-sm text-foreground">Réponse sous 24h ouvrées</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-accent" />
                      <span className="text-sm text-foreground">Paris, France (HQ)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-accent" />
                      <span className="text-sm text-foreground">+33 1 XX XX XX XX</span>
                    </div>
                  </div>
                </div>

                {/* Right side - Form */}
                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Envoyez-nous un message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Comment pouvons-nous vous aider ?
                      </label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Décrivez vos besoins en vérification..."
                        rows={4}
                      />
                      {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
                    </div>
                    <Button type="submit" variant="accent" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                    </Button>
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
