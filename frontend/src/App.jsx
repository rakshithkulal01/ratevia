import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/ui/Navbar';
import { Footer } from './components/ui/Footer';

// Marketing & Public Pages
import { HomePage } from './pages/marketing/HomePage';
import { PricingPage } from './pages/marketing/PricingPage';
import { FAQPage } from './pages/marketing/FAQPage';
import { ContactPage } from './pages/marketing/ContactPage';
import { DesignSystemShowcase } from './pages/DesignSystemShowcase';
import { PlaceholderPage } from './pages/PlaceholderPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { AuthCallbackPage } from './pages/auth/AuthCallbackPage';

// Business Onboarding
import { OnboardingPage } from './pages/onboarding/OnboardingPage';

// Business Dashboard Pages
import { DashboardOverviewPage } from './pages/dashboard/DashboardOverviewPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { FeedbackHistoryPage } from './pages/dashboard/FeedbackHistoryPage';
import { QRManagementPage } from './pages/dashboard/QRManagementPage';
import { BusinessSettingsPage } from './pages/dashboard/BusinessSettingsPage';

// Admin Control Center
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Customer Public QR Route
import { CustomerRoutePage } from './pages/customer/CustomerRoutePage';

export function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent/20 selection:text-accent">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/design-system" element={<DesignSystemShowcase />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Protected Route: Business Onboarding */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes: Business Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardOverviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/feedback"
              element={
                <ProtectedRoute>
                  <FeedbackHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/qr"
              element={
                <ProtectedRoute>
                  <QRManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/business"
              element={
                <ProtectedRoute>
                  <BusinessSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Route: Admin Control Center */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Public Customer Feedback Route */}
            <Route path="/r/:businessSlug" element={<CustomerRoutePage />} />

            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <PlaceholderPage
                  title="Page Not Found (404)"
                  description="The requested page could not be located."
                  phase={2}
                  route="*"
                />
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
