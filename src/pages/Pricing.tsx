import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "€299",
    period: "/month",
    description: "For growing platforms starting with verification",
    verifications: "100 verifications/month included",
    overage: "€3 per additional verification",
    features: [
      "2 verification packages",
      "Basic rules engine",
      "Document upload & storage",
      "Email support (48h response)",
      "API access",
      "Basic audit logs",
      "Standard webhooks",
    ],
    cta: "Start sandbox",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "€799",
    period: "/month",
    description: "For platforms scaling their verification operations",
    verifications: "1,000 verifications/month included",
    overage: "€2 per additional verification",
    features: [
      "Unlimited verification packages",
      "Advanced rules & scoring engine",
      "Priority support (24h response)",
      "Custom webhooks & integrations",
      "Custom branding on badges",
      "Team roles (up to 10 reviewers)",
      "Advanced analytics dashboard",
      "SLA monitoring",
    ],
    cta: "Book a demo",
    variant: "accent" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large platforms with complex compliance needs",
    verifications: "Unlimited verifications",
    overage: "Volume discounts available",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated account manager",
      "99.9% uptime SLA guarantee",
      "On-premise deployment option",
      "SSO & advanced security",
      "Custom data retention policies",
      "White-label solution",
    ],
    cta: "Contact sales",
    variant: "outline" as const,
  },
];

const faqs = [
  {
    question: "What counts as a verification?",
    answer: "A verification is counted each time you submit a verification request for review. Draft requests don't count until they're submitted.",
  },
  {
    question: "Can I change plans mid-cycle?",
    answer: "Yes, you can upgrade at any time. Downgrades take effect at the start of the next billing cycle.",
  },
  {
    question: "Do you offer annual billing?",
    answer: "Yes, annual billing is available with a 20% discount on all plans.",
  },
  {
    question: "What happens if I exceed my verification limit?",
    answer: "You'll be charged the overage rate per additional verification. We'll notify you at 80% and 100% usage.",
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
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Transparent pricing for every scale
              </h1>
              <p className="text-lg text-muted-foreground">
                Pay per verification with predictable monthly plans. All plans include core features, 
                audit trail, and GDPR compliance.
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
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                        {plan.price}
                      </span>
                      <span className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {plan.period}
                      </span>
                    </div>
                    <p className={`text-sm mt-2 ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className={`p-3 rounded-lg mb-6 ${plan.popular ? "bg-primary-foreground/10" : "bg-secondary"}`}>
                    <p className={`text-sm font-medium ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                      {plan.verifications}
                    </p>
                    <p className={`text-xs ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {plan.overage}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 shrink-0 ${plan.popular ? "text-accent" : "text-accent"}`} />
                        <span className={`text-sm ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
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

        {/* FAQ */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Frequently asked questions
              </h2>
              <div className="space-y-6">
                {faqs.map((faq) => (
                  <div key={faq.question} className="bg-card rounded-xl p-6 border border-border">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
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
