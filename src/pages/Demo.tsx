import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const benefits = [
  "See the complete verification workflow in action",
  "Configure a rules package for your vertical",
  "Test the API and webhook integrations",
  "Explore the reviewer console and evidence vault",
  "Get answers to your specific questions",
];

export default function Demo() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    vertical: "",
    volume: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Demo request received! Check your email for scheduling options.");
    setFormData({ name: "", email: "", company: "", vertical: "", volume: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      
      <main className="pt-24">
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left side - Value Prop */}
                <div>
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent text-accent-foreground mb-6">
                    <Calendar className="h-7 w-7" />
                  </div>
                  <h1 className="text-4xl font-bold text-foreground mb-4">
                    Book a personalized demo
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    See how TrustLayer can streamline your verification workflows. 
                    We'll customize the demo to your specific use case and answer all your questions.
                  </p>

                  <div className="space-y-4">
                    {benefits.map((benefit) => (
                      <div key={benefit} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 p-6 bg-secondary/50 rounded-xl">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Quick call:</strong> 30 minutes with a product specialist. 
                      We'll follow up with sandbox access and documentation.
                    </p>
                  </div>
                </div>

                {/* Right side - Form */}
                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Request your demo</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Your name
                      </label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Work email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="john@company.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                        Company
                      </label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        required
                        placeholder="Your Company"
                      />
                    </div>
                    <div>
                      <label htmlFor="vertical" className="block text-sm font-medium text-foreground mb-2">
                        Your vertical
                      </label>
                      <Select 
                        value={formData.vertical} 
                        onValueChange={(value) => setFormData({ ...formData, vertical: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="home-services">Home Services</SelectItem>
                          <SelectItem value="marketplace">B2B Marketplace</SelectItem>
                          <SelectItem value="financial">Financial Services</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="logistics">Logistics</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="volume" className="block text-sm font-medium text-foreground mb-2">
                        Expected monthly verifications
                      </label>
                      <Select 
                        value={formData.volume} 
                        onValueChange={(value) => setFormData({ ...formData, volume: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select volume" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-100">Under 100</SelectItem>
                          <SelectItem value="100-500">100 - 500</SelectItem>
                          <SelectItem value="500-1000">500 - 1,000</SelectItem>
                          <SelectItem value="1000-5000">1,000 - 5,000</SelectItem>
                          <SelectItem value="over-5000">Over 5,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" variant="accent" size="lg" className="w-full">
                      Book my demo
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      We'll respond within 24 hours with available time slots.
                    </p>
                  </form>
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
