import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const DashboardContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

/**
 * Shared Dashboard Data Provider
 *
 * Fetches dashboard datasets (business, analytics, feedback, qr) ONCE
 * concurrently when the dashboard is initialized.
 *
 * Keeps all data in client memory for instant page switches without refetching.
 * On browser refresh (F5), memory clears naturally and fresh data is loaded.
 */
export const DashboardDataProvider = ({ children }) => {
  const { session, user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  // Guard against duplicate execution in React StrictMode and duplicate in-flight requests
  const hasLoadedForTokenRef = useRef(null);
  const inFlightPromiseRef = useRef(null);

  const loadDashboardData = useCallback(async (force = false) => {
    const token = session?.access_token;
    if (!token) return;

    // Isolation: Admin accounts should be redirected away from business dashboard
    if (user?.role === 'ADMIN') {
      navigate('/admin', { replace: true });
      return;
    }

    // Guard against React StrictMode duplicate execution unless manually forced (e.g., retry)
    if (!force && hasLoadedForTokenRef.current === token && dashboardData) {
      return;
    }

    if (inFlightPromiseRef.current) {
      return inFlightPromiseRef.current;
    }

    setLoading(true);
    setError(null);

    const headers = { Authorization: `Bearer ${token}` };

    const fetchEndpoint = async (path) => {
      const res = await fetch(`${API_URL}${path}`, { headers });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const err = new Error(errorData.message || `Request to ${path} failed with status ${res.status}`);
        err.status = res.status;
        err.data = errorData;
        throw err;
      }
      return res.json();
    };

    inFlightPromiseRef.current = (async () => {
      try {
        // Fetch all independent dashboard data concurrently in parallel
        const [businessRes, analyticsRes, feedbackRes, qrRes] = await Promise.allSettled([
          fetchEndpoint('/api/business'),
          fetchEndpoint('/api/analytics'),
          fetchEndpoint('/api/feedback'),
          fetchEndpoint('/api/qr'),
        ]);

        const nextErrors = {};
        let businessData = null;
        let analyticsData = null;
        let feedbackData = null;
        let qrData = null;

        // 1. Process Business profile
        if (businessRes.status === 'fulfilled') {
          businessData = businessRes.value.business;
          if (!businessData) {
            navigate('/onboarding');
            return;
          }
        } else {
          nextErrors.business = businessRes.reason?.message || 'Failed to load business profile.';
        }

        // 2. Process Analytics
        if (analyticsRes.status === 'fulfilled') {
          analyticsData = analyticsRes.value;
        } else {
          nextErrors.analytics = analyticsRes.reason?.message || 'Failed to load analytics data.';
        }

        // 3. Process Feedback
        if (feedbackRes.status === 'fulfilled') {
          feedbackData = feedbackRes.value;
        } else {
          nextErrors.feedback = feedbackRes.reason?.message || 'Failed to load feedback history.';
        }

        // 4. Process QR configuration
        if (qrRes.status === 'fulfilled') {
          qrData = qrRes.value;
        } else {
          nextErrors.qr = qrRes.reason?.message || 'Failed to load QR settings.';
        }

        setErrors(nextErrors);

        // If primary business fails, record overall error
        if (nextErrors.business && !businessData) {
          setError(nextErrors.business);
        } else {
          setError(null);
        }

        setDashboardData({
          business: businessData,
          analytics: analyticsData,
          feedback: feedbackData,
          qr: qrData,
        });

        hasLoadedForTokenRef.current = token;
      } catch (err) {
        console.error('[DashboardDataProvider] Unexpected error loading dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
        inFlightPromiseRef.current = null;
      }
    })();

    return inFlightPromiseRef.current;
  }, [session?.access_token, user?.role, navigate, dashboardData]);

  useEffect(() => {
    if (!session?.access_token) return;
    loadDashboardData();
  }, [session?.access_token, loadDashboardData]);

  // Update business profile in cached state (e.g., when saved from Settings)
  const updateBusiness = useCallback((newBusiness) => {
    setDashboardData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        business: newBusiness ? { ...prev.business, ...newBusiness } : prev.business,
      };
    });
  }, []);

  // Update QR configuration in cached state (e.g., when toggled or regenerated)
  const updateQR = useCallback((newQrCode, newCustomerUrl) => {
    setDashboardData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        qr: {
          ...prev.qr,
          ...(newQrCode ? { qrCode: newQrCode } : {}),
          ...(newCustomerUrl ? { customerUrl: newCustomerUrl } : {}),
        },
      };
    });
  }, []);

  const value = {
    dashboardData,
    loading,
    error,
    errors,
    refetch: () => loadDashboardData(true),
    updateBusiness,
    updateQR,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardData = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    return {
      dashboardData: null,
      loading: false,
      error: null,
      errors: {},
      refetch: () => {},
      updateBusiness: () => {},
      updateQR: () => {},
    };
  }
  return context;
};

export const useDashboard = useDashboardData;
export default DashboardContext;
