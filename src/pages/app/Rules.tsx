import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { usePlatform } from "@/hooks/usePlatform";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Shield,
  Car,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface RuleItem {
  id: string;
  name: string;
  description: string;
  document_type: string;
  is_required: boolean;
  expiration_days: number | null;
  score_weight: number;
}

interface RulePackage {
  id: string;
  name: string;
  description: string;
  vertical: string;
  is_template: boolean;
  validity_days: number;
  items?: RuleItem[];
}

export default function Rules() {
  const { currentPlatform, loading: platformLoading } = usePlatform();
  const [packages, setPackages] = useState<RulePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPack, setExpandedPack] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    try {
      // Fetch all packages (templates + platform-specific)
      const { data: packs, error: packError } = await supabase
        .from("rules_packages")
        .select("*")
        .or(
          `is_template.eq.true${currentPlatform ? `,platform_id.eq.${currentPlatform.id}` : ""}`,
        )
        .order("is_template", { ascending: false });

      if (packError) throw packError;

      // Fetch items for each package
      const packagesWithItems = await Promise.all(
        (packs || []).map(async (pack) => {
          const { data: items } = await supabase
            .from("rules_items")
            .select("*")
            .eq("package_id", pack.id)
            .order("is_required", { ascending: false });

          return { ...pack, items: items || [] };
        }),
      );

      setPackages(packagesWithItems);

      // Auto-expand VTC pack
      const vtcPack = packagesWithItems.find(
        (p) => p.id === "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      );
      if (vtcPack) {
        setExpandedPack(vtcPack.id);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error fetching packages:", err);
      toast.error("Erreur lors du chargement des packs");
    } finally {
      setLoading(false);
    }
  }, [currentPlatform]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const getVerticalIcon = (vertical: string) => {
    switch (vertical) {
      case "transport":
        return Car;
      default:
        return Shield;
    }
  };

  const formatExpirationDays = (days: number | null) => {
    if (!days) return "Sans expiration";
    if (days >= 365)
      return `${Math.round(days / 365)} an${days >= 730 ? "s" : ""}`;
    if (days >= 30) return `${Math.round(days / 30)} mois`;
    return `${days} jours`;
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
          <h1 className="text-2xl font-bold text-foreground">
            Packs de règles
          </h1>
          <p className="text-muted-foreground">
            Configurez les documents requis pour vos prestataires
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Car className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground mb-1">
                Pack VTC / Livraison France
              </h3>
              <p className="text-sm text-muted-foreground">
                Ce pack contient les documents obligatoires pour les chauffeurs
                VTC et livreurs en France. Il est automatiquement appliqué à
                tous les nouveaux prestataires.
              </p>
            </div>
          </div>
        </div>

        {/* Packages List */}
        <div className="space-y-4">
          {packages.map((pack) => {
            const VerticalIcon = getVerticalIcon(pack.vertical);
            const isExpanded = expandedPack === pack.id;
            const requiredCount =
              pack.items?.filter((i) => i.is_required).length || 0;
            const optionalCount = (pack.items?.length || 0) - requiredCount;

            return (
              <div
                key={pack.id}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                {/* Pack Header */}
                <button
                  className="w-full p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left"
                  onClick={() => setExpandedPack(isExpanded ? null : pack.id)}
                >
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <VerticalIcon className="h-6 w-6 text-accent" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {pack.name}
                      </h3>
                      {pack.is_template && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-accent/10 text-accent">
                          Template
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {pack.description}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{requiredCount} obligatoires</span>
                      {optionalCount > 0 && (
                        <span>{optionalCount} optionnels</span>
                      )}
                      <span>Validité: {pack.validity_days} jours</span>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Pack Items */}
                {isExpanded && pack.items && pack.items.length > 0 && (
                  <div className="border-t border-border">
                    <div className="divide-y divide-border">
                      {pack.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 flex items-start gap-3"
                        >
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                              item.is_required
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <FileText className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="font-medium text-foreground text-sm">
                                {item.name}
                              </h4>
                              {item.is_required && (
                                <span className="text-xs text-destructive">
                                  Obligatoire
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {item.description}
                            </p>
                            <div className="flex gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatExpirationDays(item.expiration_days)}
                              </span>
                              <span>Code: {item.document_type}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {packages.length === 0 && (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Aucun pack configuré
            </h3>
            <p className="text-muted-foreground text-sm">
              Contactez le support pour configurer vos packs de règles
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
