import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Upload,
  Brain,
  CheckCircle2,
  BadgeCheck,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Collectez les preuves",
    description:
      "Vos utilisateurs uploadent leurs documents via votre plateforme ou notre portail white-label. Demandes automatisées par email.",
    visual: "upload",
  },
  {
    number: "02",
    icon: Brain,
    title: "L'IA pré-analyse",
    description:
      "Notre IA détecte le type de document, extrait les informations clés et signale les anomalies potentielles.",
    visual: "ai",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Vos reviewers décident",
    description:
      "Console optimisée avec checklists, comparaison côte-à-côte et suggestions IA. Workflow de double validation optionnel.",
    visual: "review",
  },
  {
    number: "04",
    icon: BadgeCheck,
    title: "Badges délivrés",
    description:
      "Profils approuvés reçoivent un badge de confiance avec Trust Score™. Widget intégrable sur votre plateforme.",
    visual: "badge",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-accent/10 text-accent mb-4">
            Comment ça marche
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            De la collecte au badge en 4 étapes
          </h2>
          <p className="text-lg text-muted-foreground">
            Un workflow fluide, assisté par IA, avec contrôle humain pour les
            décisions finales.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-accent via-accent to-accent/20" />

            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step card */}
                <div className="text-center group">
                  <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-2xl gradient-accent text-accent-foreground shadow-lg shadow-accent/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-8 w-8" />
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-card border-2 border-accent text-xs font-bold text-accent">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link to="/demo">
              <Button variant="accent" size="lg" className="group">
                Voir une démo complète
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
