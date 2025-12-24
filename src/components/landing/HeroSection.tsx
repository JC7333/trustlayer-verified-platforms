import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, CheckCircle2, ArrowRight, Sparkles, Play, Users, FileCheck, Zap } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";
import { useEffect, useState } from "react";

const stats = [
  { value: "500+", label: "Plateformes" },
  { value: "2M+", label: "Vérifications" },
  { value: "99.9%", label: "Uptime" },
  { value: "<24h", label: "Temps moyen" },
];

export function HeroSection() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev < 2847 ? prev + 47 : 2847));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundImage: `url(${heroBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Live counter badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-dark mb-8 animate-fade-in">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-primary-foreground/90">
              <span className="font-bold text-accent">{count.toLocaleString()}</span> vérifications ce mois
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground leading-tight mb-6 animate-slide-up">
            Orchestrez vos vérifications
            <br />
            <span className="text-gradient">en toute confiance</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Centralisez les preuves, automatisez les contrôles et délivrez des badges de confiance. 
            La plateforme de vérification conçue pour les marketplaces B2B.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link to="/demo">
              <Button variant="hero" size="xl" className="group">
                Réserver une démo
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/sandbox">
              <Button variant="hero-outline" size="xl" className="group">
                <Play className="h-5 w-5" />
                Essayer le sandbox
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-primary-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-primary-foreground/60 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <span className="text-sm">SOC 2 Type II</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <span className="text-sm">Conforme RGPD</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <span className="text-sm">Hébergé en Europe</span>
            </div>
          </div>
        </div>

        {/* Floating Cards */}
        <div className="absolute bottom-20 right-10 hidden xl:block animate-float">
          <div className="glass-dark rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-badge">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary-foreground">Prestataire Vérifié</span>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <span className="text-xs text-primary-foreground/60">Pack Santé-FR • Score 94/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-32 left-10 hidden xl:block animate-float" style={{ animationDelay: "2s" }}>
          <div className="glass-dark rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/20">
                <FileCheck className="h-4 w-4 text-success" />
              </div>
              <div>
                <span className="text-xs font-medium text-primary-foreground">Document validé</span>
                <p className="text-[10px] text-primary-foreground/50">Attestation RC Pro</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-48 right-32 hidden xl:block animate-float" style={{ animationDelay: "3s" }}>
          <div className="glass-dark rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                <Zap className="h-4 w-4 text-accent" />
              </div>
              <span className="text-xs font-medium text-primary-foreground">+23 vérifications aujourd'hui</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
