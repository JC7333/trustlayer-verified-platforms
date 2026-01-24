import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { usePlatform } from "@/hooks/usePlatform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Plus, Search, Copy, Mail, Phone } from "lucide-react";

type Provider = {
  id: string;
  business_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
};

function isValidEmail(email: string): boolean {
  const e = email.trim();
  // volontairement simple et robuste
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function normalizePhoneToE164(raw: string): string {
  const input = raw.trim();

  // remove spaces, dots, dashes, parentheses
  const cleaned = input.replace(/[()\-\s.]/g, "");

  // already looks like +XXXXXXXX
  if (/^\+[1-9]\d{7,14}$/.test(cleaned)) return cleaned;

  // FR convenience: 06XXXXXXXX -> +336XXXXXXXX
  const digitsOnly = cleaned.replace(/[^\d]/g, "");
  if (digitsOnly.length === 10 && digitsOnly.startsWith("0")) {
    return `+33${digitsOnly.slice(1)}`;
  }

  // fallback: if user typed digits only, we prepend +
  if (/^\d{8,15}$/.test(digitsOnly)) {
    return `+${digitsOnly}`;
  }

  return cleaned;
}

function isValidE164Phone(phone: string): boolean {
  const p = normalizePhoneToE164(phone);
  return /^\+[1-9]\d{7,14}$/.test(p);
}

function buildMailtoHref(to: string, subject: string, body: string): string {
  // sécurise fortement ce qui part dans window.location.href
  const safeTo = encodeURIComponent(to.trim());
  const safeSubject = encodeURIComponent(subject);
  const safeBody = encodeURIComponent(body);
  return `mailto:${safeTo}?subject=${safeSubject}&body=${safeBody}`;
}

export default function Providers() {
  const { currentPlatform, loading: platformLoading } = usePlatform();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newProvider, setNewProvider] = useState({
    business_name: "",
    contact_email: "",
    contact_phone: "",
  });

  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);

  useEffect(() => {
    if (currentPlatform) {
      fetchProviders();
    } else {
      // pas de plateforme => AppLayout affichera l'écran dédié
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlatform]);

  const fetchProviders = async () => {
    if (!currentPlatform) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("end_user_profiles")
        .select("*")
        .eq("platform_id", currentPlatform.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProviders((data as Provider[]) || []);
    } catch (err) {
      console.error("Erreur fetchProviders:", err);
      toast.error("Erreur chargement prestataires");
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return providers;

    return providers.filter((p) => {
      const name = (p.business_name || "").toLowerCase();
      const email = (p.contact_email || "").toLowerCase();
      const phone = (p.contact_phone || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [providers, searchQuery]);

  const canCreate = useMemo(() => {
    const nameOk = newProvider.business_name.trim().length >= 2;
    const emailOk = isValidEmail(newProvider.contact_email);
    const phoneOk = isValidE164Phone(newProvider.contact_phone);
    return nameOk && emailOk && phoneOk && !creating;
  }, [newProvider, creating]);

  const handleCreateProvider = async () => {
    if (!currentPlatform) return;

    const businessName = newProvider.business_name.trim();
    const email = newProvider.contact_email.trim().toLowerCase();
    const phone = normalizePhoneToE164(newProvider.contact_phone);

    if (businessName.length < 2) {
      toast.error("Nom du prestataire requis");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Email invalide");
      return;
    }
    if (!isValidE164Phone(phone)) {
      toast.error(
        "Téléphone invalide (format international recommandé, ex: +33612345678)",
      );
      return;
    }

    setCreating(true);
    setGeneratedLink(null);

    try {
      // 1) Create provider
      const { data: createdProvider, error: insertError } = await supabase
        .from("end_user_profiles")
        .insert({
          platform_id: currentPlatform.id,
          business_name: businessName,
          contact_email: email,
          contact_phone: phone,
          status: "active",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setProviders((prev) => [createdProvider as Provider, ...prev]);
      toast.success("Prestataire créé");

      // 2) Generate link (non bloquant)
      try {
        const { data: linkData, error: linkError } =
          await supabase.functions.invoke("create-magic-link", {
            body: {
              platform_id: currentPlatform.id,
              provider_id: createdProvider.id,
              provider_name: businessName,
              recipient_email: email,
              redirect_url: `${window.location.origin}/u`,
            },
          });

        if (linkError) {
          console.error("Erreur create-magic-link:", linkError);
          toast.error(
            "Prestataire créé, mais erreur génération lien (voir console)",
          );
        } else {
          setGeneratedLink(linkData?.magic_link || null);
        }
      } catch (err) {
        console.error("Erreur génération lien:", err);
        toast.error(
          "Prestataire créé, mais erreur génération lien (voir console)",
        );
      }

      // reset form
      setNewProvider({
        business_name: "",
        contact_email: "",
        contact_phone: "",
      });
    } catch (err) {
      console.error("Erreur création prestataire:", err);
      toast.error("Erreur création prestataire");
    } finally {
      setCreating(false);
      setShowNewModal(false);
    }
  };

  const handleGenerateLink = async (provider: Provider) => {
    if (!currentPlatform) return;

    if (!provider.contact_email || !isValidEmail(provider.contact_email)) {
      toast.error("Email prestataire manquant ou invalide");
      return;
    }

    setGeneratingLink(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-magic-link",
        {
          body: {
            platform_id: currentPlatform.id,
            provider_id: provider.id,
            provider_name: provider.business_name,
            recipient_email: provider.contact_email,
            redirect_url: `${window.location.origin}/u`,
          },
        },
      );

      if (error) throw error;

      const link = data?.magic_link;
      if (!link) throw new Error("Lien manquant dans la réponse");

      setGeneratedLink(link);
      await navigator.clipboard.writeText(link);
      toast.success("Lien copié");
    } catch (err) {
      console.error("Erreur génération lien:", err);
      toast.error("Erreur génération lien");
    } finally {
      setGeneratingLink(false);
    }
  };

  const openMailClient = (email: string) => {
    if (!generatedLink) {
      toast.error("Aucun lien généré");
      return;
    }
    if (!currentPlatform) return;

    const safeEmail = email.trim().toLowerCase();
    if (!isValidEmail(safeEmail)) {
      toast.error("Email invalide");
      return;
    }

    const subject = `Vos documents - ${currentPlatform.name}`;
    const body =
      `Bonjour,\n\n` +
      `Veuillez soumettre vos documents via ce lien :\n` +
      `${generatedLink}\n\n` +
      `Cordialement`;

    window.location.href = buildMailtoHref(safeEmail, subject, body);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Prestataires</h1>
            <p className="text-muted-foreground">
              Gère tes prestataires et génère des liens de soumission
            </p>
          </div>
          <Button onClick={() => setShowNewModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau prestataire
          </Button>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              id="providers-search"
              name="providersSearch"
              placeholder="Rechercher prestataires..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </Card>

        <Card>
          {loading || platformLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">
                      {provider.business_name}
                    </TableCell>
                    <TableCell>{provider.contact_email || "-"}</TableCell>
                    <TableCell>{provider.contact_phone || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleGenerateLink(provider)}
                        disabled={generatingLink}
                      >
                        {generatingLink ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        Générer lien
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProviders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-12"
                    >
                      Aucun prestataire trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>

        {generatedLink && (
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">Lien généré</p>
                <p className="text-sm text-muted-foreground break-all">
                  {generatedLink}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  toast.success("Lien copié");
                }}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copier
              </Button>
            </div>

            {/* email + phone quick actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => openMailClient(newProvider.contact_email)}
                disabled={
                  !newProvider.contact_email ||
                  !isValidEmail(newProvider.contact_email)
                }
              >
                <Mail className="h-4 w-4" />
                Envoyer email
              </Button>

              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  const p = normalizePhoneToE164(newProvider.contact_phone);
                  if (!isValidE164Phone(p)) {
                    toast.error("Téléphone invalide");
                    return;
                  }
                  window.location.href = `tel:${p}`;
                }}
                disabled={
                  !newProvider.contact_phone ||
                  !isValidE164Phone(newProvider.contact_phone)
                }
              >
                <Phone className="h-4 w-4" />
                Appeler
              </Button>
            </div>
          </Card>
        )}

        <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau prestataire</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du prestataire *</Label>
                <Input
                  value={newProvider.business_name}
                  onChange={(e) =>
                    setNewProvider((prev) => ({
                      ...prev,
                      business_name: e.target.value,
                    }))
                  }
                  placeholder="Entreprise ABC"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newProvider.contact_email}
                  onChange={(e) =>
                    setNewProvider((prev) => ({
                      ...prev,
                      contact_email: e.target.value,
                    }))
                  }
                  placeholder="contact@exemple.fr"
                  required
                />
                {!isValidEmail(newProvider.contact_email) &&
                  newProvider.contact_email.length > 0 && (
                    <p className="text-xs text-destructive">
                      Format email invalide
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label>Téléphone (format international) *</Label>
                <Input
                  type="tel"
                  value={newProvider.contact_phone}
                  onChange={(e) =>
                    setNewProvider((prev) => ({
                      ...prev,
                      contact_phone: e.target.value,
                    }))
                  }
                  onBlur={() =>
                    setNewProvider((prev) => ({
                      ...prev,
                      contact_phone: normalizePhoneToE164(prev.contact_phone),
                    }))
                  }
                  placeholder="+33 6 12 34 56 78"
                  required
                />
                {!isValidE164Phone(newProvider.contact_phone) &&
                  newProvider.contact_phone.length > 0 && (
                    <p className="text-xs text-destructive">
                      Téléphone invalide (ex: +33612345678)
                    </p>
                  )}
              </div>

              <Button
                onClick={handleCreateProvider}
                disabled={!canCreate}
                className="w-full gap-2"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Créer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
