import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  ExternalLink,
  Phone,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Plus,
  Copy,
  Check,
} from 'lucide-react';

const STATUS_VARIANTS = {
  NEW: { label: 'NEW', variant: 'warning' },
  CONTACTED: { label: 'CONTACTED', variant: 'muted' },
  APPROVED: { label: 'APPROVED', variant: 'accent' },
  PROVISIONED: { label: 'PROVISIONED', variant: 'success' },
  REJECTED: { label: 'REJECTED', variant: 'danger' },
};

export const AdminQRRequestsTable = ({
  requests = [],
  onView,
  onContact,
  onApprove,
  onReject,
  onDownload,
  onProvision,
  contactingId,
  approvingId,
  copiedPhoneId,
  onCopyPhone,
}) => {
  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
        <p className="text-sm">No custom QR requests found matching your filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-xs">
      <table className="w-full text-left text-xs text-foreground">
        <thead className="bg-slate-50 border-b border-border text-[11px] font-mono uppercase text-muted-foreground">
          <tr>
            <th className="py-3.5 px-4 font-semibold">Business</th>
            <th className="py-3.5 px-4 font-semibold">Contact</th>
            <th className="py-3.5 px-4 font-semibold">Destination URL</th>
            <th className="py-3.5 px-4 font-semibold">Quoted Price</th>
            <th className="py-3.5 px-4 font-semibold">Status</th>
            <th className="py-3.5 px-4 font-semibold">Submitted</th>
            <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {requests.map((r) => {
            const statusConfig = STATUS_VARIANTS[r.status] || { label: r.status, variant: 'outline' };
            const formattedDate = new Date(r.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Business */}
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900">{r.businessName}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {r.businessType} • {r.referenceId}
                  </div>
                </td>

                {/* Contact */}
                <td className="py-3.5 px-4">
                  <div className="text-slate-800 font-medium">{r.ownerName}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-[11px] text-muted-foreground">{r.phoneNumber}</span>
                    <button
                      type="button"
                      onClick={(e) => onCopyPhone(r.phoneNumber, r.id, e)}
                      className="text-slate-400 hover:text-accent p-0.5 rounded"
                      title="Copy phone"
                    >
                      {copiedPhoneId === r.id ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </td>

                {/* Destination URL */}
                <td className="py-3.5 px-4 max-w-[200px]">
                  <a
                    href={r.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline truncate max-w-full font-mono text-[11px]"
                    title={r.destinationUrl}
                  >
                    <span className="truncate">{r.destinationUrl}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </td>

                {/* Quoted Price */}
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                  {r.quotedPrice ? `₹${Number(r.quotedPrice).toLocaleString('en-IN')}` : '—'}
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  <Badge variant={statusConfig.variant} className="font-mono text-[10px] uppercase">
                    {statusConfig.label}
                  </Badge>
                </td>

                {/* Submitted Date */}
                <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                  {formattedDate}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(r)}
                      className="h-8 px-2 text-xs"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>

                    {r.status === 'NEW' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onContact(r.id)}
                        disabled={contactingId === r.id}
                        className="h-8 px-2 text-xs"
                        title="Mark Contacted"
                      >
                        <Phone className="h-3.5 w-3.5 mr-1 text-accent" />
                        Contact
                      </Button>
                    )}

                    {(r.status === 'NEW' || r.status === 'CONTACTED') && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onApprove(r.id)}
                        disabled={approvingId === r.id}
                        className="h-8 px-2 text-xs"
                        title="Approve Design"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                    )}

                    {r.status === 'APPROVED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onProvision(r)}
                        className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                        title="Provision Business Account"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Provision
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminQRRequestsTable;
