import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  FileText, 
  Loader2,
  Shield,
  ChevronRight,
  X,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  document_type: string;
  is_required: boolean;
  expiration_days: number | null;
}

interface ExistingEvidence {
  id: string;
  document_type: string;
  document_name: string;
  status: string;
  review_status: string;
  expires_at: string | null;
  created_at: string;
}

interface PlatformInfo {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
}

interface EndUserInfo {
  id: string;
  business_name: string;
  status: string;
}

export default function ProviderUpload() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<PlatformInfo | null>(null);
  const [endUser, setEndUser] = useState<EndUserInfo | null>(null);
  const [requiredDocs, setRequiredDocs] = useState<RequiredDocument[]>([]);
  const [existingEvidences, setExistingEvidences] = useState<ExistingEvidence[]>([]);
  const [magicLinkId, setMagicLinkId] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<RequiredDocument | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ file: File; docType: string } | null>(null);
  const [manualDates, setManualDates] = useState({ issued_at: "", expires_at: "" });

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setError("Lien invalide");
      setLoading(false);
      return;
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke("validate-magic-link", {
        body: { token },
      });

      if (fnError || !data?.valid) {
        setError(data?.error || "Lien invalide ou expiré");
        setLoading(false);
        return;
      }

      setPlatform(data.platform);
      setEndUser(data.end_user);
      setRequiredDocs(data.required_documents || []);
      setExistingEvidences(data.existing_evidences || []);
      setMagicLinkId(data.magic_link_id);
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const getDocumentStatus = (docType: string): { status: "missing" | "pending" | "approved" | "rejected" | "expired"; evidence?: ExistingEvidence } => {
    const evidence = existingEvidences.find(e => e.document_type === docType);
    if (!evidence) return { status: "missing" };
    
    if (evidence.expires_at && new Date(evidence.expires_at) < new Date()) {
      return { status: "expired", evidence };
    }
    
    if (evidence.review_status === "approved") return { status: "approved", evidence };
    if (evidence.review_status === "rejected") return { status: "rejected", evidence };
    return { status: "pending", evidence };
  };

  const handleFileSelect = async (doc: RequiredDocument, file: File) => {
    // Check if the document type requires dates
    if (doc.expiration_days) {
      setPendingFile({ file, docType: doc.document_type });
      setSelectedDoc(doc);
      setShowDateModal(true);
      return;
    }
    
    await uploadFile(doc, file);
  };

  const uploadFile = async (doc: RequiredDocument, file: File, dates?: { issued_at?: string; expires_at?: string }) => {
    if (!token) return;

    setUploadingDoc(doc.document_type);
    
    try {
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      const { data, error: fnError } = await supabase.functions.invoke("submit-evidence", {
        body: {
          token,
          document_type: doc.document_type,
          document_name: doc.name,
          file_base64: base64,
          mime_type: file.type,
          ...dates,
        },
      });

      if (fnError || !data?.success) {
        throw new Error(data?.error || "Échec de l'upload");
      }

      toast.success(`${doc.name} téléversé avec succès`);
      
      // Refresh evidences
      await validateToken();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'upload");
    } finally {
      setUploadingDoc(null);
      setShowDateModal(false);
      setPendingFile(null);
      setManualDates({ issued_at: "", expires_at: "" });
    }
  };

  const handleDateSubmit = async () => {
    if (!pendingFile || !selectedDoc) return;
    await uploadFile(selectedDoc, pendingFile.file, {
      issued_at: manualDates.issued_at || undefined,
      expires_at: manualDates.expires_at || undefined,
    });
  };

  const completedCount = requiredDocs.filter(doc => {
    const status = getDocumentStatus(doc.document_type);
    return status.status === "approved" || status.status === "pending";
  }).length;

  const progress = requiredDocs.length > 0 ? (completedCount / requiredDocs.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Lien invalide</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <p className="text-sm text-muted-foreground">
            Contactez votre plateforme pour obtenir un nouveau lien d'accès.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {platform?.logo_url ? (
              <img src={platform.logo_url} alt={platform.name} className="h-8 w-auto" />
            ) : (
              <div 
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: platform?.primary_color || "#0F4C81" }}
              >
                {platform?.name?.charAt(0) || "P"}
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground text-sm">{platform?.name}</p>
              <p className="text-xs text-muted-foreground">Portail prestataire</p>
            </div>
          </div>
          <Shield className="h-5 w-5 text-success" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 pb-24">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground mb-1">
            Bienvenue, {endUser?.business_name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Téléversez vos documents pour valider votre profil
          </p>
        </div>

        {/* Progress */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progression</span>
            <span className="text-sm text-muted-foreground">
              {completedCount} / {requiredDocs.length} documents
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          {progress === 100 && (
            <p className="text-sm text-success mt-2 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Tous les documents sont soumis !
            </p>
          )}
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {requiredDocs.map((doc) => {
            const docStatus = getDocumentStatus(doc.document_type);
            const isUploading = uploadingDoc === doc.document_type;

            return (
              <div
                key={doc.id}
                className={`bg-card rounded-xl border p-4 transition-all ${
                  docStatus.status === "approved" 
                    ? "border-success/30 bg-success/5" 
                    : docStatus.status === "rejected" || docStatus.status === "expired"
                    ? "border-destructive/30 bg-destructive/5"
                    : docStatus.status === "pending"
                    ? "border-warning/30 bg-warning/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    docStatus.status === "approved" 
                      ? "bg-success/10 text-success" 
                      : docStatus.status === "rejected" || docStatus.status === "expired"
                      ? "bg-destructive/10 text-destructive"
                      : docStatus.status === "pending"
                      ? "bg-warning/10 text-warning"
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {docStatus.status === "approved" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : docStatus.status === "rejected" || docStatus.status === "expired" ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : docStatus.status === "pending" ? (
                      <Loader2 className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground text-sm">{doc.name}</h3>
                      {doc.is_required && (
                        <span className="text-xs text-destructive">Obligatoire</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{doc.description}</p>
                    
                    {docStatus.status === "approved" && (
                      <p className="text-xs text-success">Document validé</p>
                    )}
                    {docStatus.status === "pending" && (
                      <p className="text-xs text-warning">En cours de vérification</p>
                    )}
                    {docStatus.status === "rejected" && (
                      <p className="text-xs text-destructive">Document rejeté - veuillez en soumettre un nouveau</p>
                    )}
                    {docStatus.status === "expired" && (
                      <p className="text-xs text-destructive">Document expiré - veuillez en soumettre un nouveau</p>
                    )}
                  </div>

                  {(docStatus.status === "missing" || docStatus.status === "rejected" || docStatus.status === "expired") && (
                    <label className="shrink-0">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(doc, file);
                        }}
                        disabled={isUploading}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="pointer-events-none"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Camera className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Photo</span>
                          </>
                        )}
                      </Button>
                    </label>
                  )}

                  {docStatus.status === "approved" && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Formats acceptés : JPEG, PNG, PDF (max 10 Mo)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Vos documents sont sécurisés et accessibles uniquement par {platform?.name}
          </p>
        </div>
      </main>

      {/* Date Modal */}
      {showDateModal && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Dates du document</h3>
              <button onClick={() => setShowDateModal(false)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Veuillez indiquer les dates figurant sur le document "{selectedDoc.name}"
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Date d'émission
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={manualDates.issued_at}
                    onChange={(e) => setManualDates(prev => ({ ...prev, issued_at: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Date d'expiration
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={manualDates.expires_at}
                    onChange={(e) => setManualDates(prev => ({ ...prev, expires_at: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowDateModal(false)}>
                Annuler
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleDateSubmit}
                disabled={uploadingDoc !== null}
              >
                {uploadingDoc ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Envoyer"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
