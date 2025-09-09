import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
// Removed: Leads standalone and LeadManager/Dashboard
import LeadManagerLeads from "./pages/LeadManager/Leads";
import LeadManagerSMS from "./pages/LeadManager/SMS";
import LeadManagerMailbox from "./pages/LeadManager/Mailbox";
// Removed: Setup/Kunjiee and Setup/ZongDialer
// Removed: Support/Leads
import SupportRoles from "./pages/Support/Roles";
import SupportSettings from "./pages/Support/Settings";
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";
import RoleAssignment from "./pages/RoleAssignment";
import AIAssistant from "./pages/AI/AIAssistant";
import EmailGenerator from "./pages/AI/EmailGenerator";
import MeetingNotes from "./pages/AI/MeetingNotes";
import CustomPrompts from "./pages/AI/CustomPrompts";
import Profile from "./pages/Profile";
import MeetingScheduling from "./pages/MeetingScheduling";

import NotFound from "./pages/NotFound";
import Performance from "./pages/Analytics/Performance";
import Reports from "./pages/Analytics/Reports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/tasks" element={
              <ProtectedRoute requiredPermission={{ resource: 'tasks', action: 'read' }}>
                <AppLayout>
                  <Tasks />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Lead Manager Routes */}
            <Route path="/lead-manager/leads" element={
              <ProtectedRoute requiredPermission={{ resource: 'contacts', action: 'read' }}>
                <AppLayout>
                  <LeadManagerLeads />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/lead-manager/sms" element={
              <ProtectedRoute requiredPermission={{ resource: 'contacts', action: 'read' }}>
                <AppLayout>
                  <LeadManagerSMS />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/lead-manager/mailbox" element={
              <ProtectedRoute requiredPermission={{ resource: 'contacts', action: 'read' }}>
                <AppLayout>
                  <LeadManagerMailbox />
                </AppLayout>
              </ProtectedRoute>
            } />
             <Route path="/anylatics/performance" element={
              <ProtectedRoute requiredPermission={{ resource: 'contacts', action: 'read' }}>
                <AppLayout>
                  <Performance />
                </AppLayout>
              </ProtectedRoute>
            } />
              <Route path="/analytics/reports" element={
              <ProtectedRoute requiredPermission={{ resource: 'contacts', action: 'read' }}>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Setup Routes */}
            <Route path="/setup/users" element={
              <ProtectedRoute requiredPermission={{ resource: 'users', action: 'read' }}>
                <AppLayout>
                  <UserManagement />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Support Routes */}
            <Route path="/support/roles" element={
              <ProtectedRoute requiredPermission={{ resource: 'roles', action: 'read' }}>
                <AppLayout>
                  <RoleManagement />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/support/role-assignment" element={
              <ProtectedRoute requiredPermission={{ resource: 'users', action: 'assign' }}>
                <AppLayout>
                  <RoleAssignment />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* AI Assistant Routes */}
            <Route path="/ai-assistant" element={
              <ProtectedRoute requiredPermission={{ resource: 'ai_generator', action: 'read' }}>
                <AppLayout>
                  <AIAssistant />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/ai-assistant/email" element={
              <ProtectedRoute requiredPermission={{ resource: 'ai_generator', action: 'generate' }}>
                <AppLayout>
                  <EmailGenerator />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/ai-assistant/meetings" element={
              <ProtectedRoute requiredPermission={{ resource: 'ai_generator', action: 'generate' }}>
                <AppLayout>
                  <MeetingNotes />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/ai-assistant/prompts" element={
              <ProtectedRoute requiredPermission={{ resource: 'ai_generator', action: 'generate' }}>
                <AppLayout>
                  <CustomPrompts />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/support/settings" element={
              <ProtectedRoute requiredPermission={{ resource: 'settings', action: 'read' }}>
                <AppLayout>
                  <SupportSettings />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/meeting-scheduling" element={
              <ProtectedRoute requiredPermission={{ resource: 'calendar', action: 'read' }}>
                <AppLayout>
                  <MeetingScheduling />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Redirect root to dashboard if authenticated, otherwise to login */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
