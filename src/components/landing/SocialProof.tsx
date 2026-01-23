import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "TrustLayer a divisé par 3 notre temps de vérification des prestataires. L'IA détecte les documents invalides avant même que nos équipes les examinent.",
    author: "Marie Dupont",
    role: "Directrice Ops",
    company: "MediConnect",
    avatar: "MD",
  },
  {
    quote:
      "Enfin une solution qui comprend les besoins des marketplaces B2B. Le white-label nous permet de garder une expérience 100% à notre marque.",
    author: "Thomas Bernard",
    role: "CTO",
    company: "ProServices",
    avatar: "TB",
  },
  {
    quote:
      "Les badges de confiance ont augmenté de 40% le taux de conversion sur notre marketplace. Les acheteurs font confiance aux profils vérifiés.",
    author: "Sophie Martin",
    role: "Product Manager",
    company: "IndustriHub",
    avatar: "SM",
  },
];

const logos = [
  "MediConnect",
  "ProServices",
  "IndustriHub",
  "TechSupply",
  "HealthFirst",
  "BuildPro",
];

export function SocialProof() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logos */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-sm text-muted-foreground mb-8">
            ILS NOUS FONT CONFIANCE
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {logos.map((logo) => (
              <div
                key={logo}
                className="text-lg font-bold text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="bg-card rounded-2xl p-8 border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300"
              >
                <Quote className="h-8 w-8 text-accent/30 mb-4" />
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-accent text-accent-foreground font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
