import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { usePlatform } from "@/hooks/usePlatform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  FileText,
  Calendar,
  ChevronRight,
  User,
  Mail,
  Phone,
  Zap,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  RefreshCw,
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
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface EvidenceWithProfile {
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
  extraction_confidence: number | null;

  // JSONB (IA) — on le typpe permissif pour éviter les erreurs TS VS Code
  ai_analysis: {
    doc_type?: string;
    name_or_company?: string;
    siret_siren?: string;
    expiry_date?: string;
    [key: string]: unknown;
  } | null;

  profile_id: string;
  platform_id: string;

  end_user_profiles: {
    id: string;
    business_name: string;
    contact_email: string | null;
    contact_phone: string | null;
    status: string;
  };
}

const rejectionReasons = [
  { value: "illisible", label: "Document illisible" },
  { value: "incomplet", label: "Document incomplet" },
  { value: "expire", label: "Document expiré" },
  { value: "non_conforme", label: "Document non conforme" },
  { value: "mauvais_type", label: "Mauvais type de document" },
  { value: "autre", label: "Autre" },
];

export default function Inbox() {
  const { currentPlatform, loading: platformLoading } = usePlatform();
  const { user } = useAuth();

  const [evidences, setEvidences] = useState<EvidenceWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedEvidence, setSelectedEvidence] =
    useState<EvidenceWithProfile | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  const [processing, setProcessing] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionComment, setRejectionComment] = useState("");

  useEffect(() => {
    if (currentPlatform) {
      fetchPendingEvidences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlatform]);

  const fetchPendingEvidences = async () => {
    if (!currentPlatform) return;

    try {
      const { data, error } = await supabase
        .from("evidences")
        .select(
          `
          *,
          end_user_profiles!inner(id, business_name, contact_email, contact_phone, status)
        `,
        )
        .eq("platform_id", currentPlatform.id)
        .eq("review_status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setEvidences((data as EvidenceWithProfile[]) || []);
    } catch (err) {
      console.error("Error fetching evidences:", err);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendingEvidences();
  };

  const openEvidence = async (evidence: EvidenceWithProfile) => {
    setSelectedEvidence(evidence);
    setLoadingUrl(true);
    setSignedUrl(null);

    try {
      const { data, error } = await supabase.storage
        .from("evidences")
        .createSignedUrl(evidence.file_path, 900);

      if (error) throw error;
      setSignedUrl(data.signedUrl);
    } catch (err) {
      console.error("Error getting signed URL:", err);
      toast.error("Erreur lors de l'accès au document");
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedEvidence || !user) return;

    setProcessing(true);
    try {
      // 1) Update evidence status (DB)
      const { error: updErr } = await supabase
        .from("evidences")
        .update({
          review_status: "approved",
          status: "approved",
          rejection_reason: null,
        })
        .eq("id", selectedEvidence.id);

      if (updErr) throw updErr;

      // 2) Audit log (server-only)
      const auditPayload = {
        platform_id: selectedEvidence.platform_id,
        action: "evidence_approved",
        entity_type: "evidence",
        entity_id: selectedEvidence.id,
        new_data: {
          document_type: selectedEvidence.document_type,
          business_name: selectedEvidence.end_user_profiles.business_name,
        },
      };

      const { error: auditErr } = await supabase.functions.invoke("log-audit", {
        body: auditPayload,
      });

      if (auditErr) throw auditErr;

      // 3) Check if provider can be marked as approved
      await checkAndUpdateProviderStatus(selectedEvidence.profile_id);

      toast.success("✓ Document validé");
      setSelectedEvidence(null);
      fetchPendingEvidences();
    } catch (err) {
      console.error("Error approving:", err);
      toast.error("Erreur lors de la validation");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedEvidence || !user || !rejectionReason) return;

    setProcessing(true);
    try {
      const reasonLabel =
        rejectionReasons.find((r) => r.value === rejectionReason)?.label ||
        rejectionReason;
      const fullReason = rejectionComment
        ? `${reasonLabel}: ${rejectionComment}`
        : reasonLabel;

      // 1) Update evidence status (DB)
      const { error: updErr } = await supabase
        .from("evidences")
        .update({
          review_status: "rejected",
          status: "rejected",
          rejection_reason: fullReason,
        })
        .eq("id", selectedEvidence.id);

      if (updErr) throw updErr;

      // 2) Audit log (server-only)
      const auditPayload = {
        platform_id: selectedEvidence.platform_id,
        action: "evidence_rejected",
        entity_type: "evidence",
        entity_id: selectedEvidence.id,
        new_data: {
          document_type: selectedEvidence.document_type,
          reason: fullReason,
          business_name: selectedEvidence.end_user_profiles.business_name,
        },
      };

      const { error: auditErr } = await supabase.functions.invoke("log-audit", {
        body: auditPayload,
      });

      if (auditErr) throw auditErr;

      // 3) Provider status -> needs_docs
      await supabase
        .from("end_user_profiles")
        .update({ status: "needs_docs", updated_at: new Date().toISOString() })
        .eq("id", selectedEvidence.profile_id);

      // TODO: Send rejection notification email (optionnel)

      toast.success("Document rejeté");
      setShowRejectModal(false);
      setRejectionReason("");
      setRejectionComment("");
      setSelectedEvidence(null);
      fetchPendingEvidences();
    } catch (err) {
      console.error("Error rejecting:", err);
      toast.error("Erreur lors du rejet");
    } finally {
      setProcessing(false);
    }
  };

  const checkAndUpdateProviderStatus = async (profileId: string) => {
    const { data: allEvidences } = await supabase
      .from("evidences")
      .select("review_status")
      .eq("profile_id", profileId);

    if (!allEvidences || allEvidences.length === 0) return;

    const allApproved = allEvidences.every(
      (e) => e.review_status === "approved",
    );

    if (allApproved) {
      await supabase
        .from("end_user_profiles")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", profileId);
    }
  };

  const filteredEvidences = evidences.filter(
    (e) =>
      e.end_user_profiles.business_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      e.document_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group by provider for better overview
  const groupedByProvider = filteredEvidences.reduce(
    (acc, evidence) => {
      const key = evidence.profile_id;
      if (!acc[key]) {
        acc[key] = {
          profile: evidence.end_user_profiles,
          evidences: [],
        };
      }
      acc[key].evidences.push(evidence);
      return acc;
    },
    {} as Record<
      string,
      {
        profile: EvidenceWithProfile["end_user_profiles"];
        evidences: EvidenceWithProfile[];
      }
    >,
  );

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
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-6 w-6 text-warning" />
              Inbox
            </h1>
            <p className="text-muted-foreground">
              {evidences.length} document{evidences.length !== 1 ? "s" : ""} en
              attente de validation
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>

            <Link to="/app/review">
              <Button variant="outline" size="sm">
                Tous les documents
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un prestataire ou document..."
            className="pl-10"
          />
        </div>

        {/* Empty state */}
        {filteredEvidences.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Inbox vide !
            </h3>
            <p className="text-muted-foreground mb-6">
              Tous les documents ont été traités.
            </p>
            <Link to="/app/review">
              <Button variant="outline">Voir l'historique</Button>
            </Link>
          </div>
        ) : (
          /* Providers with pending docs */
          <div className="space-y-4">
            {Object.entries(groupedByProvider).map(
              ([profileId, { profile, evidences: providerEvidences }]) => (
                <div
                  key={profileId}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  {/* Provider Header */}
                  <div className="p-4 border-b border-border bg-secondary/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {profile.business_name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {profile.contact_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {profile.contact_email}
                              </span>
                            )}
                            {profile.contact_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {profile.contact_phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-warning/10 text-warning border-warning/30"
                      >
                        {providerEvidences.length} à traiter
                      </Badge>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="divide-y divide-border">
                    {providerEvidences.map((evidence) => (
                      <div
                        key={evidence.id}
                        className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
                        onClick={() => openEvidence(evidence)}
                      >
                        <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-warning" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            {evidence.document_name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(evidence.created_at).toLocaleDateString(
                                "fr-FR",
                              )}
                            </span>

                            {evidence.extraction_confidence !== null && (
                              <span
                                className={`flex items-center gap-1 ${
                                  evidence.extraction_confidence >= 0.7
                                    ? "text-success"
                                    : evidence.extraction_confidence >= 0.4
                                      ? "text-warning"
                                      : "text-destructive"
                                }`}
                              >
                                <Zap className="h-3 w-3" />
                                IA:{" "}
                                {Math.round(
                                  evidence.extraction_confidence * 100,
                                )}
                                %
                              </span>
                            )}

                            {evidence.expires_at && (
                              <span
                                className={`flex items-center gap-1 ${
                                  new Date(evidence.expires_at) < new Date()
                                    ? "text-destructive"
                                    : ""
                                }`}
                              >
                                <Calendar className="h-3 w-3" />
                                Exp:{" "}
                                {new Date(
                                  evidence.expires_at,
                                ).toLocaleDateString("fr-FR")}
                              </span>
                            )}
                          </div>
                        </div>

                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                          Voir
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Evidence Preview Modal */}
      <Dialog
        open={!!selectedEvidence && !showRejectModal}
        onOpenChange={() => setSelectedEvidence(null)}
      >
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span>{selectedEvidence?.document_name}</span>
              <Badge variant="outline">
                {selectedEvidence?.end_user_profiles.business_name}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto min-h-0 grid lg:grid-cols-3 gap-4">
            {/* Document Preview */}
            <div className="lg:col-span-2 bg-secondary rounded-lg p-2">
              {loadingUrl ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : signedUrl ? (
                <>
                  {selectedEvidence?.mime_type?.startsWith("image/") ? (
                    <img
                      src={signedUrl}
                      alt={selectedEvidence?.document_name}
                      className="max-w-full h-auto mx-auto rounded max-h-[500px] object-contain"
                    />
                  ) : (
                    <iframe
                      src={signedUrl}
                      className="w-full h-[500px] rounded"
                      title={selectedEvidence?.document_name}
                    />
                  )}
                  <div className="mt-2 text-center">
                    <a
                      href={signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ouvrir en grand
                    </a>
                  </div>
                </>
              ) : null}
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              {/* AI Extraction */}
              {selectedEvidence?.ai_analysis && (
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-accent" />
                    Extraction IA
                    <Badge variant="outline" className="ml-auto text-xs">
                      {Math.round(
                        (selectedEvidence.extraction_confidence || 0) * 100,
                      )}
                      %
                    </Badge>
                  </h4>

                  <div className="space-y-2 text-sm">
                    {selectedEvidence.ai_analysis?.doc_type && (
                      <div>
                        <span className="text-muted-foreground">
                          Type détecté:
                        </span>
                        <p className="font-medium text-foreground">
                          {selectedEvidence.ai_analysis.doc_type}
                        </p>
                      </div>
                    )}

                    {selectedEvidence.ai_analysis?.name_or_company && (
                      <div>
                        <span className="text-muted-foreground">
                          Nom/Société:
                        </span>
                        <p className="font-medium text-foreground">
                          {selectedEvidence.ai_analysis.name_or_company}
                        </p>
                      </div>
                    )}

                    {selectedEvidence.ai_analysis?.siret_siren && (
                      <div>
                        <span className="text-muted-foreground">
                          SIRET/SIREN:
                        </span>
                        <p className="font-medium text-foreground font-mono">
                          {selectedEvidence.ai_analysis.siret_siren}
                        </p>
                      </div>
                    )}

                    {selectedEvidence.ai_analysis?.expiry_date && (
                      <div>
                        <span className="text-muted-foreground">
                          Date d'expiration:
                        </span>
                        <p className="font-medium text-foreground">
                          {selectedEvidence.ai_analysis.expiry_date}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document Info */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-3">
                  Informations
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">
                      {selectedEvidence?.document_type}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Soumis le</span>
                    <span className="font-medium">
                      {selectedEvidence &&
                        new Date(
                          selectedEvidence.created_at,
                        ).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  {selectedEvidence?.issued_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Date émission
                      </span>
                      <span className="font-medium">
                        {new Date(
                          selectedEvidence.issued_at,
                        ).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  )}

                  {selectedEvidence?.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expiration</span>
                      <span
                        className={`font-medium ${new Date(selectedEvidence.expires_at) < new Date() ? "text-destructive" : ""}`}
                      >
                        {new Date(
                          selectedEvidence.expires_at,
                        ).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Provider Info */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-3">
                  Prestataire
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">
                    {selectedEvidence?.end_user_profiles.business_name}
                  </p>
                  {selectedEvidence?.end_user_profiles.contact_email && (
                    <p className="text-muted-foreground">
                      {selectedEvidence.end_user_profiles.contact_email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-border pt-4 mt-4 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setShowRejectModal(true)}
              disabled={processing}
            >
              <ThumbsDown className="h-4 w-4" />
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
                <>
                  <ThumbsUp className="h-4 w-4" />
                  Approuver
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Rejeter le document
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Motif du rejet *
              </label>
              <Select
                value={rejectionReason}
                onValueChange={setRejectionReason}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un motif" />
                </SelectTrigger>
                <SelectContent>
                  {rejectionReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
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
                placeholder="Détails supplémentaires pour le prestataire..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowRejectModal(false)}
              disabled={processing}
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
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
