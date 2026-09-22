import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Shield,
  Building2,
  CheckCircle2,
  RotateCcw,
  Plus,
  Loader2,
  ExternalLink,
  Search,
  Power,
  X,
  Phone,
  Mail,
  Copy,
  Check,
  Eye,
  Clock,
  Calendar,
  UserCheck,
  Store,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

import { getCategoryOptions, getCategoryConfig } from '../../config/businessCategories';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AdminDashboardPage = () => {
  const { session, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'businesses'
  const [searchQuery, setSearchQuery] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('ALL'); // 'ALL' | 'NEW' | 'CONTACTED' | 'PROVISIONED'

  // Action states
  const [updatingId, setUpdatingId] = useState(null);
  const [loggingContactId, setLoggingContactId] = useState(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Detail Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Provisioning Modal State
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

      const [statsRes, businessesRes, requestsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(`${API_URL}/api/admin/businesses`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(`${API_URL}/api/admin/business-requests`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (statsRes.status === 403 || businessesRes.status === 403 || requestsRes.status === 403) {
        setError('FORBIDDEN');
        return;
      }

      if (statsRes.ok && businessesRes.ok && requestsRes.ok) {
        const statsJson = await statsRes.json();
        const businessesJson = await businessesRes.json();
        const requestsJson = await requestsRes.json();

        setStats(statsJson.stats);
        setBusinesses(businessesJson.businesses || []);
        setRequests(requestsJson.requests || []);
      } else {
        setError('Failed to fetch admin platform data.');
      }
    } catch (err) {
      setError(err.message);
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

      const res = await fetch(`${API_URL}/api/admin/business-requests/${requestId}/contact`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const json = await res.json();
      if (res.ok) {
        setActionSuccess(`Marked request for "${json.request.businessName}" as CONTACTED`);
        // Instant local update
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, ...json.request } : r))
        );
        if (selectedRequest?.id === requestId) {
          setSelectedRequest((prev) => ({ ...prev, ...json.request }));
        }
        await loadAdminData();
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        alert(json.message || 'Failed to log contact.');
      }
    } catch (err) {
      alert(err.message);
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
      const res = await fetch(`${API_URL}/api/admin/businesses/${businessId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ isActive: targetActive }),
      });

      const json = await res.json();
      if (res.ok) {
        setActionSuccess(`Business status set to ${targetActive ? 'ACTIVE' : 'SUSPENDED'}`);
        await loadAdminData();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        alert(json.message || 'Action failed.');
      }
    } catch (err) {
      alert(err.message);
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
      const res = await fetch(`${API_URL}/api/admin/businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: provisionName.trim(),
          businessType: provisionType,
          googleReviewUrl: provisionGoogleUrl.trim(),
          ownerEmail: provisionOwnerEmail.trim(),
          ownerName: provisionOwnerName.trim() || null,
          requestId: provisionRequestId || null,
        }),
      });

      const json = await res.json();

      if (res.ok) {
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
      } else {
        setProvisionError(json.message || 'Failed to provision business.');
      }
    } catch (err) {
      setProvisionError(err.message);
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

  // Filtered Requests
  const filteredRequests = requests.filter((r) => {
    // Status Filter
    if (requestStatusFilter !== 'ALL' && r.status !== requestStatusFilter) {
      return false;
    }
    // Search Filter
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

  // Filtered Businesses
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
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="p-4 border-l-4 border-l-amber-500">
              <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                New Requests
              </span>
              <span className="text-2xl font-bold font-display text-amber-600 mt-1 block">
                {stats.newRequests ?? newRequestsCount}
              </span>
            </Card>
            <Card className="p-4 border-l-4 border-l-blue-500">
              <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                Contacted Leads
              </span>
              <span className="text-2xl font-bold font-display text-blue-600 mt-1 block">
                {stats.contactedRequests ?? contactedRequestsCount}
              </span>
            </Card>
            <Card className="p-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                Total Inquiries
              </span>
              <span className="text-2xl font-bold font-display text-foreground mt-1 block">
                {stats.totalRequests ?? requests.length}
              </span>
            </Card>
            <Card className="p-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                Active Venues
              </span>
              <span className="text-2xl font-bold font-display text-emerald-600 mt-1 block">
                {stats.activeBusinesses}
              </span>
            </Card>
            <Card className="p-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                Total Feedbacks
              </span>
              <span className="text-2xl font-bold font-display text-foreground mt-1 block">
                {stats.totalFeedbacks}
              </span>
            </Card>
          </div>
        )}

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
                {/* Status Filter Buttons */}
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

            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto mb-3" />
                <p className="text-xs text-muted-foreground">Loading business requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <Card className="p-12 text-center bg-muted/20">
                <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">No registration requests found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery || requestStatusFilter !== 'ALL'
                    ? 'Try adjusting your status or search filters'
                    : 'When prospective businesses fill out the contact form, their requests will appear here.'}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((req) => {
                  const isLogging = loggingContactId === req.id;
                  const isCopied = copiedPhoneId === req.id;

                  return (
                    <Card
                      key={req.id}
                      className="p-5 hover:border-accent/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left: Info */}
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-foreground text-base">
                              {req.businessName}
                            </h3>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {getCategoryConfig(req.businessType).displayName}
                            </Badge>

                            {/* Status Badge */}
                            {req.status === 'NEW' && (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-mono uppercase rounded-md">
                                NEW REQUEST
                              </Badge>
                            )}
                            {req.status === 'CONTACTED' && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[10px] font-mono uppercase rounded-md">
                                CONTACTED
                              </Badge>
                            )}
                            {req.status === 'PROVISIONED' && (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-mono uppercase rounded-md">
                                PROVISIONED
                              </Badge>
                            )}
                            {req.status === 'REJECTED' && (
                              <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-[10px] font-mono uppercase rounded-md">
                                REJECTED
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              Owner: <strong className="text-foreground font-medium">{req.ownerName}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <a
                                href={`tel:${req.phoneNumber}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-foreground hover:text-accent font-mono font-medium hover:underline"
                              >
                                {req.phoneNumber}
                              </a>
                              <button
                                type="button"
                                onClick={(e) => handleCopyPhone(req.phoneNumber, req.id, e)}
                                title="Copy Phone Number"
                                className="ml-1 p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {isCopied ? (
                                  <span className="text-[10px] text-emerald-600 font-medium">Copied ✓</span>
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </span>
                            <span>•</span>
                            <span>
                              <a
                                href={`mailto:${req.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:underline text-muted-foreground hover:text-foreground"
                              >
                                {req.email}
                              </a>
                            </span>
                            <span>•</span>
                            <span>City: <span className="text-foreground">{req.city}</span></span>
                            <span>•</span>
                            <span>
                              {new Date(req.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          {req.message && (
                            <p className="text-xs text-muted-foreground line-clamp-1 italic bg-muted/30 px-2 py-1 rounded-md border border-border/50 max-w-2xl mt-1">
                              "{req.message}"
                            </p>
                          )}
                        </div>

                        {/* Right: Actions */}
                        <div
                          className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-border shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-md text-xs h-8"
                            onClick={() => setSelectedRequest(req)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>

                          {req.status === 'NEW' && (
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={isLogging}
                              onClick={(e) => handleLogContact(req.id, e)}
                              className="rounded-md text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              {isLogging ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <Phone className="mr-1 h-3 w-3" />
                              )}
                              Log Contact
                            </Button>
                          )}

                          {req.status === 'CONTACTED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => handleOpenProvisionFromRequest(req, e)}
                              className="rounded-md text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Provision Business
                            </Button>
                          )}

                          {req.status === 'PROVISIONED' && req.provisionedBusiness && (
                            <a
                              href={`/r/${req.provisionedBusiness.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium px-2 py-1"
                            >
                              <span>View Business</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
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

            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto mb-3" />
                <p className="text-xs text-muted-foreground">Loading directory...</p>
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <Card className="p-12 text-center bg-muted/20">
                <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">No businesses found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery ? 'Try adjusting your search filter' : 'No businesses provisioned yet.'}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredBusinesses.map((b) => {
                  const isActive = b.isActive;
                  const isUpdating = updatingId === b.id;

                  return (
                    <Card key={b.id} className="p-5 hover:border-accent/40 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left: Info */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground text-base">{b.name}</h3>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {getCategoryConfig(b.businessType).displayName}
                            </Badge>
                            <Badge
                              variant={isActive ? 'default' : 'secondary'}
                              className={`text-[10px] font-mono uppercase rounded-md ${
                                isActive ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isActive ? 'ACTIVE' : 'SUSPENDED'}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              Slug: <code className="font-mono text-foreground font-medium">{b.slug}</code>
                            </span>
                            <span>•</span>
                            <span>
                              Owner: <span className="text-foreground">{b.owner?.name || 'Owner'}</span> ({b.owner?.email})
                            </span>
                            <span>•</span>
                            <span>Feedbacks: <strong className="text-foreground">{b.feedbackCount}</strong></span>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                          <a
                            href={`/r/${b.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent hover:underline flex items-center gap-1 mr-3"
                          >
                            Customer QR
                            <ExternalLink className="h-3 w-3" />
                          </a>

                          <Button
                            variant={isActive ? 'outline' : 'primary'}
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleToggleStatus(b.id, isActive)}
                            className={`rounded-md text-xs h-8 px-3 ${
                              isActive ? 'text-amber-700 hover:bg-amber-50 hover:text-amber-800' : ''
                            }`}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Power className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            {isActive ? 'Suspend' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* REQUEST DETAIL MODAL / DRAWER */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <Card className="max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground text-lg">
                    {selectedRequest.businessName}
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {getCategoryConfig(selectedRequest.businessType).displayName}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Registration Inquiry Details & Activity Timeline
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status & Key Info Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-muted/30 rounded-md border border-border">
                <span className="text-muted-foreground block text-[10px] uppercase font-mono mb-1">
                  Owner / Contact
                </span>
                <span className="font-semibold text-foreground block text-sm">
                  {selectedRequest.ownerName}
                </span>
                <span className="text-muted-foreground block mt-0.5">{selectedRequest.city}</span>
              </div>
              <div className="p-3 bg-muted/30 rounded-md border border-border">
                <span className="text-muted-foreground block text-[10px] uppercase font-mono mb-1">
                  Status
                </span>
                <div className="mt-1">
                  {selectedRequest.status === 'NEW' && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[11px] font-mono uppercase rounded-md">
                      NEW REQUEST
                    </Badge>
                  )}
                  {selectedRequest.status === 'CONTACTED' && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[11px] font-mono uppercase rounded-md">
                      CONTACTED
                    </Badge>
                  )}
                  {selectedRequest.status === 'PROVISIONED' && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[11px] font-mono uppercase rounded-md">
                      PROVISIONED
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Contact Actions */}
            <div className="p-3 rounded-md border border-border bg-white space-y-2">
              <span className="text-[10px] uppercase font-mono text-muted-foreground font-semibold block">
                Direct Contact Actions
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${selectedRequest.phoneNumber}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent/90"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call {selectedRequest.phoneNumber}</span>
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-md text-xs h-8"
                  onClick={(e) => handleCopyPhone(selectedRequest.phoneNumber, selectedRequest.id, e)}
                >
                  {copiedPhoneId === selectedRequest.id ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3.5 w-3.5" />
                      Copy Phone
                    </>
                  )}
                </Button>

                <a
                  href={`mailto:${selectedRequest.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs text-foreground hover:bg-muted"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>{selectedRequest.email}</span>
                </a>
              </div>
            </div>

            {/* Note / Message */}
            {selectedRequest.message && (
              <div className="p-3 rounded-md bg-muted/20 border border-border space-y-1">
                <span className="text-[10px] uppercase font-mono text-muted-foreground font-semibold block">
                  Inquiry Message / Notes
                </span>
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedRequest.message}
                </p>
              </div>
            )}

            {/* Lightweight Activity Timeline */}
            <div className="border-t border-border pt-4 space-y-3">
              <span className="text-[11px] uppercase font-mono text-muted-foreground font-semibold block">
                Activity Timeline
              </span>
              <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {/* Step 1: Created */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-accent border-2 border-white" />
                  <p className="text-xs font-medium text-foreground">Request submitted</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {new Date(selectedRequest.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                    })}
                  </p>
                </div>

                {/* Step 2: Contacted */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      selectedRequest.contactedAt ? 'bg-blue-500' : 'bg-muted border-border'
                    }`}
                  />
                  <p className="text-xs font-medium text-foreground">
                    {selectedRequest.contactedAt ? (
                      <>
                        Contacted by{' '}
                        <strong className="text-foreground">
                          {selectedRequest.contactedBy?.name || selectedRequest.contactedBy?.email || 'Admin'}
                        </strong>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Pending manual contact</span>
                    )}
                  </p>
                  {selectedRequest.contactedAt && (
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {new Date(selectedRequest.contactedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true,
                      })}
                    </p>
                  )}
                </div>

                {/* Step 3: Provisioned */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      selectedRequest.status === 'PROVISIONED' ? 'bg-emerald-500' : 'bg-muted border-border'
                    }`}
                  />
                  <p className="text-xs font-medium text-foreground">
                    {selectedRequest.status === 'PROVISIONED' ? (
                      <>
                        Business provisioned:{' '}
                        <strong className="text-foreground">
                          {selectedRequest.provisionedBusiness?.name || selectedRequest.businessName}
                        </strong>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Pending customer agreement & provisioning</span>
                    )}
                  </p>
                  {selectedRequest.provisionedBusiness && (
                    <a
                      href={`/r/${selectedRequest.provisionedBusiness.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-accent hover:underline flex items-center gap-1 mt-0.5"
                    >
                      Open Live Customer QR
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-md"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                {selectedRequest.status === 'NEW' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-md bg-amber-600 hover:bg-amber-700 text-white"
                    disabled={loggingContactId === selectedRequest.id}
                    onClick={() => handleLogContact(selectedRequest.id)}
                  >
                    {loggingContactId === selectedRequest.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Phone className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Log Contact
                  </Button>
                )}

                {selectedRequest.status === 'CONTACTED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      handleOpenProvisionFromRequest(selectedRequest);
                      setSelectedRequest(null);
                    }}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Provision Business
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* PROVISION BUSINESS MODAL */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <Card className="max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-semibold text-foreground text-lg">
                  {provisionRequestId ? 'Provision Business from Request' : 'Provision New Business'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Manual ₹1,000 one-time business onboarding
                  {provisionRequestId && ' • Automatically links lead history'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowProvisionModal(false);
                  setProvisionRequestId(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {provisionError && (
              <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md">
                {provisionError}
              </div>
            )}

            <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Business Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Blue Lagoon Bistro"
                  value={provisionName}
                  onChange={(e) => setProvisionName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Business Category</label>
                <select
                  value={provisionType}
                  onChange={(e) => setProvisionType(e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {getCategoryOptions().map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Google Review URL</label>
                <Input
                  type="url"
                  placeholder="https://g.page/r/your-place/review"
                  value={provisionGoogleUrl}
                  onChange={(e) => setProvisionGoogleUrl(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border">
                <div>
                  <label className="block font-medium text-foreground mb-1">Owner Email</label>
                  <Input
                    type="email"
                    placeholder="owner@business.com"
                    value={provisionOwnerEmail}
                    onChange={(e) => setProvisionOwnerEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Owner Full Name (Optional)</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={provisionOwnerName}
                    onChange={(e) => setProvisionOwnerName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-md"
                  onClick={() => {
                    setShowProvisionModal(false);
                    setProvisionRequestId(null);
                  }}
                  disabled={provisioning}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="rounded-md" disabled={provisioning}>
                  {provisioning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Provisioning...
                    </>
                  ) : (
                    'Complete Provisioning'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
export default AdminDashboardPage;
