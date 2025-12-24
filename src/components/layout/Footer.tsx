import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "API Docs", href: "/docs" },
    { label: "Changelog", href: "/changelog" },
  ],
  Solutions: [
    { label: "Healthcare", href: "/use-cases#healthcare" },
    { label: "Home Services", href: "/use-cases#home-services" },
    { label: "Marketplaces", href: "/use-cases#marketplaces" },
    { label: "Financial Services", href: "/use-cases#financial" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ],
  Legal: [
    { label: "Security", href: "/security" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
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
              Verification orchestration and proof management for B2B platforms and marketplaces.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 text-primary-foreground">{category}</h4>
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
            © {new Date().getFullYear()} TrustLayer. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-primary-foreground/40">SOC 2 Type II</span>
            <span className="text-xs text-primary-foreground/40">GDPR Compliant</span>
            <span className="text-xs text-primary-foreground/40">ISO 27001</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
