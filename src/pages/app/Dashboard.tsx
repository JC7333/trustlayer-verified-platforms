import { AppLayout } from "@/components/layout/AppLayout";
import { 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const stats = [
  {
    label: "Pending Review",
    value: "23",
    change: "+5",
    trend: "up",
    icon: Clock,
    color: "warning",
  },
  {
    label: "Approved (30d)",
    value: "156",
    change: "+12%",
    trend: "up",
    icon: CheckCircle2,
    color: "success",
  },
  {
    label: "Rejected (30d)",
    value: "8",
    change: "-3%",
    trend: "down",
    icon: XCircle,
    color: "destructive",
  },
  {
    label: "Expiring Soon",
    value: "12",
    change: "30d",
    trend: "neutral",
    icon: AlertTriangle,
    color: "warning",
  },
];

const recentRequests = [
  { id: "VER-001", profile: "Acme Plumbing Ltd", package: "HomeServices-FR", status: "in_review", date: "2 hours ago" },
  { id: "VER-002", profile: "Dr. Marie Laurent", package: "Healthcare-FR", status: "approved", date: "5 hours ago" },
  { id: "VER-003", profile: "TechSupply GmbH", package: "B2B-Marketplace", status: "submitted", date: "1 day ago" },
  { id: "VER-004", profile: "CleanHome Services", package: "HomeServices-FR", status: "rejected", date: "1 day ago" },
  { id: "VER-005", profile: "MediCare Plus", package: "Healthcare-FR", status: "draft", date: "2 days ago" },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-accent/10 text-accent",
  in_review: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  expired: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
};

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your verification pipeline</p>
          </div>
          <Link to="/app/verifications/new">
            <Button variant="accent">
              <FileCheck className="h-4 w-4" />
              New Verification
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  stat.color === "success" ? "bg-success/10 text-success" :
                  stat.color === "warning" ? "bg-warning/10 text-warning" :
                  stat.color === "destructive" ? "bg-destructive/10 text-destructive" :
                  "bg-accent/10 text-accent"
                }`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === "up" ? "text-success" :
                  stat.trend === "down" ? "text-destructive" :
                  "text-muted-foreground"
                }`}>
                  {stat.trend === "up" && <ArrowUpRight className="h-4 w-4" />}
                  {stat.trend === "down" && <ArrowDownRight className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Requests */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-semibold text-foreground">Recent Requests</h2>
              <Link to="/app/verifications" className="text-sm text-accent hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground font-mono text-xs">
                      {request.id.split("-")[1]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{request.profile}</p>
                      <p className="text-sm text-muted-foreground">{request.package}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                      {statusLabels[request.status]}
                    </span>
                    <span className="text-sm text-muted-foreground hidden sm:block">{request.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/app/verifications/new">
                <Button variant="outline" className="w-full justify-start">
                  <FileCheck className="h-4 w-4" />
                  Create verification request
                </Button>
              </Link>
              <Link to="/app/review">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4" />
                  Review pending requests
                </Button>
              </Link>
              <Link to="/app/rules">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4" />
                  Manage rules packages
                </Button>
              </Link>
              <Link to="/app/api">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4" />
                  API keys & webhooks
                </Button>
              </Link>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm font-medium text-foreground mb-1">Need help?</p>
              <p className="text-xs text-muted-foreground mb-3">
                Check our documentation or contact support.
              </p>
              <Link to="/docs">
                <Button variant="accent" size="sm" className="w-full">
                  View documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Expiring in 30 Days</h2>
            <span className="text-sm text-warning font-medium">12 profiles</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Dr. Jean Dupont", expires: "Dec 28, 2024", type: "Medical License" },
              { name: "ProBuild SARL", expires: "Jan 5, 2025", type: "Insurance" },
              { name: "HealthFirst", expires: "Jan 12, 2025", type: "Certification" },
              { name: "TechServices Ltd", expires: "Jan 18, 2025", type: "Business License" },
            ].map((item) => (
              <div key={item.name} className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                <p className="font-medium text-foreground text-sm mb-1">{item.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{item.type}</p>
                <p className="text-xs text-warning font-medium">{item.expires}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
