import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { usePlatform } from "@/hooks/usePlatform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Send,
  Calendar,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Notification {
  id: string;
  notification_type: string;
  recipient_email: string | null;
  subject: string | null;
  status: string;
  created_at: string;
  sent_at: string | null;
  error_message: string | null;
  attempts: number | null;
  end_user_id: string | null;
  evidence_id: string | null;
  metadata: Record<string, unknown> | null;
}

const statusFilters = [
  { value: "all", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "sent", label: "Envoyés" },
  { value: "failed", label: "Échecs" },
];

const typeLabels: Record<string, string> = {
  expiration_reminder: "Rappel expiration",
  expired: "Document expiré",
  expiration_30d: "Expire J-30",
  expiration_7d: "Expire J-7",
  expiration_1d: "Expire J-1",
  document_rejected: "Document rejeté",
  document_approved: "Document validé",
  new_link: "Magic Link",
  deposit_confirmation: "Confirmation dépôt",
};

export default function Notifications() {
  const { currentPlatform, loading: platformLoading } = usePlatform();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [retrying, setRetrying] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!currentPlatform) return;

    try {
      let query = supabase
        .from("notifications_queue")
        .select("*")
        .eq("platform_id", currentPlatform.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      // Map data to include attempts with default value
      const mappedData: Notification[] = (data || []).map((n) => ({
        ...n,
        attempts: (n as unknown as { attempts?: number }).attempts ?? 0,
        metadata: n.metadata as Record<string, unknown> | null,
      }));
      setNotifications(mappedData);
    } catch (err) {
      if (import.meta.env.DEV)
        console.error("Error fetching notifications:", err);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [currentPlatform, statusFilter]);

  useEffect(() => {
    if (currentPlatform) {
      fetchNotifications();
    }
  }, [currentPlatform, fetchNotifications]);

  const handleRetry = async (notif: Notification) => {
    setRetrying(notif.id);
    try {
      const { error } = await supabase
        .from("notifications_queue")
        .update({
          status: "pending",
          error_message: null,
        })
        .eq("id", notif.id);

      if (error) throw error;
      toast.success("Notification remise en file d'attente");
      fetchNotifications();
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error retrying:", err);
      toast.error("Erreur lors de la relance");
    } finally {
      setRetrying(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success/20"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Envoyé
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Échec
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-warning/10 text-warning border-warning/20"
          >
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  const filteredNotifications = notifications.filter(
    (n) =>
      n.recipient_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === "sent").length,
    pending: notifications.filter((n) => n.status === "pending").length,
    failed: notifications.filter((n) => n.status === "failed").length,
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Suivi des emails envoyés aux prestataires
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.total}
                </p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.sent}
                </p>
                <p className="text-sm text-muted-foreground">Envoyés</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.pending}
                </p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.failed}
                </p>
                <p className="text-sm text-muted-foreground">Échecs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par email ou sujet..."
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => fetchNotifications()}>
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Actualiser</span>
          </Button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Aucune notification
            </h3>
            <p className="text-muted-foreground text-sm">
              Les emails envoyés apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      notif.status === "sent"
                        ? "bg-success/10 text-success"
                        : notif.status === "failed"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning"
                    }`}
                  >
                    <Send className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-foreground">
                        {typeLabels[notif.notification_type] ||
                          notif.notification_type}
                      </span>
                      {getStatusBadge(notif.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {notif.recipient_email || "Email non renseigné"}
                    </p>
                    {notif.subject && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {notif.subject}
                      </p>
                    )}
                    {notif.error_message && (
                      <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {notif.error_message}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(notif.created_at).toLocaleString("fr-FR")}
                      </span>
                      {notif.sent_at && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Envoyé:{" "}
                          {new Date(notif.sent_at).toLocaleString("fr-FR")}
                        </span>
                      )}
                      {(notif.attempts ?? 0) > 0 && (
                        <span>Tentatives: {notif.attempts}</span>
                      )}
                    </div>
                  </div>

                  {notif.status === "failed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetry(notif)}
                      disabled={retrying === notif.id}
                    >
                      {retrying === notif.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
