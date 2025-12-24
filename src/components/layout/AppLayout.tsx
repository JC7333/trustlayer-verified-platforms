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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/app/dashboard" },
  { icon: FileCheck, label: "Verifications", href: "/app/verifications" },
  { icon: FolderLock, label: "Evidence Vault", href: "/app/evidence" },
  { icon: Settings2, label: "Rules Engine", href: "/app/rules" },
  { icon: Users, label: "Reviewer Console", href: "/app/review" },
  { icon: BadgeCheck, label: "Badges", href: "/app/badges" },
  { icon: Code2, label: "API & Webhooks", href: "/app/api" },
  { icon: CreditCard, label: "Billing", href: "/app/billing" },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center gap-3 px-4 h-16 border-b border-sidebar-border", collapsed && "justify-center")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent shrink-0">
            <Shield className="h-5 w-5 text-accent-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-bold text-sidebar-foreground">TrustLayer</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      collapsed && "justify-center"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
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
              collapsed && "justify-center"
            )}
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>Collapse</span>}
          </button>
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sign out</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn("flex-1 transition-all duration-300", collapsed ? "md:ml-16" : "md:ml-64")}>
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 flex items-center gap-4 px-4 h-16 bg-background border-b border-border">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 hover:bg-secondary rounded-lg">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent">
              <Shield className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-bold">TrustLayer</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">{children}</main>
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
