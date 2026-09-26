import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Building2,
  Phone,
  Copy,
  Eye,
  Plus,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { getCategoryConfig } from '../../config/businessCategories';

export const BusinessRequestTable = ({
  requests,
  loading,
  searchQuery,
  statusFilter,
  onSelectRequest,
  onLogContact,
  onOpenProvision,
  loggingContactId,
  copiedPhoneId,
  onCopyPhone,
}) => {
  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted-foreground">Loading business requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="p-12 text-center bg-muted/20">
        <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium text-foreground">No registration requests found</p>
        <p className="text-xs text-muted-foreground mt-1">
          {searchQuery || statusFilter !== 'ALL'
            ? 'Try adjusting your status or search filters'
            : 'When prospective businesses fill out the contact form, their requests will appear here.'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const isLogging = loggingContactId === req.id;
        const isCopied = copiedPhoneId === req.id;

        return (
          <Card
            key={req.id}
            className="p-5 hover:border-accent/40 transition-colors cursor-pointer"
            onClick={() => onSelectRequest(req)}
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
                      onClick={(e) => onCopyPhone(req.phoneNumber, req.id, e)}
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
                  onClick={() => onSelectRequest(req)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>

                {req.status === 'NEW' && (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isLogging}
                    onClick={(e) => onLogContact(req.id, e)}
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
                    onClick={(e) => onOpenProvision(req, e)}
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
  );
};

export default BusinessRequestTable;
