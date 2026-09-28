import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BrandedQRCard } from '../dashboard/BrandedQRCard';
import { getQRBrandConfig } from '../../utils/qrBrandUtils';
import {
  X,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  XCircle,
  Download,
  Plus,
  Copy,
  Check,
  Building2,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const QRRequestDetailsModal = ({
  request,
  onClose,
  onContact,
  onApprove,
  onReject,
  onProvision,
  token,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Derive QR Brand configuration from stored qrConfig
  const brandConfig = useMemo(() => {
    if (!request) return null;
    const stored = request.qrConfig || {};
    return getQRBrandConfig({
      business: { name: request.businessName, businessType: request.businessType },
      categoryKey: request.businessType,
      selectedAccent: stored.selectedAccent || 'ratevia-blue',
      selectedStyle: stored.selectedStyle || 'classic',
      selectedMessage: stored.selectedMessage,
    });
  }, [request]);

  if (!request) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(request.phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (format) => {
    try {
      setDownloading(true);
      const url = `${API_BASE_URL}/api/admin/qr-requests/${request.id}/download?format=${format}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `ratevia-${(request.businessName || 'qr').toLowerCase().replace(/\s+/g, '-')}.${format}`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('QR download error:', err);
      alert('Failed to download QR code. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    onReject(request.id, rejectReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white shadow-2xl rounded-2xl border-border overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-slate-50/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {request.referenceId}
              </Badge>
              <Badge variant={request.status === 'APPROVED' ? 'accent' : request.status === 'PROVISIONED' ? 'success' : 'outline'} className="font-mono text-xs uppercase">
                {request.status}
              </Badge>
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {request.businessName}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Metadata & Controls */}
          <div className="md:col-span-7 space-y-6 text-xs">
            {/* Business & Contact Information */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <h3 className="font-mono font-semibold uppercase tracking-wider text-slate-500 text-[11px] flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-accent" />
                Business & Contact Profile
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Category</span>
                  <span className="font-semibold text-slate-900">{request.businessType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">City / Location</span>
                  <span className="font-semibold text-slate-900">{request.city || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Contact Person</span>
                  <span className="font-semibold text-slate-900">{request.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone / WhatsApp</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <a href={`tel:${request.phoneNumber}`} className="text-accent hover:underline font-semibold">
                      {request.phoneNumber}
                    </a>
                    <button onClick={handleCopyPhone} className="text-slate-400 hover:text-accent">
                      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <a href={`mailto:${request.email}`} className="text-slate-800 hover:underline font-mono">
                    {request.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Destination URL & Pricing */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <h3 className="font-mono font-semibold uppercase tracking-wider text-slate-500 text-[11px] flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-accent" />
                Destination & Quoted Pricing
              </h3>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Destination URL</span>
                  <a
                    href={request.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent hover:underline font-mono text-xs break-all bg-white p-2 rounded border border-border w-full"
                  >
                    <span>{request.destinationUrl}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 ml-auto" />
                  </a>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-mono">Quoted Price Snapshot:</span>
                  <span className="text-sm font-display font-bold text-slate-900">
                    {request.quotedPrice ? `₹${Number(request.quotedPrice).toLocaleString('en-IN')}` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Audit & Lifecycle Timeline */}
            <div className="space-y-1.5 text-[11px] font-mono text-slate-500 border-l-2 border-slate-200 pl-3">
              <div>Submitted: {new Date(request.createdAt).toLocaleString('en-IN')}</div>
              {request.contactedAt && (
                <div>Contacted: {new Date(request.contactedAt).toLocaleString('en-IN')}</div>
              )}
              {request.approvedAt && (
                <div className="text-accent font-semibold">
                  Approved: {new Date(request.approvedAt).toLocaleString('en-IN')}
                </div>
              )}
              {request.rejectedAt && (
                <div className="text-red-600 font-semibold">
                  Rejected: {new Date(request.rejectedAt).toLocaleString('en-IN')}
                  {request.rejectionReason && ` — "${request.rejectionReason}"`}
                </div>
              )}
              {request.provisionedAt && (
                <div className="text-emerald-700 font-semibold">
                  Provisioned: {new Date(request.provisionedAt).toLocaleString('en-IN')}
                  {request.provisionedBusiness?.slug && ` (/r/${request.provisionedBusiness.slug})`}
                </div>
              )}
            </div>

            {/* Rejection Prompt Form */}
            {showRejectForm && (
              <form onSubmit={handleRejectSubmit} className="p-3 rounded-lg border border-red-200 bg-red-50 space-y-2 animate-in fade-in">
                <label className="block text-[11px] font-semibold text-red-900">
                  Rejection Reason (Optional):
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Destination URL is inaccessible or invalid."
                  rows={2}
                  className="w-full p-2 text-xs rounded border border-red-300 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <div className="flex gap-2">
                  <Button type="submit" variant="destructive" size="sm" className="h-8 text-xs bg-red-600">
                    Confirm Rejection
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowRejectForm(false)} className="h-8 text-xs">
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Live Branded QR Stand Preview */}
          <div className="md:col-span-5 flex flex-col items-center space-y-4">
            <span className="font-mono text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
              Submitted QR Card Design
            </span>

            {brandConfig && (
              <BrandedQRCard
                business={{
                  name: request.businessName,
                  businessType: request.businessType,
                }}
                customerUrl={request.destinationUrl}
                config={brandConfig}
                size={190}
                className="scale-95"
              />
            )}

            {/* Download Actions */}
            <div className="w-full flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('svg')}
                disabled={downloading}
                className="flex-1 text-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Download SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('png')}
                disabled={downloading}
                className="flex-1 text-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Download PNG
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-md">
            Close
          </Button>

          <div className="flex items-center gap-2">
            {request.status === 'NEW' && (
              <Button variant="secondary" size="sm" onClick={() => onContact(request.id)} className="rounded-md">
                <Phone className="h-3.5 w-3.5 mr-1 text-accent" />
                Mark Contacted
              </Button>
            )}

            {(request.status === 'NEW' || request.status === 'CONTACTED') && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectForm(true)}
                  className="rounded-md text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onApprove(request.id)}
                  className="rounded-md"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Approve Design
                </Button>
              </>
            )}

            {request.status === 'APPROVED' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onProvision(request)}
                className="rounded-md bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Provision Business Account
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QRRequestDetailsModal;
