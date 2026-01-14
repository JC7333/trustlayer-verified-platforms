import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { usePlatform } from "@/hooks/usePlatform";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Loader2, 
  Send,
  CheckCircle2,
  FileText,
  RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ExpiringEvidence {
  id: string;
  document_name: string;
  document_type: string;
  expires_at: string;
  status: string;
  days_until_expiry: number;
  profile_id: string;
  end_user_profiles: {
    id: string;
    business_name: string;
    contact_email: string | null;
  };
}

const filterOptions = [
  { value: "all", label: "Tous" },
  { value: "expired", label: "Expirés" },
  { value: "7days", label: "Expire dans 7 jours" },
  { value: "30days", label: "Expire dans 30 jours" },
];

export default function Expirations() {
  const { currentPlatform, loading: platformLoading } = usePlatform();
  const [evidences, setEvidences] = useState<ExpiringEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [runningJob, setRunningJob] = useState(false);

  useEffect(() => {
    if (currentPlatform) {
      fetchExpiringEvidences();
    }
  }, [currentPlatform, filter]);

  const fetchExpiringEvidences = async () => {
    if (!currentPlatform) return;
    setLoading(true);

    try {
      const now = new Date();
      let query = supabase
        .from("evidences")
        .select(`
          id,
          document_name,
          document_type,
          expires_at,
          status,
          profile_id,
          end_user_profiles!inner(id, business_name, contact_email)
        `)
        .eq("platform_id", currentPlatform.id)
        .eq("review_status", "approved")
        .not("expires_at", "is", null)
        .order("expires_at", { ascending: true });

      // Apply date filter
      if (filter === "expired") {
        query = query.lt("expires_at", now.toISOString());
      } else if (filter === "7days") {
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        query = query.gte("expires_at", now.toISOString()).lte("expires_at", in7Days.toISOString());
      } else if (filter === "30days") {
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        query = query.gte("expires_at", now.toISOString()).lte("expires_at", in30Days.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate days until expiry
      const enrichedData = (data || []).map(evidence => {
        const expiryDate = new Date(evidence.expires_at);
        const daysUntil = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...evidence,
          days_until_expiry: daysUntil,
        };
      });

      setEvidences(enrichedData as ExpiringEvidence[]);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error fetching expirations:", err);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (evidence: ExpiringEvidence) => {
    if (!evidence.end_user_profiles.contact_email) {
      toast.error("Aucun email de contact pour ce prestataire");
      return;
    }

    setSendingReminder(evidence.id);
    try {
      // Create a magic link for the provider
      const { data: magicLinkData, error: magicLinkError } = await supabase.functions.invoke("create-magic-link", {
        body: {
          platform_id: currentPlatform?.id,
          end_user_id: evidence.profile_id,
          expires_in_days: 7,
        },
      });

      if (magicLinkError) throw magicLinkError;

      // Queue notification
      const { error: notifError } = await supabase.from("notifications_queue").insert({
        platform_id: currentPlatform?.id,
        end_user_id: evidence.profile_id,
        evidence_id: evidence.id,
        notification_type: evidence.days_until_expiry <= 0 ? "document_expired" : "expiry_reminder_manual",
        recipient_email: evidence.end_user_profiles.contact_email,
        subject: evidence.days_until_expiry <= 0 
          ? `Document expiré - Action requise`
          : `Votre document expire bientôt`,
        body: `Votre document "${evidence.document_name}" ${evidence.days_until_expiry <= 0 ? 'a expiré' : `expire dans ${evidence.days_until_expiry} jours`}. Veuillez le renouveler.`,
        metadata: {
          magic_link: magicLinkData?.magic_link,
          document_name: evidence.document_name,
          days_until_expiry: evidence.days_until_expiry,
        },
      });

      if (notifError) throw notifError;

      // Trigger send
      await supabase.functions.invoke("send-notification", {
        body: { process_pending: true },
      });

      toast.success("Relance envoyée");
    } catch (err: any) {
      if (import.meta.env.DEV) console.error("Error sending reminder:", err);
      toast.error("Erreur: " + (err.message || "Échec de l'envoi"));
    } finally {
      setSendingReminder(null);
    }
  };

  const runDailyJob = async () => {
    setRunningJob(true);
    try {
      const { data, error } = await supabase.functions.invoke("daily-expirations-job");
      
      if (error) throw error;
      
      toast.success(`Job exécuté: ${data?.notifications_created || 0} notifications créées`);
      fetchExpiringEvidences();
    } catch (err: any) {
      if (import.meta.env.DEV) console.error("Error running job:", err);
      toast.error("Erreur: " + (err.message || "Échec du job"));
    } finally {
      setRunningJob(false);
    }
  };

  const getExpiryBadge = (days: number) => {
    if (days <= 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
          Expiré
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
          J-{days}
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
        J-{days}
      </span>
    );
  };

  const expiredCount = evidences.filter(e => e.days_until_expiry <= 0).length;
  const urgentCount = evidences.filter(e => e.days_until_expiry > 0 && e.days_until_expiry <= 7).length;

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Expirations</h1>
            <p className="text-muted-foreground">
              {expiredCount > 0 && (
                <span className="text-destructive">{expiredCount} expiré{expiredCount > 1 ? 's' : ''}</span>
              )}
              {expiredCount > 0 && urgentCount > 0 && " · "}
              {urgentCount > 0 && (
                <span className="text-warning">{urgentCount} urgent{urgentCount > 1 ? 's' : ''}</span>
              )}
              {expiredCount === 0 && urgentCount === 0 && "Aucun document urgent"}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map(f => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={runDailyJob}
              disabled={runningJob}
            >
              {runningJob ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="hidden sm:inline ml-1">Exécuter job</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Expirés</span>
            </div>
            <p className="text-2xl font-bold">{expiredCount}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-warning mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">J-7</span>
            </div>
            <p className="text-2xl font-bold">{urgentCount}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">J-30</span>
            </div>
            <p className="text-2xl font-bold">
              {evidences.filter(e => e.days_until_expiry > 7 && e.days_until_expiry <= 30).length}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-success mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">{evidences.length}</p>
          </div>
        </div>

        {/* List */}
        {evidences.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Aucune expiration</h3>
            <p className="text-muted-foreground text-sm">
              Tous les documents sont à jour
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {evidences.map((evidence) => (
              <div
                key={evidence.id}
                className={`bg-card rounded-xl border p-4 ${
                  evidence.days_until_expiry <= 0 
                    ? "border-destructive/30" 
                    : evidence.days_until_expiry <= 7 
                    ? "border-warning/30" 
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    evidence.days_until_expiry <= 0 
                      ? "bg-destructive/10 text-destructive"
                      : evidence.days_until_expiry <= 7
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">{evidence.document_name}</h3>
                      {getExpiryBadge(evidence.days_until_expiry)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {evidence.end_user_profiles.business_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expire le {new Date(evidence.expires_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendReminder(evidence)}
                    disabled={sendingReminder === evidence.id || !evidence.end_user_profiles.contact_email}
                  >
                    {sendingReminder === evidence.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline ml-1">Relancer</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
