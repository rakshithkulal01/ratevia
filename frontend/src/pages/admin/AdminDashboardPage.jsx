import React, { useState, useEffect } from 'react';
import SEOHead from '../../components/seo/SEOHead';
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
  Sliders,
  DollarSign,
  QrCode,
  Inbox,
  Building2,
  Users,
  Trash2,
} from 'lucide-react';

import { adminService } from '../../services/adminService';
import { AdminStatsGrid } from '../../components/admin/AdminStatsGrid';
import { BusinessRequestTable } from '../../components/admin/BusinessRequestTable';
import { BusinessRequestDetailModal } from '../../components/admin/BusinessRequestDetailModal';
import { BusinessDirectoryTable } from '../../components/admin/BusinessDirectoryTable';
import { ProvisionBusinessModal } from '../../components/admin/ProvisionBusinessModal';
import { AdminQRRequestsTable } from '../../components/admin/AdminQRRequestsTable';
import { QRRequestDetailsModal } from '../../components/admin/QRRequestDetailsModal';
import { AdminPricingCard } from '../../components/admin/AdminPricingCard';
import { AdminManagementTable } from '../../components/admin/AdminManagementTable';
import { AddAdminModal } from '../../components/admin/AddAdminModal';
import { EditAdminModal } from '../../components/admin/EditAdminModal';
import { ConfirmActionModal } from '../../components/admin/ConfirmActionModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AdminDashboardPage = ({ defaultTab = 'requests' }) => {
  const { session, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [qrRequests, setQrRequests] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('ALL');
  const [qrStatusFilter, setQrStatusFilter] = useState('ALL');

  // Admin Management Modal states
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState(null);
  const [adminActionLoadingId, setAdminActionLoadingId] = useState(null);

  // Delete & Download states
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [qrRequestToDelete, setQrRequestToDelete] = useState(null);
  const [deletingRequestId, setDeletingRequestId] = useState(null);
  const [downloadingQRId, setDownloadingQRId] = useState(null);

  // Action states
  const [updatingId, setUpdatingId] = useState(null);
  const [loggingContactId, setLoggingContactId] = useState(null);
  const [approvingQRId, setApprovingQRId] = useState(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modal States
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedQRRequest, setSelectedQRRequest] = useState(null);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionName, setProvisionName] = useState('');
  const [provisionType, setProvisionType] = useState('CAFE');
  const [provisionGoogleUrl, setProvisionGoogleUrl] = useState('');
  const [provisionOwnerEmail, setProvisionOwnerEmail] = useState('');
  const [provisionOwnerName, setProvisionOwnerName] = useState('');
  const [provisionRequestId, setProvisionRequestId] = useState(null);
  const [provisioning, setProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState(null);

  const isAdmin = user?.role === 'ADMIN' || (currentAdmin && currentAdmin.isActive);

  const loadAdminData = async () => {
    if (!session?.access_token) return;
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch current admin profile & permissions first
      let adminMe = null;
      try {
        const meRes = await adminService.getAdminMe(session.access_token);
        adminMe = meRes.admin;
        setCurrentAdmin(adminMe);
      } catch (meErr) {
        console.warn('Could not fetch admin me profile:', meErr);
      }

      const perms = adminMe?.permissions || [];
      const canDashboard = perms.includes('VIEW_DASHBOARD');
      const canBiz = perms.includes('MANAGE_BUSINESSES');
      const canBizReq = perms.includes('MANAGE_BUSINESS_REQUESTS');
      const canQRReq = perms.includes('MANAGE_QR_REQUESTS');
      const canAdmins = perms.includes('MANAGE_ADMINS');

      // 2. Fetch permitted data in parallel
      const fetchPromises = [];

      if (canDashboard) {
        fetchPromises.push(
          adminService.getStats(session.access_token).then((d) => setStats(d.stats)).catch((e) => console.warn(e))
        );
      }
      if (canBiz) {
        fetchPromises.push(
          adminService.getBusinesses(session.access_token).then((d) => setBusinesses(d.businesses || [])).catch((e) => console.warn(e))
        );
      }
      if (canBizReq) {
        fetchPromises.push(
          adminService.getBusinessRequests(session.access_token).then((d) => setRequests(d.requests || [])).catch((e) => console.warn(e))
        );
      }
      if (canQRReq) {
        fetchPromises.push(
          adminService.getQRRequests(session.access_token).then((d) => setQrRequests(d.requests || [])).catch((e) => console.warn(e))
        );
      }
      if (canAdmins) {
        fetchPromises.push(
          adminService.getAdmins(session.access_token).then((d) => setAdmins(d.admins || [])).catch((e) => console.warn(e))
        );
      }

      await Promise.all(fetchPromises);
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
      adminService.getStats(session.access_token).then((d) => setStats(d.stats)).catch(() => {});
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.message || 'Failed to log contact.');
    } finally {
      setLoggingContactId(null);
    }
  };

  const handleLogQRContact = async (requestId) => {
    try {
      setLoggingContactId(requestId);
      setActionSuccess(null);

      const json = await adminService.logQRContact(session.access_token, requestId);
      setActionSuccess(`Marked QR request as CONTACTED`);
      setQrRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, ...json.request } : r))
      );
      if (selectedQRRequest?.id === requestId) {
        setSelectedQRRequest((prev) => ({ ...prev, ...json.request }));
      }
      adminService.getStats(session.access_token).then((d) => setStats(d.stats)).catch(() => {});
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.message || 'Failed to mark contact.');
    } finally {
      setLoggingContactId(null);
    }
  };

  const handleApproveQR = async (requestId) => {
    try {
      setApprovingQRId(requestId);
      setActionSuccess(null);

      const json = await adminService.approveQRRequest(session.access_token, requestId);
      setActionSuccess(`Approved QR request for "${json.request.businessName}"`);
      setQrRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, ...json.request } : r))
      );
      if (selectedQRRequest?.id === requestId) {
        setSelectedQRRequest((prev) => ({ ...prev, ...json.request }));
      }
      adminService.getStats(session.access_token).then((d) => setStats(d.stats)).catch(() => {});
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.message || 'Failed to approve QR request.');
    } finally {
      setApprovingQRId(null);
    }
  };

  const handleRejectQR = async (requestId, reason) => {
    try {
      setActionSuccess(null);

      const json = await adminService.rejectQRRequest(session.access_token, requestId, reason);
      setActionSuccess(`QR request marked as REJECTED`);
      setQrRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, ...json.request } : r))
      );
      if (selectedQRRequest?.id === requestId) {
        setSelectedQRRequest((prev) => ({ ...prev, ...json.request }));
      }
      adminService.getStats(session.access_token).then((d) => setStats(d.stats)).catch(() => {});
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.message || 'Failed to reject QR request.');
    }
  };

  // Delete Business Request
  const handleOpenDeleteRequestConfirm = (req, e) => {
    if (e) e.stopPropagation();
    setRequestToDelete(req);
  };

  const handleConfirmDeleteRequest = async () => {
    if (!requestToDelete || deletingRequestId) return;
    try {
      setDeletingRequestId(requestToDelete.id);
      await adminService.deleteBusinessRequest(session.access_token, requestToDelete.id);
      setRequests((prev) => prev.filter((r) => r.id !== requestToDelete.id));
      if (selectedRequest?.id === requestToDelete.id) {
        setSelectedRequest(null);
      }
      setActionSuccess(`Business request for "${requestToDelete.businessName}" deleted successfully.`);
      setRequestToDelete(null);
      setTimeout(() => setActionSuccess(null), 3500);
      adminService.getStats(session.access_token).then((d) => setStats(d.stats)).catch(() => {});
    } catch (err) {
      alert(err.message || 'Failed to delete business request.');
    } finally {
      setDeletingRequestId(null);
    }
  };

  // Delete QR Request
  const handleOpenDeleteQRRequestConfirm = (r, e) => {
    if (e) e.stopPropagation();
    setQrRequestToDelete(r);
  };

  const handleConfirmDeleteQRRequest = async () => {
    if (!qrRequestToDelete || deletingRequestId) return;
    try {
      setDeletingRequestId(qrRequestToDelete.id);
      await adminService.deleteQRRequest(session.access_token, qrRequestToDelete.id);
      setQrRequests((prev) => prev.filter((q) => q.id !== qrRequestToDelete.id));
      if (selectedQRRequest?.id === qrRequestToDelete.id) {
        setSelectedQRRequest(null);
      }
      setActionSuccess(`QR customization request for "${qrRequestToDelete.businessName}" deleted successfully.`);
      setQrRequestToDelete(null);
      setTimeout(() => setActionSuccess(null), 3500);
      adminService.getStats(session.access_token).then((d) => setStats(d.stats)).catch(() => {});
    } catch (err) {
      alert(err.message || 'Failed to delete QR request.');
    } finally {
      setDeletingRequestId(null);
    }
  };

  // Download Sticker PNG directly from table row
  const handleDownloadSticker = async (req, e) => {
    if (e) e.stopPropagation();
    try {
      setDownloadingQRId(req.id);
      const safeSlug = (req.businessName || 'ratevia')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'sticker';
      const url = `${API_BASE_URL}/api/admin/qr-requests/${req.id}/download?format=sticker`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 410) {
          alert('The sticker preview has expired after 25 days and is no longer available for download.');
          return;
        }
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || 'Download failed');
      }
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${safeSlug}-ratevia-sticker.png`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download error:', err);
      alert(err.message || 'Failed to download sticker. Please try again.');
    } finally {
      setDownloadingQRId(null);
    }
  };

  const handleOpenProvisionFromRequest = (req, e) => {
    if (e) e.stopPropagation();
    setProvisionName(req.businessName || '');
    setProvisionType(req.businessType || 'CAFE');
    setProvisionGoogleUrl(req.destinationUrl || '');
    setProvisionOwnerEmail(req.email || '');
    setProvisionOwnerName(req.ownerName || '');
    setProvisionRequestId(req.id);
    setProvisionError(null);
    setShowProvisionModal(true);
  };

  const handleOpenProvisionFromQR = (req) => {
    setSelectedQRRequest(null);
    setProvisionName(req.businessName || '');
    setProvisionType(req.businessType || 'CAFE');
    setProvisionGoogleUrl(req.destinationUrl || '');
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
    try {
      setProvisioning(true);
      setProvisionError(null);

      const payload = {
        name: provisionName.trim(),
        businessType: provisionType,
        googleReviewUrl: provisionGoogleUrl.trim(),
        destinationUrl: provisionGoogleUrl.trim(),
        ownerEmail: provisionOwnerEmail.trim(),
        ownerName: provisionOwnerName.trim() || undefined,
        requestId: provisionRequestId || undefined,
      };

      const res = await adminService.provisionBusiness(session.access_token, payload);

      setShowProvisionModal(false);
      setActionSuccess(
        `Business "${res.business.name}" successfully provisioned with slug: /r/${res.business.slug}`
      );

      await loadAdminData();
      setActiveTab('businesses');
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      setProvisionError(err.message || 'Provisioning failed.');
    } finally {
      setProvisioning(false);
    }
  };

  // Admin Management Handlers
  const handleToggleAdminStatus = async (adminOrId, targetActive) => {
    const adminId = typeof adminOrId === 'object' ? adminOrId?.id : adminOrId;
    const targetAdmin = admins.find((a) => a.id === adminId) || (typeof adminOrId === 'object' ? adminOrId : null);
    if (!adminId) return;

    try {
      setAdminActionLoadingId(adminId);
      setActionSuccess(null);
      const shouldActivate = targetActive !== undefined ? targetActive : !targetAdmin?.isActive;

      if (shouldActivate) {
        await adminService.activateAdmin(session.access_token, adminId);
        setActionSuccess(`Administrator "${targetAdmin?.displayName || targetAdmin?.email || 'Admin'}" has been activated.`);
      } else {
        await adminService.deactivateAdmin(session.access_token, adminId);
        setActionSuccess(`Administrator "${targetAdmin?.displayName || targetAdmin?.email || 'Admin'}" has been deactivated.`);
      }
      await loadAdminData();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.message || 'Failed to update admin status.');
    } finally {
      setAdminActionLoadingId(null);
    }
  };

  const handleDeleteAdmin = async (adminOrId) => {
    const adminId = typeof adminOrId === 'object' ? adminOrId?.id : adminOrId;
    const targetAdmin = admins.find((a) => a.id === adminId) || (typeof adminOrId === 'object' ? adminOrId : null);
    if (!adminId) return;

    try {
      setAdminActionLoadingId(adminId);
      setActionSuccess(null);
      await adminService.deleteAdmin(session.access_token, adminId);
      setActionSuccess(`Administrator "${targetAdmin?.displayName || targetAdmin?.email || 'Admin'}" has been removed.`);
      await loadAdminData();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.message || 'Failed to delete administrator.');
    } finally {
      setAdminActionLoadingId(null);
    }
  };

  const handleAddAdminSuccess = (newAdmin) => {
    setShowAddAdminModal(false);
    setActionSuccess(`Administrator "${newAdmin.displayName || newAdmin.email}" created successfully.`);
    loadAdminData();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleEditAdminSuccess = (updatedAdmin) => {
    setSelectedAdminForEdit(null);
    setActionSuccess(`Administrator "${updatedAdmin.displayName || updatedAdmin.email}" updated successfully.`);
    loadAdminData();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // 403 Forbidden State for Non-Admin Users
  if (error === 'FORBIDDEN' || (!isAdmin && !loading)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-red-200 bg-red-50/50 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
            <Shield className="h-6 w-6 stroke-[2.2]" />
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
      (r.city && r.city.toLowerCase().includes(q))
    );
  });

  const filteredQRRequests = qrRequests.filter((r) => {
    if (qrStatusFilter !== 'ALL' && r.status !== qrStatusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.businessName.toLowerCase().includes(q) ||
      r.ownerName.toLowerCase().includes(q) ||
      r.phoneNumber.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.destinationUrl && r.destinationUrl.toLowerCase().includes(q)) ||
      (r.referenceId && r.referenceId.toLowerCase().includes(q))
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
  const newQRRequestsCount = qrRequests.filter((r) => r.status === 'NEW').length;
  const contactedRequestsCount = requests.filter((r) => r.status === 'CONTACTED').length;

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <SEOHead title="Platform Administration" noindex={true} />
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
                Review custom QR requests, manage registrations, adjust pricing, and provision business accounts.
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
          <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md flex items-center gap-2 animate-in fade-in">
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
        <div className="flex border-b border-border space-x-6 text-xs font-medium overflow-x-auto">
          {/* Custom QR Requests */}
          <button
            onClick={() => setActiveTab('qr-requests')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'qr-requests'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Custom QR Requests</span>
            {newQRRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-accent text-white text-[10px] font-mono font-bold">
                {newQRRequestsCount} new
              </span>
            )}
            <span className="text-muted-foreground text-[10px] font-mono">
              ({qrRequests.length})
            </span>
          </button>

          {/* Business Requests */}
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'requests'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Inbox className="h-4 w-4" />
            <span>Contact Inquiries</span>
            {newRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                {newRequestsCount} new
              </span>
            )}
          </button>

          {/* Provisioned Businesses */}
          <button
            onClick={() => setActiveTab('businesses')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'businesses'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Provisioned Businesses</span>
            <span className="text-muted-foreground text-[10px] font-mono">
              ({businesses.length})
            </span>
          </button>

          {/* Pricing Settings */}
          <button
            onClick={() => setActiveTab('pricing')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'pricing'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Pricing Settings</span>
          </button>

          {/* Admin Management (Requires MANAGE_ADMINS permission) */}
          {currentAdmin?.permissions?.includes('MANAGE_ADMINS') && (
            <button
              onClick={() => setActiveTab('admins')}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
                activeTab === 'admins'
                  ? 'border-accent text-accent font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Admin Management</span>
              <span className="text-muted-foreground text-[10px] font-mono">
                ({admins.length})
              </span>
            </button>
          )}
        </div>

        {/* TAB 1: CUSTOM QR REQUESTS */}
        {activeTab === 'qr-requests' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Custom QR Design Requests</h2>
                <p className="text-xs text-muted-foreground">
                  Branded QR stand configurations submitted by public users awaiting admin review, approval, and provisioning
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex rounded-md border border-border bg-white p-0.5 text-xs">
                  {['ALL', 'NEW', 'CONTACTED', 'APPROVED', 'PROVISIONED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setQrStatusFilter(st)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        qrStatusFilter === st
                          ? 'bg-accent text-white font-semibold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <AdminQRRequestsTable
              requests={filteredQRRequests}
              onView={(r) => setSelectedQRRequest(r)}
              onContact={(id) => handleLogQRContact(id)}
              onApprove={(id) => handleApproveQR(id)}
              onReject={(id) => {
                setSelectedQRRequest(qrRequests.find((q) => q.id === id) || null);
              }}
              onProvision={(r) => handleOpenProvisionFromQR(r)}
              onDownload={handleDownloadSticker}
              onDelete={handleOpenDeleteQRRequestConfirm}
              contactingId={loggingContactId}
              approvingId={approvingQRId}
              downloadingId={downloadingQRId}
              deletingId={deletingRequestId}
              copiedPhoneId={copiedPhoneId}
              onCopyPhone={handleCopyPhone}
            />
          </div>
        )}

        {/* TAB 2: BUSINESS CONTACT INQUIRIES */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Contact & Lead Inquiries</h2>
                <p className="text-xs text-muted-foreground">
                  Standard registration inquiries awaiting sales phone contact
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex rounded-md border border-border bg-white p-0.5 text-xs">
                  {['ALL', 'NEW', 'CONTACTED', 'PROVISIONED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setRequestStatusFilter(st)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        requestStatusFilter === st
                          ? 'bg-accent text-white font-semibold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <BusinessRequestTable
              requests={filteredRequests}
              onSelectRequest={(r) => setSelectedRequest(r)}
              onView={(r) => setSelectedRequest(r)}
              onLogContact={handleLogContact}
              onOpenProvision={handleOpenProvisionFromRequest}
              onDelete={handleOpenDeleteRequestConfirm}
              loggingContactId={loggingContactId}
              deletingId={deletingRequestId}
              copiedPhoneId={copiedPhoneId}
              onCopyPhone={handleCopyPhone}
            />
          </div>
        )}

        {/* TAB 3: PROVISIONED BUSINESSES */}
        {activeTab === 'businesses' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Provisioned Businesses Directory</h2>
                <p className="text-xs text-muted-foreground">
                  Active and suspended business accounts with live customer review intake
                </p>
              </div>
            </div>

            <BusinessDirectoryTable
              businesses={filteredBusinesses}
              onToggleStatus={handleToggleStatus}
              updatingId={updatingId}
            />
          </div>
        )}

        {/* TAB 4: PRICING SETTINGS */}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Pricing & Package Settings</h2>
              <p className="text-xs text-muted-foreground">
                Manage the public Ratevia QR stand package price and review price modification history
              </p>
            </div>

            <AdminPricingCard token={session?.access_token} />
          </div>
        )}

        {/* TAB 5: ADMIN MANAGEMENT */}
        {activeTab === 'admins' && currentAdmin?.permissions?.includes('MANAGE_ADMINS') && (
          <div className="space-y-4">
            <AdminManagementTable
              admins={admins}
              currentAdmin={currentAdmin}
              onAddAdmin={() => setShowAddAdminModal(true)}
              onEditAdmin={(adm) => setSelectedAdminForEdit(adm)}
              onToggleStatus={handleToggleAdminStatus}
              onDeleteAdmin={handleDeleteAdmin}
              loadingActionId={adminActionLoadingId}
            />
          </div>
        )}
      </div>

      {/* QR Request Detail Modal */}
      {selectedQRRequest && (
        <QRRequestDetailsModal
          request={selectedQRRequest}
          onClose={() => setSelectedQRRequest(null)}
          onContact={handleLogQRContact}
          onApprove={handleApproveQR}
          onReject={handleRejectQR}
          onProvision={handleOpenProvisionFromQR}
          onDelete={handleOpenDeleteQRRequestConfirm}
          token={session?.access_token}
        />
      )}

      {/* Standard Business Request Detail Modal */}
      {selectedRequest && (
        <BusinessRequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onContact={handleLogContact}
          onProvision={handleOpenProvisionFromRequest}
          onDelete={handleOpenDeleteRequestConfirm}
          loggingContactId={loggingContactId}
          copiedPhoneId={copiedPhoneId}
          onCopyPhone={handleCopyPhone}
        />
      )}

      {/* Delete Business Request Confirmation Modal */}
      <ConfirmActionModal
        isOpen={Boolean(requestToDelete)}
        title="Delete Business Inquiry Record"
        description={`Are you sure you want to permanently delete the inquiry for "${requestToDelete?.businessName}"? This record and associated notes will be removed from your admin history. This action cannot be undone.`}
        confirmLabel="Delete Request"
        confirmVariant="destructive"
        icon={Trash2}
        loading={deletingRequestId === requestToDelete?.id}
        onConfirm={handleConfirmDeleteRequest}
        onCancel={() => setRequestToDelete(null)}
      />

      {/* Delete QR Customization Request Confirmation Modal */}
      <ConfirmActionModal
        isOpen={Boolean(qrRequestToDelete)}
        title="Delete Custom QR Request"
        description={`Are you sure you want to permanently delete the custom QR request for "${qrRequestToDelete?.businessName}"? The request record and its stored sticker preview image will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete Request"
        confirmVariant="destructive"
        icon={Trash2}
        loading={deletingRequestId === qrRequestToDelete?.id}
        onConfirm={handleConfirmDeleteQRRequest}
        onCancel={() => setQrRequestToDelete(null)}
      />

      {/* Provision Business Modal */}
      <ProvisionBusinessModal
        show={showProvisionModal}
        onClose={() => setShowProvisionModal(false)}
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

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={showAddAdminModal}
        onClose={() => setShowAddAdminModal(false)}
        onSuccess={handleAddAdminSuccess}
        sessionToken={session?.access_token}
        actingAdminPermissions={currentAdmin?.permissions || []}
      />

      {/* Edit Admin Modal */}
      <EditAdminModal
        isOpen={!!selectedAdminForEdit}
        admin={selectedAdminForEdit}
        onClose={() => setSelectedAdminForEdit(null)}
        onSuccess={handleEditAdminSuccess}
        sessionToken={session?.access_token}
        actingAdminPermissions={currentAdmin?.permissions || []}
      />
    </div>
  );
};

export default AdminDashboardPage;
