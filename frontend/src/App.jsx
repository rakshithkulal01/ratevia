import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/ui/Navbar';
import { Footer } from './components/ui/Footer';
import { DesignSystemShowcase } from './pages/DesignSystemShowcase';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { AuthCallbackPage } from './pages/auth/AuthCallbackPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';
import { QRManagementPage } from './pages/dashboard/QRManagementPage';
import { CustomerRoutePage } from './pages/customer/CustomerRoutePage';

export function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent/20 selection:text-accent">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<DesignSystemShowcase />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Informational Public Pages */}
            <Route
              path="/pricing"
              element={
                <PlaceholderPage
                  title="Pricing & Free Trial"
                  description="Ratevia offers a 20-day free trial for local businesses with full feature access and no credit card required."
                  phase={3}
                  route="/pricing"
                />
              }
            />
            <Route
              path="/faq"
              element={
                <PlaceholderPage
                  title="Frequently Asked Questions"
                  description="Learn how Ratevia works, QR code placement best practices, Google review compliance, and data privacy."
                  phase={3}
                  route="/faq"
                />
              }
            />

            {/* Protected Route: Business Onboarding */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Route: Business Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PlaceholderPage
                    title="Business Overview Dashboard"
                    description="Real-time KPI metrics for QR scans, feedback submissions, Google review-link clicks, and average customer ratings."
                    phase={7}
                    route="/dashboard"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute>
                  <PlaceholderPage
                    title="Analytics & Customer Insights"
                    description="Recharts visualizations for rating distribution, review trend graphs, and liked vs. improvement topic breakdowns."
                    phase={7}
                    route="/dashboard/analytics"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/feedback"
              element={
                <ProtectedRoute>
                  <PlaceholderPage
                    title="Customer Feedback History"
                    description="Historical audit log of all customer reviews, ratings, selected topics, and Google link statuses."
                    phase={7}
                    route="/dashboard/feedback"
                  />
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
                  <PlaceholderPage
                    title="Business Settings"
                    description="Manage business profile, name, type, and Google Review URL."
                    phase={7}
                    route="/dashboard/business"
                  />
                </ProtectedRoute>
              }
            />

            {/* Protected Route: Admin Control Center */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <PlaceholderPage
                    title="Admin Control Center"
                    description="Platform-wide business directory, trial extensions (7/14/30 days), and access management."
                    phase={8}
                    route="/admin"
                  />
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
