import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Configure Rules",
    description: "Define verification packages for your vertical with required documents, expiration rules, and scoring logic.",
  },
  {
    number: "02",
    title: "Collect Evidence",
    description: "End-users upload documents through your platform. TrustLayer stores, tags, and tracks everything.",
  },
  {
    number: "03",
    title: "Review & Decide",
    description: "Your reviewers use the console to validate documents, run checklists, and make approval decisions.",
  },
  {
    number: "04",
    title: "Issue Badges",
    description: "Approved profiles get public trust badges. Embed widgets on your platform or use our API.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            From configuration to verification in four simple steps.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-accent to-accent/20" />
                )}
                
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent text-accent-foreground text-2xl font-bold mb-4 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
