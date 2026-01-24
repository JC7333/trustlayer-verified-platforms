import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Copy,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlatform } from "@/hooks/usePlatform";

interface ProviderRow {
  id: string;
  platform_id: string;
  business_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "En attente", variant: "secondary" },
  submitted: { label: "Soumis", variant: "outline" },
  verified: { label: "Vérifié", variant: "default" },
  rejected: { label: "Rejeté", variant: "destructive" },
};

export default function Providers() {
  const { currentPlatform } = usePlatform();

  const [providers, setProviders] = useState<ProviderRow[]>([]);
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
  const [generatingForProviderId, setGeneratingForProviderId] = useState<
    string | null
  >(null);

  const fetchProviders = async () => {
    if (!currentPlatform?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("end_user_profiles")
      .select(
        "id, platform_id, business_name, contact_email, contact_phone, status, created_at, updated_at",
      )
      .eq("platform_id", currentPlatform.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur chargement prestataires");
      setLoading(false);
      return;
    }

    setProviders((data as ProviderRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlatform?.id]);

  const resetModal = () => {
    setNewProvider({
      business_name: "",
      contact_email: "",
      contact_phone: "",
    });
    setGeneratedLink(null);
  };

  // ===== Mail helpers (safe) =====
  const isSafeEmail = (emailRaw: string) => {
    const email = (emailRaw ?? "").trim();

    if (!email) return false;
    if (email.includes("?") || email.includes("&") || email.includes("#"))
      return false;
    if (email.includes(" ")) return false;

    const strictEmailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    return strictEmailRegex.test(email);
  };

  const buildProviderMailto = (
    emailRaw: string,
    platformName: string,
    link: string,
  ) => {
    const email = (emailRaw ?? "").trim();

    const subject = `Vos documents - ${platformName || "Plateforme"}`;
    const body = `Bonjour,

Veuillez soumettre vos documents via ce lien :
${link}

Cordialement`;

    const url = new URL(`mailto:${email}`);
    url.searchParams.set("subject", subject);
    url.searchParams.set("body", body);

    return url.toString();
  };

  const canSendProviderEmail =
    Boolean(generatedLink) && isSafeEmail(newProvider.contact_email ?? "");

  const handleSendProviderEmail = () => {
    const email = (newProvider.contact_email ?? "").trim();

    if (!generatedLink) {
      toast.error("Lien non généré.");
      return;
    }

    if (!isSafeEmail(email)) {
      toast.error("Email invalide.");
      return;
    }

    const mailto = buildProviderMailto(
      email,
      currentPlatform?.name ?? "Plateforme",
      generatedLink,
    );

    window.location.assign(mailto);
    toast.success("Brouillon email prêt dans votre client mail.");
  };

  const handleCreateProvider = async () => {
    if (!currentPlatform?.id) return;

    const businessName = newProvider.business_name.trim();
    const email = newProvider.contact_email.trim();
    const phone = newProvider.contact_phone.trim();

    if (!businessName) {
      toast.error("Nom de société requis");
      return;
    }

    if (email && !isSafeEmail(email)) {
      toast.error("Email invalide");
      return;
    }

    setCreating(true);

    const { data, error } = await supabase
      .from("end_user_profiles")
      .insert({
        platform_id: currentPlatform.id,
        business_name: businessName,
        contact_email: email || null,
        contact_phone: phone || null,
        status: "pending",
      })
      .select()
      .single();

    if (error || !data) {
      toast.error("Erreur création prestataire");
      setCreating(false);
      return;
    }

    toast.success("Prestataire créé");
    setCreating(false);

    // Génère directement un lien Magic Link
    await handleGenerateLink(data.id);

    await fetchProviders();
  };

  const handleGenerateLink = async (providerId: string) => {
    if (!currentPlatform?.id) return;

    setGeneratingForProviderId(providerId);

    const { data, error } = await supabase.functions.invoke(
      "create-magic-link",
      {
        body: {
          platform_id: currentPlatform.id,
          end_user_profile_id: providerId,
        },
      },
    );

    if (error) {
      toast.error("Erreur génération lien");
      setGeneratingForProviderId(null);
      return;
    }

    const link = data?.url as string | undefined;

    if (!link) {
      toast.error("Lien non généré");
      setGeneratingForProviderId(null);
      return;
    }

    setGeneratedLink(link);
    toast.success("Lien généré");
    setGeneratingForProviderId(null);
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Lien copié");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!currentPlatform?.id) return;

    const { error } = await supabase
      .from("end_user_profiles")
      .delete()
      .eq("id", providerId)
      .eq("platform_id", currentPlatform.id);

    if (error) {
      toast.error("Erreur suppression prestataire");
      return;
    }

    toast.success("Prestataire supprimé");
    await fetchProviders();
  };

  const filteredProviders = providers.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.business_name.toLowerCase().includes(q) ||
      (p.contact_email ?? "").toLowerCase().includes(q) ||
      (p.contact_phone ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Prestataires</h1>
            <p className="text-muted-foreground">
              Gérez vos prestataires et générez des liens d&apos;upload
            </p>
          </div>

          <Button
            onClick={() => {
              resetModal();
              setShowNewModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau prestataire
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Chargement...</div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-muted-foreground">Aucun prestataire</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Entreprise</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Téléphone</th>
                    <th className="text-left p-3 font-medium">Statut</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((provider) => {
                    const status =
                      statusConfig[provider.status] ??
                      statusConfig.pending ??
                      ({
                        label: provider.status,
                        variant: "secondary",
                      } as const);

                    return (
                      <tr key={provider.id} className="border-t">
                        <td className="p-3">{provider.business_name}</td>
                        <td className="p-3">{provider.contact_email ?? "-"}</td>
                        <td className="p-3">{provider.contact_phone ?? "-"}</td>
                        <td className="p-3">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateLink(provider.id)}
                              disabled={generatingForProviderId === provider.id}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              {generatingForProviderId === provider.id
                                ? "..."
                                : "Lien"}
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleGenerateLink(provider.id)
                                  }
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Nouveau lien
                                </DropdownMenuItem>
                                {provider.contact_email && (
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Envoyer email
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() =>
                                    handleDeleteProvider(provider.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Nouveau prestataire</DialogTitle>
              <DialogDescription>
                Créez un prestataire et générez un lien Magic Link pour upload
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Entreprise *</Label>
                <Input
                  value={newProvider.business_name}
                  onChange={(e) =>
                    setNewProvider((prev) => ({
                      ...prev,
                      business_name: e.target.value,
                    }))
                  }
                  placeholder="Entreprise ABC"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={newProvider.contact_phone}
                    onChange={(e) =>
                      setNewProvider((prev) => ({
                        ...prev,
                        contact_phone: e.target.value,
                      }))
                    }
                    placeholder="06 00 00 00 00"
                  />
                </div>
              </div>

              {generatedLink && (
                <div className="space-y-2">
                  <Label>Lien généré</Label>
                  <div className="flex gap-2">
                    <Input value={generatedLink} readOnly />
                    <Button
                      variant="outline"
                      onClick={() => copyLink(generatedLink)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    {newProvider.contact_email && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        disabled={!canSendProviderEmail}
                        onClick={handleSendProviderEmail}
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </Button>
                    )}
                  </div>
                  {!canSendProviderEmail && newProvider.contact_email && (
                    <p className="text-xs text-muted-foreground">
                      Saisissez un email valide pour activer le bouton.
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewModal(false);
                  resetModal();
                }}
              >
                Fermer
              </Button>

              <Button onClick={handleCreateProvider} disabled={creating}>
                {creating ? "Création..." : "Créer + générer lien"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
