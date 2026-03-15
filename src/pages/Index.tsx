import { useState } from "react";
import { Link } from "react-router-dom";
import { Link2, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const features = [
  {
    icon: Link2,
    title: "Magic link",
    desc: "Vos prestataires uploadent sans créer de compte",
  },
  {
    icon: CheckCircle2,
    title: "Validation 1 clic",
    desc: "Approuvez ou rejetez depuis votre inbox",
  },
  {
    icon: Clock,
    title: "Alertes expiration",
    desc: "Relances automatiques avant échéance",
  },
];

const Index = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    volume: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(form.email.trim())) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer un email valide.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("contact_requests").insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      company: form.company.trim(),
      volume: form.volume || null,
      request_type: "demo",
    });
    setLoading(false);

    if (error) {
      toast({
        title: "Erreur",
        description: "Erreur, veuillez réessayer",
        variant: "destructive",
      });
      return;
    }

    setSuccess(true);
    setForm({ name: "", email: "", company: "", volume: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
          <span className="text-xl font-bold" style={{ color: "#0F4C81" }}>
            Preuvio
          </span>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Connexion
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6"
            style={{ color: "#0F4C81" }}
          >
            Conformité fournisseurs. Automatisée.
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Collectez attestations URSSAF, Kbis et documents obligatoires (Art.
            D.8222-5) en quelques clics. Vos prestataires uploadent. Vous
            validez. Fini les relances manuelles.
          </p>
          <a href="#contact">
            <Button
              size="lg"
              className="text-white"
              style={{ backgroundColor: "#0F4C81" }}
            >
              Demander une démo
            </Button>
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((f) => (
              <div key={f.title} className="text-center">
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-lg mb-4"
                  style={{ backgroundColor: "#0F4C8115" }}
                >
                  <f.icon className="h-6 w-6" style={{ color: "#0F4C81" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
          <h2
            className="text-2xl font-bold text-center mb-8"
            style={{ color: "#0F4C81" }}
          >
            Demander une démo
          </h2>

          {success ? (
            <div className="text-center p-6 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <p className="text-green-800 font-medium">
                Merci ! Nous vous recontactons sous 24h.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  maxLength={255}
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  required
                  maxLength={100}
                  value={form.company}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, company: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="volume">Nombre de prestataires</Label>
                <Select
                  value={form.volume}
                  onValueChange={(v) => setForm((f) => ({ ...f, volume: v }))}
                >
                  <SelectTrigger id="volume">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-50">1-50</SelectItem>
                    <SelectItem value="50-200">50-200</SelectItem>
                    <SelectItem value="200+">200+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full text-white"
                style={{ backgroundColor: "#0F4C81" }}
                disabled={loading}
              >
                {loading ? "Envoi…" : "Envoyer"}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 space-y-2">
          <p>Preuvio — Made in France</p>
          <Link to="/auth" className="hover:underline" style={{ color: "#0F4C81" }}>
            Connexion
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
