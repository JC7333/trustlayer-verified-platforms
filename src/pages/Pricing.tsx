import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, HelpCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "299€",
    period: "/mois",
    description:
      "Pour les plateformes qui démarrent leur processus de vérification",
    verifications: "100 vérifications/mois incluses",
    overage: "3€ par vérification supplémentaire",
    features: [
      "2 packages de vérification",
      "Moteur de règles basique",
      "Upload & stockage documents",
      "Support email (48h)",
      "Accès API",
      "Audit logs basiques",
      "Webhooks standards",
    ],
    cta: "Démarrer l'essai gratuit",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "799€",
    period: "/mois",
    description:
      "Pour les plateformes en croissance qui automatisent leurs vérifications",
    verifications: "1 000 vérifications/mois incluses",
    overage: "2€ par vérification supplémentaire",
    features: [
      "Packages de vérification illimités",
      "Moteur de règles avancé + scoring",
      "IA Assistant Reviewer",
      "Support prioritaire (24h)",
      "Webhooks & intégrations custom",
      "Branding personnalisé sur les badges",
      "Équipe jusqu'à 10 reviewers",
      "Dashboard analytics avancé",
      "Suivi SLA",
    ],
    cta: "Réserver une démo",
    variant: "accent" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Sur mesure",
    period: "",
    description:
      "Pour les grandes plateformes avec des besoins de conformité complexes",
    verifications: "Vérifications illimitées",
    overage: "Remises volume disponibles",
    features: [
      "Tout ce qui est dans Pro",
      "Intégrations sur mesure",
      "Account manager dédié",
      "SLA 99.9% garanti",
      "Déploiement on-premise possible",
      "SSO & sécurité avancée",
      "Politique de rétention custom",
      "Solution white-label complète",
    ],
    cta: "Contacter l'équipe commerciale",
    variant: "outline" as const,
  },
];

const faqs = [
  {
    question: "Qu'est-ce qui compte comme une vérification ?",
    answer:
      "Une vérification est comptée chaque fois qu'une demande de vérification est soumise pour revue. Les brouillons ne sont pas comptés tant qu'ils ne sont pas soumis.",
  },
  {
    question: "Puis-je changer de plan en cours de mois ?",
    answer:
      "Oui, vous pouvez passer à un plan supérieur à tout moment. Les rétrogradations prennent effet au début du prochain cycle de facturation.",
  },
  {
    question: "Proposez-vous une facturation annuelle ?",
    answer:
      "Oui, la facturation annuelle est disponible avec une réduction de 20% sur tous les plans.",
  },
  {
    question: "Que se passe-t-il si je dépasse ma limite de vérifications ?",
    answer:
      "Vous serez facturé au tarif de dépassement par vérification supplémentaire. Nous vous notifions à 80% et 100% d'utilisation.",
  },
  {
    question: "Y a-t-il une période d'essai gratuite ?",
    answer:
      "Oui ! Tous les plans incluent un essai gratuit de 14 jours avec accès complet aux fonctionnalités. Aucune carte bancaire requise.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "Absolument. Nous utilisons le chiffrement AES-256 au repos et TLS 1.3 en transit. Nos serveurs sont hébergés en Europe avec conformité RGPD.",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <main className="pt-24">
        {/* Header */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                14 jours d'essai gratuit
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Tarification transparente pour toutes les tailles
              </h1>
              <p className="text-lg text-muted-foreground">
                Payez par vérification avec des plans mensuels prévisibles. Tous
                les plans incluent les fonctionnalités essentielles, l'audit
                trail et la conformité RGPD.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-8 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground shadow-xl scale-105"
                      : "bg-card border border-border"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold gradient-accent text-accent-foreground">
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
                    className={`p-3 rounded-lg mb-6 ${plan.popular ? "bg-primary-foreground/10" : "bg-secondary"}`}
                  >
                    <p
                      className={`text-sm font-medium ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}
                    >
                      {plan.verifications}
                    </p>
                    <p
                      className={`text-xs ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                    >
                      {plan.overage}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check
                          className={`h-5 w-5 shrink-0 ${plan.popular ? "text-accent" : "text-accent"}`}
                        />
                        <span
                          className={`text-sm ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}
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
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROI Calculator Teaser */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-8 md:p-12 border border-accent/20">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Calculez vos économies
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    En moyenne, nos clients économisent{" "}
                    <strong className="text-foreground">12h/semaine</strong> sur
                    les tâches de vérification et réduisent les erreurs de
                    conformité de{" "}
                    <strong className="text-foreground">87%</strong>.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-accent">-90%</p>
                      <p className="text-xs text-muted-foreground">
                        Temps manuel
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-accent">-87%</p>
                      <p className="text-xs text-muted-foreground">Erreurs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-accent">4.2x</p>
                      <p className="text-xs text-muted-foreground">ROI moyen</p>
                    </div>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <Link to="/demo">
                    <Button variant="accent" size="lg">
                      Voir la démo personnalisée
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Questions fréquentes
              </h2>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="bg-card rounded-xl p-6 border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
