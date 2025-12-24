import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Code2, 
  FileJson, 
  Webhook, 
  Key, 
  Clock, 
  Shield,
  Copy,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const endpoints = [
  {
    method: "POST",
    path: "/v1/verification-requests",
    description: "Create a new verification request for an end-user profile",
  },
  {
    method: "GET",
    path: "/v1/verification-requests/:id",
    description: "Retrieve a specific verification request with its current status",
  },
  {
    method: "GET",
    path: "/v1/verification-requests",
    description: "List all verification requests with filtering and pagination",
  },
  {
    method: "PATCH",
    path: "/v1/verification-requests/:id",
    description: "Update a verification request (submit, add notes, etc.)",
  },
  {
    method: "GET",
    path: "/v1/profiles/:id",
    description: "Get an end-user profile with verification status",
  },
  {
    method: "POST",
    path: "/v1/profiles/:id/evidences",
    description: "Upload evidence documents to a profile",
  },
  {
    method: "GET",
    path: "/v1/profiles/:id/badge",
    description: "Get the public badge status for embedding",
  },
  {
    method: "GET",
    path: "/v1/packages",
    description: "List available verification packages for your platform",
  },
];

const webhookEvents = [
  "verification.submitted",
  "verification.approved",
  "verification.rejected",
  "verification.expired",
  "evidence.uploaded",
  "evidence.expiring_soon",
];

const codeExample = `// Create a verification request
const response = await fetch('https://api.trustlayer.io/v1/verification-requests', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_live_...',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    profile_id: 'prof_abc123',
    package_id: 'pkg_healthcare_fr',
    metadata: {
      internal_id: 'your-reference-id',
    },
  }),
});

const verification = await response.json();
// { id: 'ver_xyz789', status: 'draft', ... }`;

const badgeSnippet = `<!-- TrustLayer Badge Widget -->
<script src="https://cdn.trustlayer.io/badge.js"></script>
<div 
  data-trustlayer-badge="prof_abc123"
  data-theme="light"
  data-size="compact"
></div>`;

export default function ApiDocs() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      
      <main className="pt-24">
        {/* Header */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent text-accent-foreground mb-6">
                <Code2 className="h-7 w-7" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                API Documentation
              </h1>
              <p className="text-lg text-muted-foreground">
                Integrate TrustLayer into your platform with our RESTful API. 
                Full control over verification workflows, evidence management, and badge embedding.
              </p>
              <div className="flex items-center justify-center gap-4 mt-8">
                <Link to="/sandbox">
                  <Button variant="accent">Start with sandbox</Button>
                </Link>
                <a href="https://api.trustlayer.io/docs" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    Full API Reference
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-card rounded-xl p-6 border border-border">
                <Key className="h-8 w-8 text-accent mb-4" />
                <h3 className="font-semibold text-foreground mb-2">API Keys</h3>
                <p className="text-sm text-muted-foreground">
                  Generate and rotate API keys per environment. Scoped permissions for security.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <Webhook className="h-8 w-8 text-accent mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Webhooks</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time event notifications for verification status changes and expirations.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <Clock className="h-8 w-8 text-accent mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Rate Limits</h3>
                <p className="text-sm text-muted-foreground">
                  Generous rate limits with burst capacity. Enterprise plans get dedicated quotas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8">Core Endpoints</h2>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Method</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Endpoint</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground hidden md:table-cell">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoints.map((endpoint, index) => (
                      <tr key={index} className="border-b border-border last:border-b-0">
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-mono font-semibold ${
                            endpoint.method === "GET" 
                              ? "bg-accent/10 text-accent" 
                              : endpoint.method === "POST"
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          }`}>
                            {endpoint.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-foreground">{endpoint.path}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">{endpoint.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8">Quick Start Example</h2>
              <div className="bg-primary rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-primary/80 border-b border-primary-foreground/10">
                  <span className="text-sm font-medium text-primary-foreground/70">JavaScript</span>
                  <button 
                    onClick={() => copyToClipboard(codeExample)}
                    className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                </div>
                <pre className="p-6 overflow-x-auto">
                  <code className="text-sm font-mono text-primary-foreground/90">{codeExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Webhooks */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">Webhook Events</h2>
              <p className="text-muted-foreground mb-8">
                Subscribe to these events to receive real-time notifications about verification lifecycle changes.
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {webhookEvents.map((event) => (
                  <div key={event} className="flex items-center gap-3 bg-card rounded-lg p-4 border border-border">
                    <FileJson className="h-5 w-5 text-accent" />
                    <code className="text-sm font-mono text-foreground">{event}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Badge Widget */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">Embeddable Badge Widget</h2>
              <p className="text-muted-foreground mb-8">
                Display verification status on your platform with our lightweight, customizable badge widget.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-primary rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-primary/80 border-b border-primary-foreground/10">
                    <span className="text-sm font-medium text-primary-foreground/70">HTML</span>
                    <button 
                      onClick={() => copyToClipboard(badgeSnippet)}
                      className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  </div>
                  <pre className="p-6 overflow-x-auto">
                    <code className="text-sm font-mono text-primary-foreground/90">{badgeSnippet}</code>
                  </pre>
                </div>
                <div className="bg-card rounded-xl p-8 border border-border flex items-center justify-center">
                  <div className="flex items-center gap-3 bg-secondary rounded-lg px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-badge">
                      <Shield className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Verified Provider</span>
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground text-xs">✓</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Valid until Dec 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
