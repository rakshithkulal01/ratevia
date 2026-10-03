import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/ui/Navbar';
import { Footer } from './components/ui/Footer';

// Marketing & Public Pages (Static for instant First Contentful Paint)
import { HomePage } from './pages/marketing/HomePage';
import { PricingPage } from './pages/marketing/PricingPage';
import { FAQPage } from './pages/marketing/FAQPage';
import { ContactPage } from './pages/marketing/ContactPage';
import { ReviewQRCodePage } from './pages/marketing/ReviewQRCodePage';
import { CategoryLandingPage } from './pages/marketing/CategoryLandingPage';
import { GetMoreGoogleReviewsGuide } from './pages/marketing/GetMoreGoogleReviewsGuide';
import { HowReviewQRCodesWorkGuide } from './pages/marketing/HowReviewQRCodesWorkGuide';
import { DesignSystemShowcase } from './pages/DesignSystemShowcase';
import { PlaceholderPage } from './pages/PlaceholderPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { AuthCallbackPage } from './pages/auth/AuthCallbackPage';

// Public QR Customizer
import { PublicQRCustomizePage } from './pages/public/PublicQRCustomizePage';

// Customer Public QR Route (Direct ephemeral interaction)
import { CustomerRoutePage } from './pages/customer/CustomerRoutePage';

// Lazy-Loaded Protected & Heavy Chunks (Code-split for performance)
const OnboardingPage = lazy(() =>
  import('./pages/onboarding/OnboardingPage').then((m) => ({ default: m.OnboardingPage }))
);
const DashboardOverviewPage = lazy(() =>
  import('./pages/dashboard/DashboardOverviewPage').then((m) => ({ default: m.DashboardOverviewPage }))
);
const AnalyticsPage = lazy(() =>
  import('./pages/dashboard/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
const FeedbackHistoryPage = lazy(() =>
  import('./pages/dashboard/FeedbackHistoryPage').then((m) => ({ default: m.FeedbackHistoryPage }))
);
const QRManagementPage = lazy(() =>
  import('./pages/dashboard/QRManagementPage').then((m) => ({ default: m.QRManagementPage }))
);
const BusinessSettingsPage = lazy(() =>
  import('./pages/dashboard/BusinessSettingsPage').then((m) => ({ default: m.BusinessSettingsPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
    <div className="h-7 w-7 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    <span className="text-xs font-mono text-muted-foreground">Loading...</span>
  </div>
);

export function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent/20 selection:text-accent">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Core Public & Marketing Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/qr-customize" element={<PublicQRCustomizePage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* SEO Landing & Category Hubs */}
            <Route path="/review-qr-code" element={<ReviewQRCodePage />} />
            <Route path="/review-qr-code/:category" element={<CategoryLandingPage />} />

            {/* Informational Guides & SEO Articles */}
            <Route path="/guides/get-more-google-reviews" element={<GetMoreGoogleReviewsGuide />} />
            <Route path="/guides/how-review-qr-codes-work" element={<HowReviewQRCodesWorkGuide />} />

            {/* Internal / Showcase */}
            <Route path="/design-system" element={<DesignSystemShowcase />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Protected Route: Business Onboarding (Lazy) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <OnboardingPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Protected Routes: Business Dashboard (Lazy) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <DashboardOverviewPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AnalyticsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/feedback"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <FeedbackHistoryPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/qr"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <QRManagementPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/business"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <BusinessSettingsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Protected Routes: Admin Control Center (Lazy) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboardPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/qr-requests"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboardPage defaultTab="qr-requests" />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboardPage defaultTab="pricing" />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pricing"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboardPage defaultTab="pricing" />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/admins"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboardPage defaultTab="admins" />
                  </Suspense>
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

