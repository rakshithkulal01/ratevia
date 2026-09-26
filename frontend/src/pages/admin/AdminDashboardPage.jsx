import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Shield,
  CheckCircle2,
  RotateCcw,
  Plus,
  Search,
} from 'lucide-react';

import { adminService } from '../../services/adminService';
import { AdminStatsGrid } from '../../components/admin/AdminStatsGrid';
import { BusinessRequestTable } from '../../components/admin/BusinessRequestTable';
import { BusinessRequestDetailModal } from '../../components/admin/BusinessRequestDetailModal';
import { BusinessDirectoryTable } from '../../components/admin/BusinessDirectoryTable';
import { ProvisionBusinessModal } from '../../components/admin/ProvisionBusinessModal';

export const AdminDashboardPage = () => {
  const { session, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('ALL');

  // Action states
  const [updatingId, setUpdatingId] = useState(null);
  const [loggingContactId, setLoggingContactId] = useState(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modal States
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionName, setProvisionName] = useState('');
  const [provisionType, setProvisionType] = useState('CAFE');
  const [provisionGoogleUrl, setProvisionGoogleUrl] = useState('');
  const [provisionOwnerEmail, setProvisionOwnerEmail] = useState('');
  const [provisionOwnerName, setProvisionOwnerName] = useState('');
  const [provisionRequestId, setProvisionRequestId] = useState(null);
  const [provisioning, setProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState(null);

  const isAdmin = user?.role === 'ADMIN';

  const loadAdminData = async () => {
    if (!session?.access_token) return;
    try {
      setLoading(true);
      setError(null);

      const [statsData, businessesData, requestsData] = await Promise.all([
        adminService.getStats(session.access_token),
        adminService.getBusinesses(session.access_token),
        adminService.getBusinessRequests(session.access_token),
      ]);

      setStats(statsData.stats);
      setBusinesses(businessesData.businesses || []);
      setRequests(requestsData.requests || []);
    } catch (err) {
      if (err.status === 403) {
        setError('FORBIDDEN');
      } else {
        setError(err.message || 'Failed to fetch admin platform data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [session]);

  const handleCopyPhone = (phone, id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  const handleLogContact = async (requestId, e) => {
    if (e) e.stopPropagation();
    try {
      setLoggingContactId(requestId);
      setActionSuccess(null);

      const json = await adminService.logContact(session.access_token, requestId);
      setActionSuccess(`Marked request for "${json.request.businessName}" as CONTACTED`);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, ...json.request } : r))
      );
      if (selectedRequest?.id === requestId) {
        setSelectedRequest((prev) => ({ ...prev, ...json.request }));
      }
      await loadAdminData();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.message || 'Failed to log contact.');
    } finally {
      setLoggingContactId(null);
    }
  };

  const handleOpenProvisionFromRequest = (req, e) => {
    if (e) e.stopPropagation();
    setProvisionName(req.businessName || '');
    setProvisionType(req.businessType || 'CAFE');
    setProvisionGoogleUrl('');
    setProvisionOwnerEmail(req.email || '');
    setProvisionOwnerName(req.ownerName || '');
    setProvisionRequestId(req.id);
    setProvisionError(null);
    setShowProvisionModal(true);
  };

  const handleToggleStatus = async (businessId, currentActive) => {
    try {
      setUpdatingId(businessId);
      setActionSuccess(null);

      const targetActive = !currentActive;
      await adminService.toggleBusinessStatus(session.access_token, businessId, targetActive);
      setActionSuccess(`Business status set to ${targetActive ? 'ACTIVE' : 'SUSPENDED'}`);
      await loadAdminData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert(err.message || 'Action failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    setProvisionError(null);

    if (!provisionName.trim()) {
      setProvisionError('Business name is required.');
      return;
    }
    if (!provisionGoogleUrl.trim().startsWith('http')) {
      setProvisionError('Google Review URL must begin with http:// or https://');
      return;
    }
    if (!provisionOwnerEmail.trim()) {
      setProvisionError('Owner email is required.');
      return;
    }

    try {
      setProvisioning(true);
      await adminService.provisionBusiness(session.access_token, {
        name: provisionName.trim(),
        businessType: provisionType,
        googleReviewUrl: provisionGoogleUrl.trim(),
        ownerEmail: provisionOwnerEmail.trim(),
        ownerName: provisionOwnerName.trim() || null,
        requestId: provisionRequestId || null,
      });

      setActionSuccess(
        `Business "${provisionName}" provisioned successfully!${
          provisionRequestId ? ' Registration request marked PROVISIONED.' : ''
        }`
      );
      setShowProvisionModal(false);
      setProvisionName('');
      setProvisionGoogleUrl('');
      setProvisionOwnerEmail('');
      setProvisionOwnerName('');
      setProvisionRequestId(null);
      if (selectedRequest && selectedRequest.id === provisionRequestId) {
        setSelectedRequest(null);
      }
      await loadAdminData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setProvisionError(err.message || 'Failed to provision business.');
    } finally {
      setProvisioning(false);
    }
  };

  if (!isAdmin && error === 'FORBIDDEN') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-red-200 bg-red-50/40 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-red-100 text-red-600 mx-auto">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl text-foreground font-semibold">Admin Access Restricted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your authenticated account (<code className="font-mono text-foreground">{user?.email}</code>) has the role{' '}
            <Badge variant="outline" className="text-[10px]">{user?.role || 'BUSINESS_OWNER'}</Badge>.
            Only users with the <strong className="text-foreground">ADMIN</strong> role may provision businesses and manage platform access.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={() => (window.location.href = '/dashboard')} className="rounded-md">
              Return to Business Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Filtered requests and businesses
  const filteredRequests = requests.filter((r) => {
    if (requestStatusFilter !== 'ALL' && r.status !== requestStatusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.businessName.toLowerCase().includes(q) ||
      r.ownerName.toLowerCase().includes(q) ||
      r.phoneNumber.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q)
    );
  });

  const filteredBusinesses = businesses.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      b.owner?.email?.toLowerCase().includes(q) ||
      b.owner?.name?.toLowerCase().includes(q)
    );
  });

  const newRequestsCount = requests.filter((r) => r.status === 'NEW').length;
  const contactedRequestsCount = requests.filter((r) => r.status === 'CONTACTED').length;

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Header */}
      <div className="border-b border-border bg-white shadow-xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-accent mb-1 font-semibold">
                <Shield className="h-3.5 w-3.5" />
                <span>PLATFORM ADMINISTRATION</span>
              </div>
              <h1 className="font-display text-3xl text-foreground font-normal">
                Admin Control Center<span className="text-accent">.</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Review business inquiries, log sales contacts, and provision ₹1,000 one-time accounts.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                className="rounded-md"
                onClick={() => {
                  setProvisionRequestId(null);
                  setProvisionName('');
                  setProvisionOwnerEmail('');
                  setProvisionOwnerName('');
                  setProvisionGoogleUrl('');
                  setShowProvisionModal(true);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Provision Business
              </Button>
              <Button variant="outline" size="sm" className="rounded-md" onClick={loadAdminData} disabled={loading}>
                <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {actionSuccess && (
          <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Platform KPI Metrics */}
        <AdminStatsGrid
          stats={stats}
          newRequestsCount={newRequestsCount}
          contactedRequestsCount={contactedRequestsCount}
          totalRequestsCount={requests.length}
        />

        {/* Tab Navigation */}
        <div className="flex border-b border-border space-x-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'requests'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Business Requests</span>
            {newRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                {newRequestsCount} new
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('businesses')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'businesses'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Provisioned Businesses</span>
            <span className="text-muted-foreground text-[10px] font-mono">
              ({businesses.length})
            </span>
          </button>
        </div>

        {/* TAB 1: BUSINESS REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Business Inquiries</h2>
                <p className="text-xs text-muted-foreground">
                  Inbound registration requests awaiting phone contact and account provisioning
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex rounded-md border border-border bg-white p-0.5 text-xs">
                  {['ALL', 'NEW', 'CONTACTED', 'PROVISIONED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setRequestStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        requestStatusFilter === st
                          ? 'bg-muted text-foreground font-semibold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search business, owner, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            <BusinessRequestTable
              requests={filteredRequests}
              loading={loading}
              searchQuery={searchQuery}
              statusFilter={requestStatusFilter}
              onSelectRequest={setSelectedRequest}
              onLogContact={handleLogContact}
              onOpenProvision={handleOpenProvisionFromRequest}
              loggingContactId={loggingContactId}
              copiedPhoneId={copiedPhoneId}
              onCopyPhone={handleCopyPhone}
            />
          </div>
        )}

        {/* TAB 2: PROVISIONED BUSINESSES DIRECTORY */}
        {activeTab === 'businesses' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Provisioned Venues</h2>
                <p className="text-xs text-muted-foreground">Directory of active Ratevia accounts and QR intake links</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search business, slug, or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <BusinessDirectoryTable
              businesses={filteredBusinesses}
              loading={loading}
              searchQuery={searchQuery}
              onToggleStatus={handleToggleStatus}
              updatingId={updatingId}
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <BusinessRequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onLogContact={handleLogContact}
        onOpenProvision={handleOpenProvisionFromRequest}
        loggingContactId={loggingContactId}
        copiedPhoneId={copiedPhoneId}
        onCopyPhone={handleCopyPhone}
      />

      {/* Provisioning Modal */}
      <ProvisionBusinessModal
        show={showProvisionModal}
        onClose={() => {
          setShowProvisionModal(false);
          setProvisionRequestId(null);
        }}
        onSubmit={handleProvisionSubmit}
        provisionName={provisionName}
        setProvisionName={setProvisionName}
        provisionType={provisionType}
        setProvisionType={setProvisionType}
        provisionGoogleUrl={provisionGoogleUrl}
        setProvisionGoogleUrl={setProvisionGoogleUrl}
        provisionOwnerEmail={provisionOwnerEmail}
        setProvisionOwnerEmail={setProvisionOwnerEmail}
        provisionOwnerName={provisionOwnerName}
        setProvisionOwnerName={setProvisionOwnerName}
        provisionRequestId={provisionRequestId}
        provisioning={provisioning}
        provisionError={provisionError}
      />
    </div>
  );
};

export default AdminDashboardPage;
