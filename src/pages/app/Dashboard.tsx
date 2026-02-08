import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { usePlatform } from "@/hooks/usePlatform";
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
  Users,
  Inbox,
  Loader2,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DashboardStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  expiringCount: number;
}

interface RecentEvidence {
  id: string;
  document_name: string;
  review_status: string;
  created_at: string;
  extraction_confidence: number | null;
  end_user_profiles: {
    business_name: string;
  };
}

interface ExpiringEvidence {
  id: string;
  document_name: string;
  expires_at: string;
  end_user_profiles: {
    business_name: string;
  };
}

export default function Dashboard() {
  const { currentPlatform, loading: platformLoading } = usePlatform();
  const [stats, setStats] = useState<DashboardStats>({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    expiringCount: 0,
  });
  const [recentEvidences, setRecentEvidences] = useState<RecentEvidence[]>([]);
  const [expiringDocs, setExpiringDocs] = useState<ExpiringEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!currentPlatform) return;

    try {
      // Fetch counts
      const [pendingRes, approvedRes, rejectedRes, expiringRes] =
        await Promise.all([
          supabase
            .from("evidences")
            .select("id", { count: "exact", head: true })
            .eq("platform_id", currentPlatform.id)
            .eq("review_status", "pending"),
          supabase
            .from("evidences")
            .select("id", { count: "exact", head: true })
            .eq("platform_id", currentPlatform.id)
            .eq("review_status", "approved"),
          supabase
            .from("evidences")
            .select("id", { count: "exact", head: true })
            .eq("platform_id", currentPlatform.id)
            .eq("review_status", "rejected"),
          supabase
            .from("evidences")
            .select("id", { count: "exact", head: true })
            .eq("platform_id", currentPlatform.id)
            .eq("review_status", "approved")
            .not("expires_at", "is", null)
            .lte(
              "expires_at",
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            )
            .gte("expires_at", new Date().toISOString()),
        ]);

      setStats({
        pendingCount: pendingRes.count || 0,
        approvedCount: approvedRes.count || 0,
        rejectedCount: rejectedRes.count || 0,
        expiringCount: expiringRes.count || 0,
      });

      // Fetch recent evidences
      const { data: recent } = await supabase
        .from("evidences")
        .select(
          `
          id, document_name, review_status, created_at, extraction_confidence,
          end_user_profiles!inner(business_name)
        `,
        )
        .eq("platform_id", currentPlatform.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentEvidences(recent || []);

      // Fetch expiring soon
      const thirtyDaysFromNow = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const { data: expiring } = await supabase
        .from("evidences")
        .select(
          `
          id, document_name, expires_at,
          end_user_profiles!inner(business_name)
        `,
        )
        .eq("platform_id", currentPlatform.id)
        .eq("review_status", "approved")
        .not("expires_at", "is", null)
        .lte("expires_at", thirtyDaysFromNow)
        .gte("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: true })
        .limit(4);

      setExpiringDocs(expiring || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPlatform]);

  useEffect(() => {
    if (currentPlatform) {
      fetchDashboardData();
    }
  }, [currentPlatform, fetchDashboardData]);

  const handleExport = async () => {
    if (!currentPlatform) return;

    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-audit", {
        body: { platform_id: currentPlatform.id },
      });

      if (error) throw error;

      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Export téléchargé");
    } catch (err) {
      console.error("Error exporting:", err);
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    approved: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
  };

  const statusLabels: Record<string, string> = {
    pending: "À traiter",
    approved: "Validé",
    rejected: "Rejeté",
  };

  if (platformLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const statsCards = [
    {
      label: "En attente de revue",
      value: stats.pendingCount.toString(),
      icon: Clock,
      color: "warning",
      link: "/app/inbox",
    },
    {
      label: "Documents validés",
      value: stats.approvedCount.toString(),
      icon: CheckCircle2,
      color: "success",
      link: "/app/review",
    },
    {
      label: "Documents rejetés",
      value: stats.rejectedCount.toString(),
      icon: XCircle,
      color: "destructive",
      link: "/app/review",
    },
    {
      label: "Expirent sous 30j",
      value: stats.expiringCount.toString(),
      icon: AlertTriangle,
      color: "warning",
      link: "/app/expirations",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Tableau de bord
            </h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de votre pipeline de vérification
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Audit
            </Button>
            <Link to="/app/providers">
              <Button variant="accent">
                <FileCheck className="h-4 w-4" />
                Nouveau prestataire
              </Button>
            </Link>
          </div>
        </div>

        {/* Urgent Action Banner */}
        {stats.pendingCount > 0 && (
          <Link to="/app/inbox">
            <div className="bg-gradient-to-r from-warning/20 via-warning/10 to-transparent rounded-2xl p-6 border border-warning/30 hover:border-warning/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20 text-warning shrink-0">
                  <Inbox className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {stats.pendingCount} document
                    {stats.pendingCount > 1 ? "s" : ""} en attente
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Cliquez pour accéder à l'Inbox et traiter les documents en
                    attente de validation.
                  </p>
                </div>
                <Button variant="warning" size="sm" className="shrink-0">
                  Ouvrir l'Inbox
                </Button>
              </div>
            </div>
          </Link>
        )}

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <Link key={stat.label} to={stat.link}>
              <div className="bg-card rounded-xl p-6 border border-border hover:border-accent/30 transition-colors cursor-pointer h-full">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      stat.color === "success"
                        ? "bg-success/10 text-success"
                        : stat.color === "warning"
                          ? "bg-warning/10 text-warning"
                          : stat.color === "destructive"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-accent/10 text-accent"
                    }`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Evidences */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-semibold text-foreground">
                Documents récents
              </h2>
              <Link
                to="/app/review"
                className="text-sm text-accent hover:underline"
              >
                Voir tout
              </Link>
            </div>
            {recentEvidences.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Aucun document soumis pour le moment
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentEvidences.map((evidence) => (
                  <Link key={evidence.id} to="/app/review">
                    <div className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                          <FileCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {evidence.document_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {evidence.end_user_profiles.business_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {evidence.extraction_confidence !== null && (
                          <div
                            className={`hidden md:flex items-center gap-1 text-sm font-medium ${
                              evidence.extraction_confidence >= 0.7
                                ? "text-success"
                                : evidence.extraction_confidence >= 0.4
                                  ? "text-warning"
                                  : "text-destructive"
                            }`}
                          >
                            <Zap className="h-3 w-3" />
                            {Math.round(evidence.extraction_confidence * 100)}%
                          </div>
                        )}
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[evidence.review_status]}`}
                        >
                          {statusLabels[evidence.review_status]}
                        </span>
                        <span className="text-sm text-muted-foreground hidden sm:block">
                          {new Date(evidence.created_at).toLocaleDateString(
                            "fr-FR",
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">
              Actions rapides
            </h2>
            <div className="space-y-3">
              <Link to="/app/inbox">
                <Button variant="outline" className="w-full justify-start">
                  <Inbox className="h-4 w-4" />
                  Inbox ({stats.pendingCount})
                </Button>
              </Link>
              <Link to="/app/providers">
                <Button variant="outline" className="w-full justify-start">
                  <FileCheck className="h-4 w-4" />
                  Ajouter un prestataire
                </Button>
              </Link>
              <Link to="/app/review">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4" />
                  Console de revue
                </Button>
              </Link>
              <Link to="/app/rules">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4" />
                  Gérer les packs
                </Button>
              </Link>
              <Link to="/app/expirations">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4" />
                  Expirations
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Expiring Soon */}
        {expiringDocs.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Expirent dans 30 jours
              </h2>
              <Link to="/app/expirations">
                <Button variant="ghost" size="sm">
                  Voir tout
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {expiringDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-warning/5 border border-warning/20 hover:border-warning/40 transition-colors"
                >
                  <p className="font-medium text-foreground text-sm mb-1 truncate">
                    {doc.end_user_profiles.business_name}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2 truncate">
                    {doc.document_name}
                  </p>
                  <p className="text-xs text-warning font-medium">
                    {new Date(doc.expires_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
