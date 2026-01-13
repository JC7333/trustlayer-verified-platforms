import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { usePlatform } from "@/hooks/usePlatform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Copy, 
  Mail, 
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Ban,
  Loader2,
  Link2,
  RefreshCw
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface EndUserProfile {
  id: string;
  business_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Actif", color: "bg-success/10 text-success", icon: CheckCircle2 },
  needs_docs: { label: "Documents requis", color: "bg-warning/10 text-warning", icon: Clock },
  in_review: { label: "En revue", color: "bg-accent/10 text-accent", icon: Clock },
  approved: { label: "Approuvé", color: "bg-success/10 text-success", icon: CheckCircle2 },
  rejected: { label: "Rejeté", color: "bg-destructive/10 text-destructive", icon: XCircle },
  blocked: { label: "Bloqué", color: "bg-destructive/10 text-destructive", icon: Ban },
};

export default function Providers() {
  const { currentPlatform, loading: platformLoading } = usePlatform();
  const [providers, setProviders] = useState<EndUserProfile[]>([]);
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
  const [generatingLink, setGeneratingLink] = useState<string | null>(null);

  useEffect(() => {
    if (currentPlatform) {
      fetchProviders();
    }
  }, [currentPlatform]);

  const fetchProviders = async () => {
    if (!currentPlatform) return;

    try {
      const { data, error } = await supabase
        .from("end_user_profiles")
        .select("*")
        .eq("platform_id", currentPlatform.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error fetching providers:", err);
      toast.error("Erreur lors du chargement des prestataires");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProvider = async () => {
    if (!currentPlatform || !newProvider.business_name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("end_user_profiles")
        .insert({
          platform_id: currentPlatform.id,
          business_name: newProvider.business_name.trim(),
          contact_email: newProvider.contact_email.trim() || null,
          contact_phone: newProvider.contact_phone.trim() || null,
          status: "needs_docs",
        })
        .select()
        .single();

      if (error) throw error;

      // Generate magic link immediately
      const { data: linkData, error: linkError } = await supabase.functions.invoke("create-magic-link", {
        body: {
          platform_id: currentPlatform.id,
          end_user_id: data.id,
          expires_in_days: 7,
        },
      });

      if (linkError) throw linkError;

      setGeneratedLink(linkData.magic_link_url);
      setProviders(prev => [data, ...prev]);
      toast.success("Prestataire créé avec succès");
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error creating provider:", err);
      toast.error("Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateLink = async (providerId: string) => {
    if (!currentPlatform) return;

    setGeneratingLink(providerId);
    try {
      const { data, error } = await supabase.functions.invoke("create-magic-link", {
        body: {
          platform_id: currentPlatform.id,
          end_user_id: providerId,
          expires_in_days: 7,
        },
      });

      if (error) throw error;

      await navigator.clipboard.writeText(data.magic_link_url);
      toast.success("Lien copié dans le presse-papiers !");
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error generating link:", err);
      toast.error("Erreur lors de la génération du lien");
    } finally {
      setGeneratingLink(null);
    }
  };

  const copyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    toast.success("Lien copié !");
  };

  const resetModal = () => {
    setShowNewModal(false);
    setNewProvider({ business_name: "", contact_email: "", contact_phone: "" });
    setGeneratedLink(null);
  };

  const filteredProviders = providers.filter(p =>
    p.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.contact_email?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-2xl font-bold text-foreground">Prestataires</h1>
            <p className="text-muted-foreground">Gérez vos prestataires et leurs documents</p>
          </div>
          <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
            <DialogTrigger asChild>
              <Button variant="accent">
                <Plus className="h-4 w-4" />
                Nouveau prestataire
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {generatedLink ? "Lien d'invitation" : "Ajouter un prestataire"}
                </DialogTitle>
              </DialogHeader>

              {!generatedLink ? (
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Nom / Raison sociale *
                    </label>
                    <Input
                      value={newProvider.business_name}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, business_name: e.target.value }))}
                      placeholder="Ex: Transport Express SARL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Email (optionnel)
                    </label>
                    <Input
                      type="email"
                      value={newProvider.contact_email}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder="contact@exemple.fr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Téléphone (optionnel)
                    </label>
                    <Input
                      value={newProvider.contact_phone}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={resetModal}>
                      Annuler
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={handleCreateProvider}
                      disabled={creating || !newProvider.business_name.trim()}
                    >
                      {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Partagez ce lien avec le prestataire pour qu'il puisse soumettre ses documents :
                  </p>
                  <div className="p-3 bg-secondary rounded-lg">
                    <code className="text-xs break-all text-foreground">{generatedLink}</code>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => copyLink(generatedLink)}
                    >
                      <Copy className="h-4 w-4" />
                      Copier
                    </Button>
                    {newProvider.contact_email && (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          window.location.href = `mailto:${newProvider.contact_email}?subject=Vos documents - ${currentPlatform?.name}&body=Bonjour,%0A%0AVeuillez soumettre vos documents via ce lien :%0A${generatedLink}%0A%0ACordialement`;
                        }}
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </Button>
                    )}
                  </div>
                  <Button className="w-full" onClick={resetModal}>
                    Terminer
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un prestataire..."
            className="pl-10"
          />
        </div>

        {/* Providers List */}
        {filteredProviders.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              {searchQuery ? "Aucun résultat" : "Aucun prestataire"}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery 
                ? "Essayez une autre recherche" 
                : "Commencez par ajouter votre premier prestataire"}
            </p>
            {!searchQuery && (
              <Button variant="accent" onClick={() => setShowNewModal(true)}>
                <Plus className="h-4 w-4" />
                Ajouter un prestataire
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                      Prestataire
                    </th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                      Contact
                    </th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                      Statut
                    </th>
                    <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProviders.map((provider) => {
                    const status = statusConfig[provider.status] || statusConfig.needs_docs;
                    const StatusIcon = status.icon;

                    return (
                      <tr key={provider.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{provider.business_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Créé le {new Date(provider.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-sm text-foreground">{provider.contact_email || "-"}</p>
                          <p className="text-xs text-muted-foreground">{provider.contact_phone || ""}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleGenerateLink(provider.id)}
                              disabled={generatingLink === provider.id}
                            >
                              {generatingLink === provider.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Link2 className="h-4 w-4" />
                              )}
                              <span className="hidden sm:inline ml-1">Lien</span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleGenerateLink(provider.id)}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Nouveau lien
                                </DropdownMenuItem>
                                {provider.contact_email && (
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Envoyer email
                                  </DropdownMenuItem>
                                )}
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
      </div>
    </AppLayout>
  );
}
