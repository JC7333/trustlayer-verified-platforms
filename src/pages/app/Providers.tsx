import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePlatform } from "@/hooks/usePlatform";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import {
  Plus,
  Search,
  Link2,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const providerSchema = z.object({
  business_name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(200),
  contact_email: z.string().trim().email("Email invalide").max(255).optional().or(z.literal("")),
  contact_phone: z.string().trim().max(30).optional().or(z.literal("")),
});

interface Provider {
  id: string;
  business_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  needs_docs: { label: "En attente", variant: "outline" },
  active: { label: "Actif", variant: "default" },
  approved: { label: "Approuvé", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  rejected: { label: "Rejeté", variant: "destructive" },
};

const Providers = () => {
  const { currentPlatform } = usePlatform();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ business_name: "", contact_email: "", contact_phone: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [sendingLinkId, setSendingLinkId] = useState<string | null>(null);

  const fetchProviders = async () => {
    if (!currentPlatform) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("end_user_profiles")
      .select("id, business_name, contact_email, contact_phone, status, created_at")
      .eq("platform_id", currentPlatform.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des prestataires");
    } else {
      setProviders(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlatform?.id]);

  const filtered = useMemo(() => {
    if (!search.trim()) return providers;
    const q = search.toLowerCase();
    return providers.filter(
      (p) =>
        p.business_name.toLowerCase().includes(q) ||
        (p.contact_email && p.contact_email.toLowerCase().includes(q))
    );
  }, [providers, search]);

  const handleCreate = async () => {
    const result = providerSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((i) => { errors[String(i.path[0])] = i.message; });
      setFormErrors(errors);
      return;
    }
    if (!currentPlatform) return;

    setSaving(true);
    setFormErrors({});
    const { error } = await supabase.from("end_user_profiles").insert({
      platform_id: currentPlatform.id,
      business_name: result.data.business_name,
      contact_email: result.data.contact_email || null,
      contact_phone: result.data.contact_phone || null,
    });

    if (error) {
      toast.error("Erreur lors de la création du prestataire");
    } else {
      toast.success("Prestataire créé");
      setDialogOpen(false);
      setFormData({ business_name: "", contact_email: "", contact_phone: "" });
      fetchProviders();
    }
    setSaving(false);
  };

  const handleSendMagicLink = async (provider: Provider) => {
    if (!currentPlatform) return;
    setSendingLinkId(provider.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) { toast.error("Session expirée"); return; }

      const res = await supabase.functions.invoke("create-magic-link", {
        body: { platform_id: currentPlatform.id, end_user_id: provider.id },
      });

      if (res.error) throw res.error;

      const magicLinkUrl = res.data?.magic_link_url;
      if (magicLinkUrl) {
        await navigator.clipboard.writeText(magicLinkUrl);
        toast.success("Magic link créé et copié dans le presse-papier");
      } else {
        toast.success("Magic link créé");
      }
      fetchProviders();
    } catch {
      toast.error("Erreur lors de la création du magic link");
    } finally {
      setSendingLinkId(null);
    }
  };

  const handleCopyLink = async (provider: Provider) => {
    if (!currentPlatform) return;
    // Find latest active magic link for this provider
    const { data } = await supabase
      .from("magic_links")
      .select("token_hash, id")
      .eq("end_user_id", provider.id)
      .eq("platform_id", currentPlatform.id)
      .is("revoked_at", null)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!data) {
      toast.error("Aucun magic link actif. Envoyez-en un d'abord.");
      return;
    }

    // Note: we only have the hash stored, not the raw token.
    // The raw URL was returned at creation time. We inform the user.
    toast.info("Le lien a été copié lors de sa création. Renvoyez un magic link pour obtenir un nouveau lien.");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Prestataires</h1>
            <p className="text-muted-foreground text-sm">
              Gérez vos prestataires et leurs documents de conformité.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau prestataire
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {providers.length === 0
              ? "Aucun prestataire pour le moment. Cliquez sur « Nouveau prestataire » pour commencer."
              : "Aucun résultat pour cette recherche."}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const sc = statusConfig[p.status] ?? { label: p.status, variant: "outline" as const };
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.business_name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.contact_email ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={sendingLinkId === p.id}
                          onClick={() => handleSendMagicLink(p)}
                        >
                          {sendingLinkId === p.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5 mr-1" />
                          )}
                          Magic link
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyLink(p)}
                        >
                          <Link2 className="h-3.5 w-3.5 mr-1" />
                          Copier
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau prestataire</DialogTitle>
            <DialogDescription>
              Ajoutez un prestataire à votre plateforme pour lui demander ses documents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="business_name">Nom de l'entreprise *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData((f) => ({ ...f, business_name: e.target.value }))}
                placeholder="Ex : Dupont & Fils"
              />
              {formErrors.business_name && (
                <p className="text-sm text-destructive">{formErrors.business_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email de contact</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData((f) => ({ ...f, contact_email: e.target.value }))}
                placeholder="contact@exemple.fr"
              />
              {formErrors.contact_email && (
                <p className="text-sm text-destructive">{formErrors.contact_email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Téléphone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData((f) => ({ ...f, contact_phone: e.target.value }))}
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Providers;
