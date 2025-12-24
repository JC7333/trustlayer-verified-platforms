import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 gradient-hero relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent shadow-glow mb-8">
            <Shield className="h-8 w-8 text-accent-foreground" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to streamline your verification workflow?
          </h2>

          <p className="text-lg text-primary-foreground/70 mb-10 max-w-xl mx-auto">
            Join 500+ platforms that trust TrustLayer for eligibility verification, 
            proof management, and compliance workflows.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo">
              <Button variant="hero" size="xl" className="group">
                Book a demo
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/sandbox">
              <Button variant="hero-outline" size="xl">
                Try sandbox free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
