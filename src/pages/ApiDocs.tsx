import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Code2, 
  FileJson, 
  Webhook, 
  Key, 
  Clock, 
  Shield,
  Copy,
  ExternalLink,
  Zap,
  Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const endpoints = [
  {
    method: "POST",
    path: "/v1/verification-requests",
    description: "Créer une nouvelle demande de vérification pour un profil",
  },
  {
    method: "GET",
    path: "/v1/verification-requests/:id",
    description: "Récupérer une demande de vérification avec son statut actuel",
  },
  {
    method: "GET",
    path: "/v1/verification-requests",
    description: "Lister toutes les demandes avec filtres et pagination",
  },
  {
    method: "PATCH",
    path: "/v1/verification-requests/:id",
    description: "Mettre à jour une demande (soumettre, ajouter notes, etc.)",
  },
  {
    method: "GET",
    path: "/v1/profiles/:id",
    description: "Obtenir un profil prestataire avec son statut de vérification",
  },
  {
    method: "POST",
    path: "/v1/profiles/:id/evidences",
    description: "Uploader des documents justificatifs sur un profil",
  },
  {
    method: "GET",
    path: "/v1/profiles/:id/badge",
    description: "Obtenir le statut du badge public pour l'intégration",
  },
  {
    method: "GET",
    path: "/v1/packages",
    description: "Lister les packages de vérification disponibles",
  },
];

const webhookEvents = [
  { event: "verification.submitted", desc: "Une demande a été soumise" },
  { event: "verification.approved", desc: "Vérification approuvée" },
  { event: "verification.rejected", desc: "Vérification rejetée" },
  { event: "verification.expired", desc: "Vérification expirée" },
  { event: "evidence.uploaded", desc: "Document uploadé" },
  { event: "evidence.expiring_soon", desc: "Document expire bientôt" },
];

const codeExample = `// Créer une demande de vérification
const response = await fetch('https://api.trustlayer.io/v1/verification-requests', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <API_KEY>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    profile_id: 'prof_abc123',
    package_id: 'pkg_sante_fr',
    metadata: {
      internal_id: 'votre-reference-interne',
    },
  }),
});

const verification = await response.json();
// { id: 'ver_xyz789', status: 'draft', ... }`;

const badgeSnippet = `<!-- Widget Badge TrustLayer -->
<script src="https://cdn.trustlayer.io/badge.js"></script>
<div 
  data-trustlayer-badge="prof_abc123"
  data-theme="light"
  data-size="compact"
  data-lang="fr"
></div>`;

export default function ApiDocs() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier");
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      
      <main className="pt-24">
        {/* Header */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent text-accent-foreground mb-6">
                <Code2 className="h-7 w-7" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Documentation API
              </h1>
              <p className="text-lg text-muted-foreground">
                Intégrez TrustLayer dans votre plateforme avec notre API RESTful. 
                Contrôle total sur les workflows de vérification, la gestion des documents et l'intégration des badges.
              </p>
              <div className="flex items-center justify-center gap-4 mt-8">
                <Link to="/auth">
                  <Button variant="accent">Démarrer avec le sandbox</Button>
                </Link>
                <a href="#endpoints">
                  <Button variant="outline">
                    Référence complète
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="bg-card rounded-xl p-6 border border-border">
                <Key className="h-8 w-8 text-accent mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Clés API</h3>
                <p className="text-sm text-muted-foreground">
                  Générez et rotez vos clés par environnement avec des scopes de permissions.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <Webhook className="h-8 w-8 text-accent mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Webhooks</h3>
                <p className="text-sm text-muted-foreground">
                  Notifications temps réel pour les changements de statut et expirations.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <Clock className="h-8 w-8 text-accent mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Rate Limits</h3>
                <p className="text-sm text-muted-foreground">
                  Limites généreuses avec capacité de burst. Quotas dédiés pour Enterprise.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <Lock className="h-8 w-8 text-accent mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Sécurité</h3>
                <p className="text-sm text-muted-foreground">
                  HTTPS obligatoire, signatures webhook, et chiffrement bout en bout.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section id="endpoints" className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8">Points d'entrée principaux</h2>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Méthode</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Endpoint</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground hidden md:table-cell">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoints.map((endpoint, index) => (
                      <tr key={index} className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-mono font-semibold ${
                            endpoint.method === "GET" 
                              ? "bg-accent/10 text-accent" 
                              : endpoint.method === "POST"
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          }`}>
                            {endpoint.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-foreground">{endpoint.path}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">{endpoint.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8">Exemple rapide</h2>
              <div className="bg-primary rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-primary/80 border-b border-primary-foreground/10">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-primary-foreground/70">JavaScript</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(codeExample)}
                    className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Copier
                  </button>
                </div>
                <pre className="p-6 overflow-x-auto">
                  <code className="text-sm font-mono text-primary-foreground/90">{codeExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Webhooks */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">Événements Webhook</h2>
              <p className="text-muted-foreground mb-8">
                Abonnez-vous à ces événements pour recevoir des notifications temps réel sur le cycle de vie des vérifications.
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {webhookEvents.map((webhook) => (
                  <div key={webhook.event} className="bg-card rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <FileJson className="h-5 w-5 text-accent" />
                      <code className="text-sm font-mono text-foreground">{webhook.event}</code>
                    </div>
                    <p className="text-xs text-muted-foreground">{webhook.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Badge Widget */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">Widget Badge Intégrable</h2>
              <p className="text-muted-foreground mb-8">
                Affichez le statut de vérification sur votre plateforme avec notre widget léger et personnalisable.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-primary rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-primary/80 border-b border-primary-foreground/10">
                    <span className="text-sm font-medium text-primary-foreground/70">HTML</span>
                    <button 
                      onClick={() => copyToClipboard(badgeSnippet)}
                      className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      Copier
                    </button>
                  </div>
                  <pre className="p-6 overflow-x-auto">
                    <code className="text-sm font-mono text-primary-foreground/90">{badgeSnippet}</code>
                  </pre>
                </div>
                <div className="bg-card rounded-xl p-8 border border-border flex items-center justify-center">
                  <div className="flex items-center gap-3 bg-secondary rounded-lg px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-badge">
                      <Shield className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Prestataire Vérifié</span>
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground text-xs">✓</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Valide jusqu'au Déc 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 gradient-hero">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Prêt à intégrer ?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Créez votre compte sandbox gratuit et commencez à explorer notre API en quelques minutes.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/auth">
                <Button variant="hero" size="lg">
                  Créer un compte sandbox
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20">
                  Parler à un développeur
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
