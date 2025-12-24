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
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const useCases = [
  {
    id: "sante",
    icon: Stethoscope,
    title: "Plateformes de santé",
    subtitle: "Vérifiez les professionnels et établissements médicaux",
    description: "Assurez-vous que votre marketplace de santé ne liste que des praticiens qualifiés, diplômés et assurés. Automatisez la vérification des diplômes, inscriptions à l'Ordre et assurances RCP.",
    requirements: [
      "Vérification des diplômes médicaux",
      "Inscription à l'Ordre des médecins",
      "Assurance responsabilité civile professionnelle",
      "Casier judiciaire",
      "Formation continue obligatoire",
    ],
    example: "Une plateforme de télémédecine utilise TrustLayer pour vérifier que tous les médecins ont une inscription valide à l'Ordre dans les départements où ils exercent.",
    stats: { reduction: "95%", time: "2h→10min" },
  },
  {
    id: "services-domicile",
    icon: Wrench,
    title: "Services à domicile",
    subtitle: "Vérifiez les artisans et prestataires",
    description: "Construisez la confiance avec les propriétaires en vérifiant que tous les prestataires de votre plateforme sont correctement immatriculés, assurés et certifiés pour leur métier.",
    requirements: [
      "Kbis ou inscription au répertoire des métiers",
      "Assurance décennale (bâtiment)",
      "Assurance responsabilité civile pro",
      "Qualification RGE (si applicable)",
      "Attestation de vigilance URSSAF",
    ],
    example: "Une marketplace de rénovation exige que tous les artisans uploadent leur Kbis et assurance décennale avant de pouvoir répondre aux demandes de devis.",
    stats: { reduction: "87%", time: "1 semaine→1 jour" },
  },
  {
    id: "marketplace-b2b",
    icon: ShoppingBag,
    title: "Marketplaces B2B",
    subtitle: "Vérifiez les vendeurs et fournisseurs professionnels",
    description: "Réduisez la fraude et renforcez la confiance des acheteurs en vérifiant la légitimité des entreprises, leurs certifications et leur conformité aux standards de l'industrie.",
    requirements: [
      "Kbis ou documents d'immatriculation",
      "Numéro de TVA intracommunautaire",
      "Certifications sectorielles (ISO, etc.)",
      "Attestations de conformité produits",
      "Audit fournisseurs",
    ],
    example: "Une marketplace de pièces industrielles vérifie que tous les fournisseurs sont certifiés ISO 9001 avant de lister leurs produits.",
    stats: { reduction: "92%", time: "3 jours→4h" },
  },
  {
    id: "services-financiers",
    icon: Landmark,
    title: "Services financiers",
    subtitle: "KYB et conformité réglementaire",
    description: "Simplifiez les workflows Know Your Business (KYB) pour les plateformes fintech. Vérifiez les entités corporatives, les bénéficiaires effectifs et la conformité réglementaire.",
    requirements: [
      "Documents d'immatriculation société",
      "Vérification des bénéficiaires effectifs",
      "Conformité LCB-FT",
      "Licences réglementaires",
      "États financiers",
    ],
    example: "Une plateforme de paiement B2B utilise TrustLayer pour vérifier l'identité des marchands et collecter la documentation KYB requise.",
    stats: { reduction: "78%", time: "5 jours→1 jour" },
  },
  {
    id: "education",
    icon: GraduationCap,
    title: "Éducation & Formation",
    subtitle: "Vérifiez les formateurs et institutions",
    description: "Assurez-vous que les tuteurs, formateurs et établissements éducatifs respectent les standards de qualité et de sécurité pour votre plateforme d'apprentissage.",
    requirements: [
      "Diplômes et certifications d'enseignement",
      "Casier judiciaire",
      "Qualifications académiques",
      "Accréditation institutionnelle",
      "Formation premiers secours (présentiel)",
    ],
    example: "Une plateforme de tutorat en ligne vérifie que tous les tuteurs ont les qualifications pédagogiques requises et un casier judiciaire vierge.",
    stats: { reduction: "89%", time: "2 semaines→2 jours" },
  },
  {
    id: "transport-logistique",
    icon: Truck,
    title: "Transport & Logistique",
    subtitle: "Vérifiez les transporteurs et chauffeurs",
    description: "Assurez la conformité et la sécurité de votre réseau logistique en vérifiant les autorisations des transporteurs, qualifications des chauffeurs et certifications de la flotte.",
    requirements: [
      "Licence de transport de marchandises",
      "Permis de conduire poids lourds",
      "Assurance marchandises",
      "Conformité ADR (matières dangereuses)",
      "Contrôle technique flotte",
    ],
    example: "Une bourse de fret vérifie que tous les transporteurs ont une licence de transport valide et une couverture d'assurance adéquate.",
    stats: { reduction: "94%", time: "1 semaine→6h" },
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
                Conçu pour chaque secteur B2B
              </h1>
              <p className="text-lg text-muted-foreground">
                TrustLayer fournit des workflows de vérification configurables qui s'adaptent aux 
                exigences spécifiques de votre industrie. Aucun développement requis.
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
                      <h4 className="font-semibold text-foreground mb-3">Documents typiques requis</h4>
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
                        Voir une démo personnalisée
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>

                  <div className={`space-y-6 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                    {/* Example Card */}
                    <div className="bg-secondary/50 rounded-2xl p-8">
                      <div className="bg-card rounded-xl p-6 border border-border">
                        <p className="text-sm font-medium text-accent mb-2">Exemple concret</p>
                        <p className="text-foreground">{useCase.example}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card rounded-xl p-6 border border-border text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-success" />
                          <span className="text-2xl font-bold text-foreground">{useCase.stats.reduction}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Réduction des erreurs</p>
                      </div>
                      <div className="bg-card rounded-xl p-6 border border-border text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Clock className="h-5 w-5 text-accent" />
                          <span className="text-lg font-bold text-foreground">{useCase.stats.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Temps de traitement</p>
                      </div>
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
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-badge shadow-glow">
                <Shield className="h-8 w-8 text-accent-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Votre secteur n'est pas listé ?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              TrustLayer est entièrement configurable. Notre moteur de règles peut s'adapter à n'importe 
              quelles exigences de vérification. Discutons de vos besoins spécifiques.
            </p>
            <Link to="/contact">
              <Button variant="hero" size="lg">
                Parler à notre équipe
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
