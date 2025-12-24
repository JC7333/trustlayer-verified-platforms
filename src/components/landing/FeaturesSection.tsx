import { 
  FileCheck, 
  Shield, 
  Settings2, 
  Users, 
  Code2, 
  BadgeCheck,
  Clock,
  BarChart3,
  Brain,
  Palette,
  Zap,
  Globe
} from "lucide-react";

const features = [
  {
    icon: FileCheck,
    title: "Demandes de vérification",
    description: "Workflow complet avec états (brouillon → soumis → en revue → approuvé). Suivi des SLA et assignation aux reviewers.",
    color: "accent",
  },
  {
    icon: Shield,
    title: "Coffre-fort de preuves",
    description: "Stockage sécurisé des documents avec tags, dates d'expiration et journal d'audit complet de chaque action.",
    color: "success",
  },
  {
    icon: Brain,
    title: "IA Reviewer Assistant",
    description: "Détection automatique du type de document, OCR, suggestions d'approbation et alertes fraude en temps réel.",
    badge: "Nouveau",
    color: "accent",
  },
  {
    icon: Settings2,
    title: "Moteur de règles",
    description: "Définissez des packs de vérification par vertical. Configurez les preuves requises, expirations et scoring.",
    color: "warning",
  },
  {
    icon: Users,
    title: "Console Reviewer",
    description: "File d'attente, comparaison de documents, checklists de décision et workflow de double validation.",
    color: "accent",
  },
  {
    icon: BadgeCheck,
    title: "Badges de confiance",
    description: "Pages publiques sans données personnelles. Widgets intégrables et Trust Score™ configurable.",
    color: "success",
  },
  {
    icon: Palette,
    title: "White-label complet",
    description: "Personnalisez couleurs, logo, domaine et emails. Vos clients ne voient que votre marque.",
    badge: "Pro",
    color: "accent",
  },
  {
    icon: Code2,
    title: "API Developer",
    description: "API RESTful avec rotation de clés, webhooks temps réel, rate limiting et documentation interactive.",
    color: "accent",
  },
  {
    icon: Globe,
    title: "Passeport de vérification",
    description: "Identité vérifiée portable. Vos utilisateurs peuvent réutiliser leurs preuves sur d'autres plateformes.",
    badge: "Bientôt",
    color: "accent",
  },
  {
    icon: Clock,
    title: "Renouvellements auto",
    description: "Monitoring des expirations à 30/60 jours. Rappels automatiques et workflows de renouvellement.",
    color: "warning",
  },
  {
    icon: BarChart3,
    title: "Analytics avancés",
    description: "KPIs taux d'approbation, délais, alertes fraude, expirations. Export et intégration BI.",
    color: "accent",
  },
  {
    icon: Zap,
    title: "Intégrations natives",
    description: "Connecteurs Slack, email, CRM. Compatible Zapier, n8n et Make pour vos automatisations.",
    color: "success",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-accent/10 text-accent mb-4">
            Fonctionnalités
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Tout pour vérifier à l'échelle
          </h2>
          <p className="text-lg text-muted-foreground">
            Plateforme complète d'orchestration : de la collecte de preuves à la délivrance de badges de confiance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-accent/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {feature.badge && (
                <span className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  feature.badge === "Nouveau" ? "bg-success/10 text-success" :
                  feature.badge === "Pro" ? "bg-accent/10 text-accent" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {feature.badge}
                </span>
              )}
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 transition-all duration-300 ${
                feature.color === "success" ? "bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground" :
                feature.color === "warning" ? "bg-warning/10 text-warning group-hover:bg-warning group-hover:text-warning-foreground" :
                "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground"
              }`}>
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
