import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thanks for reaching out! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", company: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      
      <main className="pt-24">
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left side - Info */}
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-4">
                    Let's talk
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Whether you're exploring verification solutions or ready to get started, 
                    we'd love to hear from you.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Book a demo</h3>
                        <p className="text-sm text-muted-foreground">
                          See TrustLayer in action with a personalized walkthrough tailored to your use case.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Enterprise inquiries</h3>
                        <p className="text-sm text-muted-foreground">
                          Custom integrations, dedicated support, and volume pricing for large platforms.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">General questions</h3>
                        <p className="text-sm text-muted-foreground">
                          support@trustlayer.io
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Form */}
                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Send us a message</h2>
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
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        How can we help?
                      </label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        placeholder="Tell us about your verification needs..."
                        rows={4}
                      />
                    </div>
                    <Button type="submit" variant="accent" className="w-full">
                      Send message
                    </Button>
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
