import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "€299",
    period: "/month",
    description: "For growing platforms starting with verification",
    features: [
      "Up to 100 verifications/month",
      "2 verification packages",
      "Basic rules engine",
      "Email support",
      "API access",
    ],
    cta: "Start sandbox",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "€799",
    period: "/month",
    description: "For platforms scaling their verification ops",
    features: [
      "Up to 1,000 verifications/month",
      "Unlimited packages",
      "Advanced rules & scoring",
      "Priority support",
      "Webhooks & integrations",
      "Custom branding",
    ],
    cta: "Book a demo",
    variant: "accent" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large platforms with complex needs",
    features: [
      "Unlimited verifications",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantees",
      "On-premise option",
      "SSO & advanced security",
    ],
    cta: "Contact sales",
    variant: "outline" as const,
  },
];

export function PricingPreview() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Pay per verification with predictable monthly plans. No hidden fees.
          </p>
        </div>

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

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include: Audit trail • Data encryption • GDPR compliance • API access
        </p>
      </div>
    </section>
  );
}
