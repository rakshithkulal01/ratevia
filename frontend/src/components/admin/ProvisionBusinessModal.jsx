import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Loader2 } from 'lucide-react';
import { getCategoryOptions } from '../../config/businessCategories';

export const ProvisionBusinessModal = ({
  show,
  onClose,
  onSubmit,
  provisionName,
  setProvisionName,
  provisionType,
  setProvisionType,
  provisionGoogleUrl,
  setProvisionGoogleUrl,
  provisionOwnerEmail,
  setProvisionOwnerEmail,
  provisionOwnerName,
  setProvisionOwnerName,
  provisionRequestId,
  provisioning,
  provisionError,
}) => {
  if (!show) return null;

  return (
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
            onClick={onClose}
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

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
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
              onClick={onClose}
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
  );
};

export default ProvisionBusinessModal;
