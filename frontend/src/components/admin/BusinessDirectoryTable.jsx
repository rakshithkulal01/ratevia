import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Building2,
  ExternalLink,
  Power,
  Loader2,
} from 'lucide-react';
import { getCategoryConfig } from '../../config/businessCategories';

export const BusinessDirectoryTable = ({
  businesses,
  loading,
  searchQuery,
  onToggleStatus,
  updatingId,
}) => {
  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted-foreground">Loading directory...</p>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <Card className="p-12 text-center bg-muted/20">
        <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium text-foreground">No businesses found</p>
        <p className="text-xs text-muted-foreground mt-1">
          {searchQuery ? 'Try adjusting your search filter' : 'No businesses provisioned yet.'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {businesses.map((b) => {
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
                  onClick={() => onToggleStatus(b.id, isActive)}
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
  );
};

export default BusinessDirectoryTable;
