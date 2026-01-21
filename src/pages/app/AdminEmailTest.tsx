import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle2, XCircle, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface TestResult {
  success: boolean;
  message: string;
  timestamp: Date;
  type: string;
}

export default function AdminEmailTest() {
  useRequireAuth();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [results, setResults] = useState<TestResult[]>([]);

  const addResult = (result: TestResult) => {
    setResults(prev => [result, ...prev].slice(0, 10));
  };

  const testDemoEmail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-demo-email", {
        body: {
          name: "Test User",
          email: testEmail || user?.email || "test@example.com",
          company: "Test Company",
          vertical: "logistique",
          volume: "100-500",
        },
      });

      if (error) throw error;

      addResult({
        success: true,
        message: `Email de démo envoyé. Message ID: ${data?.message_id || 'N/A'}`,
        timestamp: new Date(),
        type: "Demo Email",
      });
      toast.success("Email de test envoyé avec succès !");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      addResult({
        success: false,
        message: err.message || "Erreur inconnue",
        timestamp: new Date(),
        type: "Demo Email",
      });
      toast.error("Erreur: " + (err.message || "Échec de l'envoi"));
    } finally {
      setLoading(false);
    }
  };

  const testNotificationEmail = async (type: string) => {
    setLoading(true);
    try {
      // This will test the send-notification function
      const { data, error } = await supabase.functions.invoke("send-notification", {
        body: {
          notification_id: "test-" + Date.now(),
          notification_type: type,
          recipient_email: testEmail || user?.email,
          subject: `[TEST] Notification ${type}`,
          body: "Ceci est un email de test pour vérifier le bon fonctionnement du système.",
          platform_name: "Preuvio Test",
          end_user_name: "Prestataire Test",
        },
      });

      if (error) throw error;

      addResult({
        success: true,
        message: `Notification ${type} envoyée`,
        timestamp: new Date(),
        type: `Notification: ${type}`,
      });
      toast.success("Notification envoyée !");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      addResult({
        success: false,
        message: message || "Erreur inconnue",
        timestamp: new Date(),
        type: `Notification: ${type}`,
      });
      toast.error("Erreur: " + message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Test des emails</h1>
          <p className="text-muted-foreground">
            Page admin pour tester l'envoi d'emails via Resend
          </p>
        </div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configuration du test
            </CardTitle>
            <CardDescription>
              L'email sera envoyé à l'adresse configurée dans DEMO_NOTIFY_TO_EMAIL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email de reply-to (optionnel)
              </label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder={user?.email || "test@example.com"}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Si vide, utilise votre email de connexion
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email de demande de démo</CardTitle>
              <CardDescription>
                Simule une soumission du formulaire /demo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testDemoEmail} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Envoyer email de démo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification expiration</CardTitle>
              <CardDescription>
                Simule une relance d'expiration de document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => testNotificationEmail("expiry_reminder_7")} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Envoyer relance J-7
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Résultats des tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      result.success 
                        ? "border-success/30 bg-success/5" 
                        : "border-destructive/30 bg-destructive/5"
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{result.type}</p>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.timestamp.toLocaleTimeString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>RESEND_API_KEY</strong> : Clé API Resend (à configurer dans les secrets)</p>
            <p>• <strong>DEMO_NOTIFY_TO_EMAIL</strong> : Email qui recevra les demandes de démo</p>
            <p>• <strong>APP_PUBLIC_URL</strong> : URL publique de l'application</p>
            <p className="pt-2">
              Si le domaine n'est pas vérifié sur Resend, les emails seront envoyés depuis 
              <code className="bg-secondary px-1 rounded ml-1">onboarding@resend.dev</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
