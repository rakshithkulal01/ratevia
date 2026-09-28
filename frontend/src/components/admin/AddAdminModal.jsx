import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  X,
  UserPlus,
  Shield,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const PERMISSION_GROUPS = [
  {
    name: 'General',
    permissions: [
      { key: 'VIEW_DASHBOARD', label: 'View Dashboard', desc: 'Access high-level overview metrics' },
      { key: 'VIEW_ANALYTICS', label: 'View Analytics', desc: 'Inspect scan trends & sentiment' },
    ],
  },
  {
    name: 'Business',
    permissions: [
      { key: 'MANAGE_BUSINESSES', label: 'Manage Businesses', desc: 'Directory, activate/suspend, provisioning' },
      { key: 'MANAGE_BUSINESS_REQUESTS', label: 'Manage Business Requests', desc: 'Review lead inquiries & contact' },
    ],
  },
  {
    name: 'QR Management',
    permissions: [
      { key: 'MANAGE_QR_REQUESTS', label: 'Manage QR Requests', desc: 'Review, approve, and reject custom QR designs' },
      { key: 'MANAGE_QR', label: 'Manage & Download QR', desc: 'Export vector SVG / PNG print stand assets' },
    ],
  },
  {
    name: 'Configuration',
    permissions: [
      { key: 'MANAGE_PRICING', label: 'Manage Pricing', desc: 'Configure platform package prices & audit history' },
    ],
  },
  {
    name: 'Administration',
    permissions: [
      { key: 'MANAGE_ADMINS', label: 'Manage Administrators', desc: 'Create, modify, and deactivate other administrators' },
    ],
  },
];

export const AddAdminModal = ({
  isOpen,
  onClose,
  onSuccess,
  sessionToken,
  actingAdminPermissions = [],
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([
    'VIEW_DASHBOARD',
    'VIEW_ANALYTICS',
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const togglePermission = (key) => {
    if (!actingAdminPermissions.includes(key)) return;

    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSelectAllPermitted = () => {
    setSelectedPermissions(actingAdminPermissions);
  };

  const handleClearAll = () => {
    setSelectedPermissions(['VIEW_DASHBOARD']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('A valid email address is required.');
      return;
    }

    if (selectedPermissions.length === 0) {
      setError('Please select at least one permission.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminService.createAdmin(sessionToken, {
        email: email.trim().toLowerCase(),
        displayName: displayName.trim() || undefined,
        permissions: selectedPermissions,
      });

      if (res.admin) {
        onSuccess(res.admin);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create administrator.');
    } finally {
      setLoading(false);
    }
  };

  const hasManageAdminsSelected = selectedPermissions.includes('MANAGE_ADMINS');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <Card className="relative w-full max-w-2xl bg-white shadow-2xl border-border/80 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Add Administrator
              </h3>
              <p className="text-xs text-muted-foreground">
                Assign granular permissions to authorize platform management capabilities.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Display Name
              </label>
              <Input
                placeholder="e.g. Rachel Zane"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Permissions Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-foreground block">
                  Permissions ({selectedPermissions.length} selected)
                </label>
                <p className="text-[11px] text-muted-foreground">
                  You can only grant permissions that your own administrator account possesses.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllPermitted}
                  className="text-[11px] font-medium text-accent hover:underline"
                >
                  Select All Permitted
                </button>
                <span className="text-muted-foreground text-xs">•</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] font-medium text-muted-foreground hover:underline"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Permissions Group Grid */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.name} className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-muted-foreground block border-b border-border/40 pb-1">
                    {group.name}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.permissions.map((perm) => {
                      const isPermitted = actingAdminPermissions.includes(perm.key);
                      const isChecked = selectedPermissions.includes(perm.key);

                      return (
                        <div
                          key={perm.key}
                          onClick={() => isPermitted && togglePermission(perm.key)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-md border text-left transition-all ${
                            !isPermitted
                              ? 'opacity-40 bg-muted/20 border-border/40 cursor-not-allowed'
                              : isChecked
                              ? 'border-accent bg-accent/5 cursor-pointer shadow-xs'
                              : 'border-border/70 hover:border-border cursor-pointer bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={!isPermitted}
                            checked={isChecked}
                            onChange={() => togglePermission(perm.key)}
                            className="mt-0.5 h-3.5 w-3.5 rounded-xs border-border text-accent focus:ring-accent"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-foreground">
                                {perm.label}
                              </span>
                              {!isPermitted && (
                                <Lock className="h-3 w-3 text-muted-foreground" title="Not available to grant" />
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {perm.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manage Admins Warning Alert */}
          {hasManageAdminsSelected && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2.5">
              <Shield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Granting Administrator Management</span>
                <span>
                  This user will be permitted to add, edit permissions for, and deactivate other administrators on the platform.
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Administrator...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Create Administrator</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
