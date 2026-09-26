import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  X,
  Phone,
  Mail,
  Copy,
  Check,
  Plus,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { getCategoryConfig } from '../../config/businessCategories';

export const BusinessRequestDetailModal = ({
  request,
  onClose,
  onLogContact,
  onOpenProvision,
  loggingContactId,
  copiedPhoneId,
  onCopyPhone,
}) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <Card className="max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground text-lg">
                {request.businessName}
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono">
                {getCategoryConfig(request.businessType).displayName}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registration Inquiry Details & Activity Timeline
            </p>
          </div>
          <button
            onClick={onClose}
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
              {request.ownerName}
            </span>
            <span className="text-muted-foreground block mt-0.5">{request.city}</span>
          </div>
          <div className="p-3 bg-muted/30 rounded-md border border-border">
            <span className="text-muted-foreground block text-[10px] uppercase font-mono mb-1">
              Status
            </span>
            <div className="mt-1">
              {request.status === 'NEW' && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[11px] font-mono uppercase rounded-md">
                  NEW REQUEST
                </Badge>
              )}
              {request.status === 'CONTACTED' && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[11px] font-mono uppercase rounded-md">
                  CONTACTED
                </Badge>
              )}
              {request.status === 'PROVISIONED' && (
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
              href={`tel:${request.phoneNumber}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent/90"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Call {request.phoneNumber}</span>
            </a>

            <Button
              variant="outline"
              size="sm"
              className="rounded-md text-xs h-8"
              onClick={(e) => onCopyPhone(request.phoneNumber, request.id, e)}
            >
              {copiedPhoneId === request.id ? (
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
              href={`mailto:${request.email}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs text-foreground hover:bg-muted"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{request.email}</span>
            </a>
          </div>
        </div>

        {/* Note / Message */}
        {request.message && (
          <div className="p-3 rounded-md bg-muted/20 border border-border space-y-1">
            <span className="text-[10px] uppercase font-mono text-muted-foreground font-semibold block">
              Inquiry Message / Notes
            </span>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {request.message}
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
                {new Date(request.createdAt).toLocaleString('en-IN', {
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
                  request.contactedAt ? 'bg-blue-500' : 'bg-muted border-border'
                }`}
              />
              <p className="text-xs font-medium text-foreground">
                {request.contactedAt ? (
                  <>
                    Contacted by{' '}
                    <strong className="text-foreground">
                      {request.contactedBy?.name || request.contactedBy?.email || 'Admin'}
                    </strong>
                  </>
                ) : (
                  <span className="text-muted-foreground">Pending manual contact</span>
                )}
              </p>
              {request.contactedAt && (
                <p className="text-[10px] text-muted-foreground font-mono">
                  {new Date(request.contactedAt).toLocaleString('en-IN', {
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
                  request.status === 'PROVISIONED' ? 'bg-emerald-500' : 'bg-muted border-border'
                }`}
              />
              <p className="text-xs font-medium text-foreground">
                {request.status === 'PROVISIONED' ? (
                  <>
                    Business provisioned:{' '}
                    <strong className="text-foreground">
                      {request.provisionedBusiness?.name || request.businessName}
                    </strong>
                  </>
                ) : (
                  <span className="text-muted-foreground">Pending customer agreement & provisioning</span>
                )}
              </p>
              {request.provisionedBusiness && (
                <a
                  href={`/r/${request.provisionedBusiness.slug}`}
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
            onClick={onClose}
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            {request.status === 'NEW' && (
              <Button
                variant="primary"
                size="sm"
                className="rounded-md bg-amber-600 hover:bg-amber-700 text-white"
                disabled={loggingContactId === request.id}
                onClick={() => onLogContact(request.id)}
              >
                {loggingContactId === request.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Phone className="mr-1.5 h-3.5 w-3.5" />
                )}
                Log Contact
              </Button>
            )}

            {request.status === 'CONTACTED' && (
              <Button
                variant="primary"
                size="sm"
                className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  onOpenProvision(request);
                  onClose();
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
  );
};

export default BusinessRequestDetailModal;
