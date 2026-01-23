import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Shield,
  LayoutDashboard,
  FileCheck,
  FolderLock,
  Settings2,
  Users,
  BadgeCheck,
  Code2,
  CreditCard,
  LogOut,
  ChevronLeft,
  Menu,
  Bell,
  Search,
  Loader2,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const navItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", href: "/app/dashboard" },
  { icon: Inbox, label: "Inbox", href: "/app/inbox" },
  { icon: Users, label: "Prestataires", href: "/app/providers" },
  { icon: FileCheck, label: "Console de revue", href: "/app/review" },
  { icon: Bell, label: "Notifications", href: "/app/notifications" },
  { icon: Settings2, label: "Expirations", href: "/app/expirations" },
  { icon: FolderLock, label: "Packs de règles", href: "/app/rules" },
  { icon: Code2, label: "API & Webhooks", href: "/app/api" },
  { icon: CreditCard, label: "Facturation", href: "/app/billing" },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading } = useRequireAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 h-16 border-b border-sidebar-border",
            collapsed && "justify-center",
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent shrink-0">
            <Shield className="h-5 w-5 text-accent-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">
              TrustLayer
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                location.pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      collapsed && "justify-center",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive && "text-sidebar-primary",
                      )}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors",
              collapsed && "justify-center",
            )}
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                collapsed && "rotate-180",
              )}
            />
            {!collapsed && <span>Réduire</span>}
          </button>
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors",
              collapsed && "justify-center",
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Déconnexion</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          collapsed ? "md:ml-16" : "md:ml-64",
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex items-center gap-4 px-4 md:px-6 h-16 bg-background/95 backdrop-blur border-b border-border">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher profils, documents..."
                className="pl-10 bg-secondary/50 border-transparent focus:border-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
            </Button>

            {/* User */}
            <div className="flex items-center gap-3 pl-2 border-l border-border">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">Acme Corp</p>
                <p className="text-xs text-muted-foreground">Plan Pro</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-accent text-accent-foreground text-sm font-bold">
                AC
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
