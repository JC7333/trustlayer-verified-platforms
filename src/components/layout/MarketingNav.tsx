import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Product", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "API Docs", href: "/docs" },
  { label: "Security", href: "/security" },
];

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent shadow-md group-hover:shadow-glow transition-shadow duration-300">
              <Shield className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TrustLayer</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  location.pathname === item.href
                    ? "text-accent bg-accent/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/contact">
              <Button variant="ghost" size="sm">
                Contact
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="accent" size="sm">
                Book a demo
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border/50">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Sign in</Button>
              </Link>
              <Link to="/demo" onClick={() => setMobileOpen(false)}>
                <Button variant="accent" className="w-full">Book a demo</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
