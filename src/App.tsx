import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import UseCases from "./pages/UseCases";
import ApiDocs from "./pages/ApiDocs";
import Security from "./pages/Security";
import Contact from "./pages/Contact";
import Demo from "./pages/Demo";
import Auth from "./pages/Auth";
import Dashboard from "./pages/app/Dashboard";
import Providers from "./pages/app/Providers";
import Review from "./pages/app/Review";
import Inbox from "./pages/app/Inbox";
import Rules from "./pages/app/Rules";
import Notifications from "./pages/app/Notifications";
import Expirations from "./pages/app/Expirations";
import AdminEmailTest from "./pages/app/AdminEmailTest";
import ProviderUpload from "./pages/ProviderUpload";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Marketing Pages */}
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/use-cases" element={<UseCases />} />
            <Route path="/docs" element={<ApiDocs />} />
            <Route path="/security" element={<Security />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/auth" element={<Auth />} />

            {/* App Routes */}
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/inbox" element={<Inbox />} />
            <Route path="/app/providers" element={<Providers />} />
            <Route path="/app/review" element={<Review />} />
            <Route path="/app/rules" element={<Rules />} />
            <Route path="/app/notifications" element={<Notifications />} />
            <Route path="/app/expirations" element={<Expirations />} />
            <Route path="/app/admin/email-test" element={<AdminEmailTest />} />

            {/* Public Provider Portal */}
            <Route path="/u/:token" element={<ProviderUpload />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
