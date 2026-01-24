import { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { usePlatform } from "@/hooks/usePlatform";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { loading: authLoading } = useRequireAuth();
  const { currentPlatform, loading: platformLoading, error } = usePlatform();

  if (authLoading || platformLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ✅ IMPORTANT : si aucun rôle => aucune plateforme => on affiche un écran clair
  if (!currentPlatform) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Aucune plateforme associée à ton compte</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p>
                Ton utilisateur n’a pas de ligne dans <code>user_roles</code>.
                Résultat : l’app ne sait pas quelle plateforme charger.
              </p>
              <p className="text-sm text-muted-foreground">
                Fix rapide : Supabase → Table Editor → user_roles → ajoute un
                rôle (<code>owner</code>) sur ta plateforme.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "Supabase > Table Editor > user_roles > Insert row: user_id + platform_id + role=owner",
                    );
                    toast.success("Instructions copiées");
                  }}
                >
                  Copier les étapes
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Recharger
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-6">
        <Alert className="max-w-lg">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
