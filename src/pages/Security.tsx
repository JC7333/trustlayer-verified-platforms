import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { 
  Shield, 
  Lock, 
  Eye, 
  Server, 
  FileCheck, 
  Clock,
  Users,
  Globe,
  CheckCircle2,
  Database,
  Key
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const securityFeatures = [
  {
    icon: Lock,
    title: "Chiffrement au repos et en transit",
    description: "Toutes les données sont chiffrées avec AES-256 au repos et TLS 1.3 en transit. Les sauvegardes sont chiffrées et stockées dans des zones géographiquement séparées.",
  },
  {
    icon: Eye,
    title: "Minimisation des données",
    description: "Nous ne collectons et stockons que les données strictement nécessaires à la vérification. Aucune donnée personnelle n'est affichée sur les pages de badge public.",
  },
  {
    icon: Server,
    title: "Infrastructure sécurisée",
    description: "Hébergé sur une infrastructure certifiée SOC 2 Type II. Tests de pénétration réguliers et évaluations de vulnérabilités par des auditeurs indépendants.",
  },
  {
    icon: Clock,
    title: "Rétention configurable",
    description: "Chaque plateforme peut définir ses propres politiques de rétention des données. Purge automatique des preuves expirées selon votre configuration.",
  },
  {
    icon: Users,
    title: "Contrôle d'accès basé sur les rôles",
    description: "Permissions granulaires avec les rôles PlatformOwner, PlatformAdmin, Reviewer et Viewer. Audit trail complet de tous les accès et actions.",
  },
  {
    icon: FileCheck,
    title: "Audit trail complet",
    description: "Chaque action—uploads, reviews, décisions, appels API—est journalisée avec horodatage, utilisateur et IP. Logs d'audit immuables pour la conformité.",
  },
];

const certifications = [
  { name: "SOC 2 Type II", description: "Audit annuel des contrôles de sécurité, disponibilité et confidentialité", icon: Shield },
  { name: "Conforme RGPD", description: "Conformité totale avec les réglementations européennes de protection des données", icon: Globe },
  { name: "ISO 27001", description: "Certification du système de management de la sécurité de l'information", icon: FileCheck },
  { name: "Prêt HDS", description: "Disponible pour les plateformes de santé nécessitant l'hébergement de données de santé", icon: Database },
];

const rlsFeatures = [
  "Isolation au niveau base de données via politiques RLS",
  "Buckets de stockage séparés par plateforme",
  "Clés API scopées par plateforme",
  "Logs d'audit indépendants",
];

const roleFeatures = [
  "PlatformOwner : Configuration complète de la plateforme",
  "PlatformAdmin : Gestion des utilisateurs et paramètres",
  "Reviewer : Revue et décision sur les vérifications",
  "Viewer : Accès en lecture seule aux données",
];

export default function Security() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      
      <main className="pt-24">
        {/* Header */}
        <section className="py-16 gradient-hero">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent shadow-glow mb-6">
                <Shield className="h-8 w-8 text-accent-foreground" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-primary-foreground mb-4">
                Sécurité & Confidentialité
              </h1>
              <p className="text-lg text-primary-foreground/70">
                TrustLayer est construit avec la sécurité et la confidentialité au cœur de son architecture. 
                Nous traitons les données de vérification sensibles avec le plus grand soin et la plus grande transparence.
              </p>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Comment nous protégeons vos données
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {securityFeatures.map((feature) => (
                  <div key={feature.title} className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RLS & Multi-tenancy */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Key className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Isolation Multi-Tenant</h2>
              </div>
              <p className="text-muted-foreground mb-8">
                TrustLayer utilise la Row-Level Security (RLS) pour garantir une isolation complète des données entre les plateformes. 
                Chaque plateforme ne peut accéder qu'à ses propres profils, demandes de vérification et preuves.
              </p>
              <div className="bg-card rounded-xl p-8 border border-border">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Database className="h-5 w-5 text-accent" />
                      Isolation des plateformes
                    </h3>
                    <ul className="space-y-3">
                      {rlsFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-accent" />
                      Séparation des rôles utilisateurs
                    </h3>
                    <ul className="space-y-3">
                      {roleFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Certifications & Conformité
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {certifications.map((cert) => (
                  <div key={cert.name} className="flex items-start gap-4 bg-card rounded-xl p-6 border border-border">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                      <cert.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data Processing */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">Traitement des données & Confidentialité</h2>
              <div className="bg-card rounded-xl p-8 border border-border space-y-6 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Responsable vs Sous-traitant</h3>
                  <p className="text-sm">
                    TrustLayer agit en tant que Sous-traitant pour le compte de nos plateformes clientes (Responsables de traitement). 
                    Nous traitons les données personnelles uniquement selon les instructions de la plateforme et conformément à notre 
                    Accord de Traitement des Données (DPA).
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Sous-traitants ultérieurs</h3>
                  <p className="text-sm">
                    Nous maintenons une liste transparente des sous-traitants ultérieurs. Tous font l'objet d'un examen de sécurité 
                    et signent des accords de protection des données contraignants. Les modifications majeures sont communiquées 30 jours à l'avance.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Localisation des données</h3>
                  <p className="text-sm">
                    Les données sont stockées dans des centres de données européens par défaut. Les clients Enterprise peuvent demander 
                    des options de déploiement géographique spécifiques pour répondre aux exigences locales de résidence des données.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Droits des personnes concernées</h3>
                  <p className="text-sm">
                    Nous fournissons des outils et des API pour aider les plateformes à répondre aux demandes d'accès (DSAR), 
                    de suppression et de portabilité dans les délais réglementaires.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 gradient-hero">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Des questions sur notre sécurité ?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Notre équipe sécurité est disponible pour répondre à vos questions et vous fournir 
              notre rapport SOC 2 et autres documents de conformité.
            </p>
            <Link to="/contact">
              <Button variant="hero" size="lg">
                Contacter l'équipe sécurité
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
