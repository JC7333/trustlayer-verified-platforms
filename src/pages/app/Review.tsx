import { useState, useEffect } from "react";
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
  AlertTriangle,
  Eye,
  Loader2,
  FileText,
  Calendar,
  Download,
  X,
  MessageSquare
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Evidence {
  id: string;
  document_type: string;
  document_name: string;
  file_path: string;
  mime_type: string;
  status: string;
  review_status: string;
  issued_at: string | null;
  expires_at: string | null;
  created_at: string;
  rejection_reason: string | null;
  profile_id: string;
  platform_id: string;
  end_user_profiles: {
    id: string;
    business_name: string;
    contact_email: string | null;
  };
}

const statusFilters = [
  { value: "all", label: "Tous" },
  { value: "pending", label: "À traiter" },
  { value: "approved", label: "Validés" },
  { value: "rejected", label: "Rejetés" },
];

const rejectionReasons = [
  "Document illisible",
  "Document incomplet",
  "Document expiré",
  "Document non conforme",
  "Informations incorrectes",
  "Autre",
];

export default function Review() {
  const { currentPlatform, loading: platformLoading } = usePlatform();
  const { user } = useAuth();
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionComment, setRejectionComment] = useState("");
  const [processing, setProcessing] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (currentPlatform) {
      fetchEvidences();
    }
  }, [currentPlatform, statusFilter]);

  const fetchEvidences = async () => {
    if (!currentPlatform) return;

    try {
      let query = supabase
        .from("evidences")
        .select(`
          *,
          end_user_profiles!inner(id, business_name, contact_email)
        `)
        .eq("platform_id", currentPlatform.id)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("review_status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvidences(data || []);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error fetching evidences:", err);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const openEvidence = async (evidence: Evidence) => {
    setSelectedEvidence(evidence);
    setLoadingUrl(true);
    setSignedUrl(null);

    try {
      const { data, error } = await supabase.storage
        .from("evidences")
        .createSignedUrl(evidence.file_path, 900); // 15 minutes

      if (error) throw error;
      setSignedUrl(data.signedUrl);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error getting signed URL:", err);
      toast.error("Erreur lors de l'accès au document");
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedEvidence || !user) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from("evidences")
        .update({
          review_status: "approved",
          status: "valid",
          reviewer_id: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedEvidence.id);

      if (error) throw error;

      // Log action
      await supabase.from("audit_logs").insert({
        platform_id: selectedEvidence.platform_id,
        user_id: user.id,
        action: "evidence_approved",
        entity_type: "evidence",
        entity_id: selectedEvidence.id,
        new_data: { document_type: selectedEvidence.document_type },
      });

      // Check if all required docs are approved -> update end_user status
      await checkAndUpdateEndUserStatus(selectedEvidence.profile_id);

      toast.success("Document validé");
      setSelectedEvidence(null);
      fetchEvidences();
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error approving:", err);
      toast.error("Erreur lors de la validation");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedEvidence || !user || !rejectionReason) return;

    setProcessing(true);
    try {
      const fullReason = rejectionComment 
        ? `${rejectionReason}: ${rejectionComment}` 
        : rejectionReason;

      const { error } = await supabase
        .from("evidences")
        .update({
          review_status: "rejected",
          status: "rejected",
          reviewer_id: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: fullReason,
        })
        .eq("id", selectedEvidence.id);

      if (error) throw error;

      // Log action
      await supabase.from("audit_logs").insert({
        platform_id: selectedEvidence.platform_id,
        user_id: user.id,
        action: "evidence_rejected",
        entity_type: "evidence",
        entity_id: selectedEvidence.id,
        new_data: { 
          document_type: selectedEvidence.document_type,
          reason: fullReason,
        },
      });

      // Update end_user status to needs_docs
      await supabase
        .from("end_user_profiles")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", selectedEvidence.profile_id);

      toast.success("Document rejeté");
      setShowRejectModal(false);
      setRejectionReason("");
      setRejectionComment("");
      setSelectedEvidence(null);
      fetchEvidences();
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error rejecting:", err);
      toast.error("Erreur lors du rejet");
    } finally {
      setProcessing(false);
    }
  };

  const checkAndUpdateEndUserStatus = async (profileId: string) => {
    // Get all evidences for this profile
    const { data: allEvidences } = await supabase
      .from("evidences")
      .select("review_status")
      .eq("profile_id", profileId);

    if (!allEvidences) return;

    const allApproved = allEvidences.length > 0 && 
      allEvidences.every(e => e.review_status === "approved");

    if (allApproved) {
      await supabase
        .from("end_user_profiles")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", profileId);
    }
  };

  const handleExport = async () => {
    if (!currentPlatform) return;
    
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-audit", {
        body: { platform_id: currentPlatform.id },
      });

      if (error) throw error;

      // Download the CSV
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
      if (import.meta.env.DEV) console.error("Error exporting:", err);
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  const filteredEvidences = evidences.filter(e =>
    e.end_user_profiles.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.document_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = evidences.filter(e => e.review_status === "pending").length;

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
          <h1 className="text-2xl font-bold text-foreground">Console de revue</h1>
          <p className="text-muted-foreground">
            {pendingCount} document{pendingCount !== 1 ? "s" : ""} en attente de vérification
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map(f => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <span className="hidden sm:inline ml-1">Export CSV</span>
          </Button>
        </div>

        {/* Evidence List */}
        {filteredEvidences.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              {statusFilter === "pending" ? "Aucun document en attente" : "Aucun document"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {statusFilter === "pending" 
                ? "Tous les documents ont été traités !" 
                : "Modifiez vos filtres pour voir d'autres résultats"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEvidences.map((evidence) => (
              <div
                key={evidence.id}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => openEvidence(evidence)}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${
                    evidence.review_status === "approved" 
                      ? "bg-success/10 text-success"
                      : evidence.review_status === "rejected"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-warning/10 text-warning"
                  }`}>
                    <FileText className="h-6 w-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{evidence.document_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        evidence.review_status === "approved" 
                          ? "bg-success/10 text-success"
                          : evidence.review_status === "rejected"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning"
                      }`}>
                        {evidence.review_status === "approved" ? "Validé" : 
                         evidence.review_status === "rejected" ? "Rejeté" : "À traiter"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {evidence.end_user_profiles.business_name}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(evidence.created_at).toLocaleDateString("fr-FR")}
                      </span>
                      {evidence.expires_at && (
                        <span className={`flex items-center gap-1 ${
                          new Date(evidence.expires_at) < new Date() ? "text-destructive" : ""
                        }`}>
                          <Calendar className="h-3 w-3" />
                          Expire: {new Date(evidence.expires_at).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Preview Modal */}
      <Dialog open={!!selectedEvidence} onOpenChange={() => setSelectedEvidence(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedEvidence?.document_name}</span>
              {selectedEvidence && (
                <span className="text-sm font-normal text-muted-foreground">
                  {selectedEvidence.end_user_profiles.business_name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto min-h-0">
            {loadingUrl ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : signedUrl ? (
              <div className="bg-secondary rounded-lg p-2">
                {selectedEvidence?.mime_type?.startsWith("image/") ? (
                  <img 
                    src={signedUrl} 
                    alt={selectedEvidence?.document_name} 
                    className="max-w-full h-auto mx-auto rounded"
                  />
                ) : (
                  <iframe
                    src={signedUrl}
                    className="w-full h-[500px] rounded"
                    title={selectedEvidence?.document_name}
                  />
                )}
              </div>
            ) : null}
          </div>

          {/* Document Info */}
          {selectedEvidence && (
            <div className="border-t border-border pt-4 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium text-foreground">{selectedEvidence.document_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Soumis le</p>
                  <p className="font-medium text-foreground">
                    {new Date(selectedEvidence.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {selectedEvidence.issued_at && (
                  <div>
                    <p className="text-muted-foreground">Date d'émission</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedEvidence.issued_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
                {selectedEvidence.expires_at && (
                  <div>
                    <p className="text-muted-foreground">Expire le</p>
                    <p className={`font-medium ${
                      new Date(selectedEvidence.expires_at) < new Date() 
                        ? "text-destructive" 
                        : "text-foreground"
                    }`}>
                      {new Date(selectedEvidence.expires_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
              </div>

              {selectedEvidence.rejection_reason && (
                <div className="p-3 bg-destructive/10 rounded-lg mb-4">
                  <p className="text-sm text-destructive font-medium">Motif de rejet :</p>
                  <p className="text-sm text-destructive">{selectedEvidence.rejection_reason}</p>
                </div>
              )}

              {/* Actions */}
              {selectedEvidence.review_status === "pending" && (
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowRejectModal(true)}
                    disabled={processing}
                  >
                    <XCircle className="h-4 w-4 text-destructive" />
                    Rejeter
                  </Button>
                  <Button 
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={handleApprove}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Valider
                  </Button>
                </div>
              )}

              {signedUrl && (
                <div className="mt-3">
                  <a 
                    href={signedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger le document
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Motif du rejet *
              </label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un motif" />
                </SelectTrigger>
                <SelectContent>
                  {rejectionReasons.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Commentaire (optionnel)
              </label>
              <Textarea
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="Précisions supplémentaires..."
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowRejectModal(false)}
              >
                Annuler
              </Button>
              <Button 
                variant="destructive"
                className="flex-1"
                onClick={handleReject}
                disabled={!rejectionReason || processing}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirmer le rejet"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
