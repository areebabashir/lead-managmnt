import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
// Removed: Leads standalone and LeadManager/Dashboard
import LeadManagerLeads from "./pages/LeadManager/Leads";
import LeadManagerSMS from "./pages/LeadManager/SMS";
import LeadManagerMailbox from "./pages/LeadManager/Mailbox";
// Removed: Setup/Kunjiee and Setup/ZongDialer
import SetupStaff from "./pages/Setup/Staff";
import SupportTickets from "./pages/Support/Tickets";
import SupportKnowledgeBase from "./pages/Support/KnowledgeBase";
// Removed: Support/Leads
import SupportRoles from "./pages/Support/Roles";
import SupportSettings from "./pages/Support/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            {/* Removed standalone Leads */}
            
            {/* Lead Manager Routes */}
            {/* Removed Lead Manager Dashboard */}
            <Route path="/lead-manager/leads" element={<LeadManagerLeads />} />
            <Route path="/lead-manager/sms" element={<LeadManagerSMS />} />
            <Route path="/lead-manager/mailbox" element={<LeadManagerMailbox />} />
            
            {/* Setup Routes */}
            {/* Removed Setup Kunjiee and Zong Dialer */}
            <Route path="/setup/staff" element={<SetupStaff />} />
            
            {/* Support Routes */}
            <Route path="/support/tickets" element={<SupportTickets />} />
            <Route path="/support/knowledge-base" element={<SupportKnowledgeBase />} />
            {/* Removed Support Leads */}
            <Route path="/support/roles" element={<SupportRoles />} />
            <Route path="/support/settings" element={<SupportSettings />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
