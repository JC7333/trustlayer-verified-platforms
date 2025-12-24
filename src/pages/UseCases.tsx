import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  Wrench, 
  ShoppingBag, 
  Landmark, 
  GraduationCap,
  Truck,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";

const useCases = [
  {
    id: "healthcare",
    icon: Stethoscope,
    title: "Healthcare Platforms",
    subtitle: "Verify medical professionals and facilities",
    description: "Ensure your healthcare marketplace only lists qualified, licensed, and insured practitioners. Automate license verification, credential checks, and insurance validation.",
    requirements: [
      "Medical license verification",
      "Professional liability insurance",
      "DEA registration (where applicable)",
      "Background checks",
      "Continuing education credits",
    ],
    example: "A telemedicine platform uses TrustLayer to verify that all doctors have valid medical licenses in the states where they practice.",
  },
  {
    id: "home-services",
    icon: Wrench,
    title: "Home Services",
    subtitle: "Verify contractors and service providers",
    description: "Build trust with homeowners by verifying that all service providers on your platform are properly licensed, insured, and certified for their trade.",
    requirements: [
      "Trade licenses (electrical, plumbing, HVAC)",
      "General liability insurance",
      "Worker's compensation",
      "Bonding verification",
      "Background checks",
    ],
    example: "A home renovation marketplace requires all contractors to upload their trade license and insurance before they can bid on projects.",
  },
  {
    id: "marketplaces",
    icon: ShoppingBag,
    title: "B2B Marketplaces",
    subtitle: "Verify business sellers and vendors",
    description: "Reduce fraud and build buyer confidence by verifying business legitimacy, certifications, and compliance with industry standards.",
    requirements: [
      "Business registration documents",
      "Tax identification",
      "Industry certifications",
      "Product compliance certificates",
      "Supplier audits",
    ],
    example: "An industrial parts marketplace verifies that all suppliers are ISO 9001 certified before listing their products.",
  },
  {
    id: "financial",
    icon: Landmark,
    title: "Financial Services",
    subtitle: "KYB and regulatory compliance",
    description: "Streamline Know Your Business (KYB) workflows for fintech platforms. Verify corporate entities, beneficial owners, and regulatory compliance.",
    requirements: [
      "Company incorporation documents",
      "Beneficial ownership verification",
      "AML/CFT compliance",
      "Regulatory licenses",
      "Financial statements",
    ],
    example: "A B2B payments platform uses TrustLayer to verify merchant identity and collect required KYB documentation.",
  },
  {
    id: "education",
    icon: GraduationCap,
    title: "Education & Training",
    subtitle: "Verify educators and institutions",
    description: "Ensure that tutors, trainers, and educational institutions meet quality and safety standards for your learning platform.",
    requirements: [
      "Teaching certifications",
      "Background checks",
      "Academic credentials",
      "Institutional accreditation",
      "CPR/First aid (for in-person)",
    ],
    example: "An online tutoring platform verifies that all tutors have relevant teaching qualifications and pass background checks.",
  },
  {
    id: "logistics",
    icon: Truck,
    title: "Logistics & Delivery",
    subtitle: "Verify carriers and drivers",
    description: "Ensure compliance and safety in your logistics network by verifying carrier credentials, driver qualifications, and fleet certifications.",
    requirements: [
      "Carrier operating authority",
      "Commercial driver licenses",
      "Vehicle insurance",
      "DOT compliance",
      "Cargo insurance",
    ],
    example: "A freight marketplace verifies that all carriers have valid operating authority and adequate insurance coverage.",
  },
];

export default function UseCases() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      
      <main className="pt-24">
        {/* Header */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Built for every B2B vertical
              </h1>
              <p className="text-lg text-muted-foreground">
                TrustLayer provides configurable verification workflows that adapt to the specific 
                requirements of your industry. No code changes needed.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-24">
              {useCases.map((useCase, index) => (
                <div 
                  key={useCase.id} 
                  id={useCase.id}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                >
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent text-accent-foreground mb-6">
                      <useCase.icon className="h-7 w-7" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      {useCase.title}
                    </h2>
                    <p className="text-lg text-accent mb-4">{useCase.subtitle}</p>
                    <p className="text-muted-foreground mb-6">{useCase.description}</p>
                    
                    <div className="bg-card rounded-xl p-6 border border-border mb-6">
                      <h4 className="font-semibold text-foreground mb-3">Typical requirements</h4>
                      <ul className="space-y-2">
                        {useCase.requirements.map((req) => (
                          <li key={req} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-accent" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link to="/demo">
                      <Button variant="accent" className="group">
                        See how it works
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>

                  <div className={`bg-secondary/50 rounded-2xl p-8 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                    <div className="bg-card rounded-xl p-6 border border-border">
                      <p className="text-sm font-medium text-accent mb-2">Example</p>
                      <p className="text-foreground">{useCase.example}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 gradient-hero">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Don't see your vertical?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              TrustLayer is fully configurable. Our rules engine can adapt to any verification requirements. 
              Let's discuss your specific needs.
            </p>
            <Link to="/contact">
              <Button variant="hero" size="lg">
                Talk to our team
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
