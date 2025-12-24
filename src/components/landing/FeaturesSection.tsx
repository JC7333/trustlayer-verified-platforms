import { 
  FileCheck, 
  Shield, 
  Settings2, 
  Users, 
  Code2, 
  BadgeCheck,
  Clock,
  BarChart3
} from "lucide-react";

const features = [
  {
    icon: FileCheck,
    title: "Verification Requests",
    description: "CRUD workflow with states from draft to approved. SLA tracking and reviewer assignment built-in.",
  },
  {
    icon: Shield,
    title: "Evidence Vault",
    description: "Secure document storage with tagging, expiration dates, and complete audit logging for every action.",
  },
  {
    icon: Settings2,
    title: "Rules Engine",
    description: "Define verification packages by vertical. Configure required proofs, expiration rules, and scoring logic.",
  },
  {
    icon: Users,
    title: "Reviewer Console",
    description: "Queue management, document comparison, decision checklists, and optional double validation workflows.",
  },
  {
    icon: BadgeCheck,
    title: "Trust Badges",
    description: "Public profile pages without PII. Embeddable widgets and verification status endpoints.",
  },
  {
    icon: Code2,
    title: "Developer API",
    description: "RESTful API with key rotation, scoped permissions, webhooks, and rate limiting.",
  },
  {
    icon: Clock,
    title: "Automated Renewals",
    description: "Expiration monitoring at 30/60 days. Automated reminders and renewal workflows.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "KPIs for approval rates, processing times, fraud flags, and upcoming expirations.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything you need to verify at scale
          </h2>
          <p className="text-lg text-muted-foreground">
            Complete orchestration platform for eligibility verification, proof management, and compliance workflows.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
