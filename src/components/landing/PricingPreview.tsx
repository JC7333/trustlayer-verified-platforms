import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "299€",
    period: "/mois",
    description: "Pour les plateformes qui démarrent la vérification",
    verifications: "100 vérifications/mois incluses",
    overage: "3€ par vérification supplémentaire",
    features: [
      "2 packs de vérification",
      "Moteur de règles basique",
      "Stockage documents 10 Go",
      "Support email (48h)",
      "Accès API complet",
      "Webhooks standards",
    ],
    cta: "Démarrer l'essai",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "799€",
    period: "/mois",
    description: "Pour les plateformes en croissance",
    verifications: "1 000 vérifications/mois incluses",
    overage: "2€ par vérification supplémentaire",
    features: [
      "Packs illimités",
      "IA Reviewer Assistant",
      "White-label complet",
      "Support prioritaire (24h)",
      "Équipe jusqu'à 10 reviewers",
      "Analytics avancés",
      "Intégrations natives",
      "Trust Score™ configurable",
    ],
    cta: "Réserver une démo",
    variant: "accent" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Sur mesure",
    period: "",
    description: "Pour les grandes plateformes",
    verifications: "Vérifications illimitées",
    overage: "Tarifs dégressifs sur volume",
    features: [
      "Tout le plan Pro",
      "Intégrations custom",
      "Account manager dédié",
      "SLA 99.9% garanti",
      "Déploiement on-premise possible",
      "SSO & sécurité avancée",
      "Rétention données configurable",
      "Formation équipes incluse",
    ],
    cta: "Contacter l'équipe",
    variant: "outline" as const,
  },
];

export function PricingPreview() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-accent/10 text-accent mb-4">
            Tarifs
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Tarification transparente
          </h2>
          <p className="text-lg text-muted-foreground">
            Payez par vérification avec des forfaits mensuels prévisibles. Sans
            engagement, sans frais cachés.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "bg-primary text-primary-foreground shadow-2xl scale-105 z-10"
                  : "bg-card border border-border hover:border-accent/30 hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold gradient-accent text-accent-foreground shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-xl font-bold mb-2 ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-bold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`text-sm mt-2 ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {plan.description}
                </p>
              </div>

              <div
                className={`p-4 rounded-xl mb-6 ${plan.popular ? "bg-primary-foreground/10" : "bg-secondary"}`}
              >
                <p
                  className={`text-sm font-semibold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}
                >
                  {plan.verifications}
                </p>
                <p
                  className={`text-xs mt-1 ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                >
                  {plan.overage}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`h-5 w-5 shrink-0 mt-0.5 ${plan.popular ? "text-accent" : "text-accent"}`}
                    />
                    <span
                      className={`text-sm ${plan.popular ? "text-primary-foreground/90" : "text-muted-foreground"}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link to={plan.name === "Enterprise" ? "/contact" : "/demo"}>
                <Button
                  variant={plan.popular ? "hero" : plan.variant}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto mt-12 p-6 rounded-2xl bg-secondary/50 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">
              Tous les plans incluent :
            </strong>{" "}
            Audit trail complet • Chiffrement AES-256 • Conformité RGPD •
            Hébergement UE • Support technique
          </p>
        </div>
      </div>
    </section>
  );
}
