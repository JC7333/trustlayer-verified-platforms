import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const footerLinks = {
  Produit: [
    { label: "Fonctionnalités", href: "/#features" },
    { label: "Tarifs", href: "/pricing" },
    { label: "Documentation API", href: "/docs" },
    { label: "Changelog", href: "/changelog" },
  ],
  Solutions: [
    { label: "Santé", href: "/use-cases#healthcare" },
    { label: "Services à domicile", href: "/use-cases#home-services" },
    { label: "Marketplaces B2B", href: "/use-cases#marketplaces" },
    { label: "Services financiers", href: "/use-cases#financial" },
  ],
  Entreprise: [
    { label: "À propos", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Carrières", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ],
  Légal: [
    { label: "Sécurité", href: "/security" },
    { label: "Confidentialité", href: "/privacy" },
    { label: "CGU", href: "/terms" },
    { label: "DPA", href: "/dpa" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent">
                <Shield className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold">TrustLayer</span>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Orchestration des vérifications et gestion des preuves pour
              plateformes B2B et marketplaces.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 text-primary-foreground">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} TrustLayer. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-primary-foreground/40">
              SOC 2 Type II
            </span>
            <span className="text-xs text-primary-foreground/40">
              Conforme RGPD
            </span>
            <span className="text-xs text-primary-foreground/40">
              Hébergé en France
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
