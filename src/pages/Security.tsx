import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { 
  Shield, 
  Lock, 
  Eye, 
  Server, 
  FileCheck, 
  Clock,
  Users,
  Globe
} from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "Encryption at Rest & In Transit",
    description: "All data is encrypted using AES-256 at rest and TLS 1.3 in transit. Database backups are encrypted and stored in geographically separate locations.",
  },
  {
    icon: Eye,
    title: "Data Minimization",
    description: "We only collect and store data that is strictly necessary for verification purposes. No PII is displayed on public badge pages.",
  },
  {
    icon: Server,
    title: "Infrastructure Security",
    description: "Hosted on SOC 2 Type II certified infrastructure. Regular penetration testing and vulnerability assessments by independent auditors.",
  },
  {
    icon: Clock,
    title: "Configurable Retention",
    description: "Each platform can define their own data retention policies. Automatic purging of expired evidence per your configuration.",
  },
  {
    icon: Users,
    title: "Role-Based Access Control",
    description: "Granular permissions with PlatformOwner, PlatformAdmin, Reviewer, and Viewer roles. Complete audit trail of all access and actions.",
  },
  {
    icon: FileCheck,
    title: "Complete Audit Trail",
    description: "Every action—uploads, reviews, decisions, API calls—is logged with timestamp, user, and IP. Immutable audit logs for compliance.",
  },
];

const certifications = [
  { name: "SOC 2 Type II", description: "Annual audit of security, availability, and confidentiality controls" },
  { name: "GDPR Compliant", description: "Full compliance with EU data protection regulations" },
  { name: "ISO 27001", description: "Information security management system certification" },
  { name: "HIPAA Ready", description: "Available for healthcare platforms requiring HIPAA compliance" },
];

export default function Security() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      
      <main className="pt-24">
        {/* Header */}
        <section className="py-16 gradient-hero">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent shadow-glow mb-6">
                <Shield className="h-8 w-8 text-accent-foreground" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-primary-foreground mb-4">
                Security & Privacy
              </h1>
              <p className="text-lg text-primary-foreground/70">
                TrustLayer is built with security and privacy at its core. We handle sensitive 
                verification data with the utmost care and transparency.
              </p>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                How we protect your data
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {securityFeatures.map((feature) => (
                  <div key={feature.title} className="bg-card rounded-xl p-6 border border-border">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RLS & Multi-tenancy */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">Multi-Tenant Isolation</h2>
              <p className="text-muted-foreground mb-8">
                TrustLayer uses Row-Level Security (RLS) to ensure complete data isolation between platforms. 
                Each platform can only access their own profiles, verification requests, and evidence.
              </p>
              <div className="bg-card rounded-xl p-8 border border-border">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Platform Isolation</h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        Database-level isolation via RLS policies
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        Separate storage buckets per platform
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        Platform-scoped API keys
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        Independent audit logs
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">User Role Separation</h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        PlatformOwner: Full platform configuration
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        PlatformAdmin: Manage users and settings
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        Reviewer: Review and decide on verifications
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        Viewer: Read-only access to data
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Certifications & Compliance
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {certifications.map((cert) => (
                  <div key={cert.name} className="flex items-start gap-4 bg-card rounded-xl p-6 border border-border">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data Processing */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Processing & Privacy</h2>
              <div className="prose prose-sm max-w-none">
                <div className="bg-card rounded-xl p-8 border border-border space-y-6 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Data Controller vs Processor</h3>
                    <p className="text-sm">
                      TrustLayer acts as a Data Processor on behalf of our platform customers (Data Controllers). 
                      We process personal data only as instructed by the platform and in accordance with our 
                      Data Processing Agreement (DPA).
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Sub-processors</h3>
                    <p className="text-sm">
                      We maintain a transparent list of sub-processors. All sub-processors undergo security 
                      review and sign binding data protection agreements. Major changes to sub-processors 
                      are communicated 30 days in advance.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Data Location</h3>
                    <p className="text-sm">
                      Data is stored in EU data centers by default. Enterprise customers can request 
                      specific geographic deployment options to meet local data residency requirements.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Data Subject Rights</h3>
                    <p className="text-sm">
                      We provide tools and APIs to help platforms respond to data subject access requests (DSARs), 
                      deletion requests, and portability requests within regulatory timelines.
                    </p>
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
