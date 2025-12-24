import { AppLayout } from "@/components/layout/AppLayout";
import { 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Zap,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const stats = [
  {
    label: "En attente de revue",
    value: "23",
    change: "+5",
    trend: "up",
    icon: Clock,
    color: "warning",
  },
  {
    label: "Approuvées (30j)",
    value: "156",
    change: "+12%",
    trend: "up",
    icon: CheckCircle2,
    color: "success",
  },
  {
    label: "Rejetées (30j)",
    value: "8",
    change: "-3%",
    trend: "down",
    icon: XCircle,
    color: "destructive",
  },
  {
    label: "Expirent bientôt",
    value: "12",
    change: "30j",
    trend: "neutral",
    icon: AlertTriangle,
    color: "warning",
  },
];

const recentRequests = [
  { id: "VER-001", profile: "Plomberie Dupont SARL", package: "Services-FR", status: "in_review", date: "Il y a 2h", score: 87 },
  { id: "VER-002", profile: "Dr. Marie Laurent", package: "Santé-FR", status: "approved", date: "Il y a 5h", score: 94 },
  { id: "VER-003", profile: "TechSupply GmbH", package: "Marketplace-B2B", status: "submitted", date: "Il y a 1j", score: null },
  { id: "VER-004", profile: "CleanHome Services", package: "Services-FR", status: "rejected", date: "Il y a 1j", score: 32 },
  { id: "VER-005", profile: "MédiCare Plus", package: "Santé-FR", status: "draft", date: "Il y a 2j", score: null },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-accent/10 text-accent",
  in_review: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  expired: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  submitted: "Soumise",
  in_review: "En revue",
  approved: "Approuvée",
  rejected: "Rejetée",
  expired: "Expirée",
};

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground">Vue d'ensemble de votre pipeline de vérification</p>
          </div>
          <Link to="/app/verifications/new">
            <Button variant="accent">
              <FileCheck className="h-4 w-4" />
              Nouvelle vérification
            </Button>
          </Link>
        </div>

        {/* AI Insights Banner */}
        <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent rounded-2xl p-6 border border-accent/20">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent text-accent-foreground shrink-0">
              <Brain className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Insights IA</h3>
              <p className="text-sm text-muted-foreground mb-3">
                3 documents en attente présentent des anomalies potentielles. 
                Le taux d'approbation a augmenté de 8% ce mois-ci.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-warning/10 text-warning">
                  <AlertTriangle className="h-3 w-3" />
                  2 documents expirés détectés
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-success/10 text-success">
                  <TrendingUp className="h-3 w-3" />
                  Temps de traitement -15%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-6 border border-border hover:border-accent/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  stat.color === "success" ? "bg-success/10 text-success" :
                  stat.color === "warning" ? "bg-warning/10 text-warning" :
                  stat.color === "destructive" ? "bg-destructive/10 text-destructive" :
                  "bg-accent/10 text-accent"
                }`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-success" :
                  stat.trend === "down" ? "text-destructive" :
                  "text-muted-foreground"
                }`}>
                  {stat.trend === "up" && <ArrowUpRight className="h-4 w-4" />}
                  {stat.trend === "down" && <ArrowDownRight className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Requests */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-semibold text-foreground">Demandes récentes</h2>
              <Link to="/app/verifications" className="text-sm text-accent hover:underline">
                Voir tout
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground font-mono text-xs">
                      {request.id.split("-")[1]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{request.profile}</p>
                      <p className="text-sm text-muted-foreground">{request.package}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {request.score && (
                      <div className={`hidden md:flex items-center gap-1 text-sm font-medium ${
                        request.score >= 70 ? "text-success" : request.score >= 40 ? "text-warning" : "text-destructive"
                      }`}>
                        <Zap className="h-3 w-3" />
                        {request.score}
                      </div>
                    )}
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                      {statusLabels[request.status]}
                    </span>
                    <span className="text-sm text-muted-foreground hidden sm:block">{request.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Actions rapides</h2>
            <div className="space-y-3">
              <Link to="/app/verifications/new">
                <Button variant="outline" className="w-full justify-start">
                  <FileCheck className="h-4 w-4" />
                  Créer une demande
                </Button>
              </Link>
              <Link to="/app/review">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4" />
                  Revue en attente (23)
                </Button>
              </Link>
              <Link to="/app/rules">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4" />
                  Gérer les packs
                </Button>
              </Link>
              <Link to="/app/api">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4" />
                  Clés API & webhooks
                </Button>
              </Link>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-accent" />
                <p className="text-sm font-medium text-foreground">Équipe</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                4 reviewers actifs • 2 en ligne
              </p>
              <Link to="/app/team">
                <Button variant="accent" size="sm" className="w-full">
                  Gérer l'équipe
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Expirent dans 30 jours</h2>
            <span className="text-sm text-warning font-medium">12 profils</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Dr. Jean Dupont", expires: "28 déc. 2024", type: "Licence médicale" },
              { name: "ProBuild SARL", expires: "5 jan. 2025", type: "Assurance RC" },
              { name: "HealthFirst", expires: "12 jan. 2025", type: "Certification" },
              { name: "TechServices Ltd", expires: "18 jan. 2025", type: "Kbis" },
            ].map((item) => (
              <div key={item.name} className="p-4 rounded-xl bg-warning/5 border border-warning/20 hover:border-warning/40 transition-colors cursor-pointer">
                <p className="font-medium text-foreground text-sm mb-1">{item.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{item.type}</p>
                <p className="text-xs text-warning font-medium">{item.expires}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
