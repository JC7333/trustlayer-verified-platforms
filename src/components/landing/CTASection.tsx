import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 gradient-hero relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl gradient-accent shadow-glow mb-8">
            <Shield className="h-10 w-10 text-accent-foreground" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Prêt à automatiser vos vérifications ?
          </h2>

          <p className="text-lg sm:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
            Rejoignez les 500+ plateformes qui font confiance à TrustLayer pour leurs workflows 
            de vérification, preuves et conformité.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/demo">
              <Button variant="hero" size="xl" className="group">
                Réserver une démo
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/sandbox">
              <Button variant="hero-outline" size="xl">
                <Sparkles className="h-5 w-5" />
                Essayer gratuitement
              </Button>
            </Link>
          </div>

          <p className="text-sm text-primary-foreground/50">
            Démo personnalisée de 30 min • Sandbox illimité pendant 14 jours • Sans engagement
          </p>
        </div>
      </div>
    </section>
  );
}
