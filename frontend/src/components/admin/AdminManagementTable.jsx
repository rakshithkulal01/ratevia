import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Edit,
  Trash2,
  Power,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Key,
} from 'lucide-react';
import { ConfirmActionModal } from './ConfirmActionModal';

export const AdminManagementTable = ({
  admins = [],
  currentAdmin = null,
  onAddAdmin,
  onEditAdmin,
  onToggleStatus,
  onDeleteAdmin,
  loadingActionId = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Confirmation modal states
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmActionType, setConfirmActionType] = useState(null); // 'deactivate' | 'delete'

  const actingPermissions = currentAdmin?.permissions || [];
  const canManageAdmins = actingPermissions.includes('MANAGE_ADMINS');

  // Filter admins
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      (admin.displayName && admin.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (admin.email && admin.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
        ? admin.isActive
        : !admin.isActive;

    return matchesSearch && matchesStatus;
  });

  const handleOpenDeactivateConfirm = (admin) => {
    setConfirmTarget(admin);
    setConfirmActionType('deactivate');
  };

  const handleOpenDeleteConfirm = (admin) => {
    setConfirmTarget(admin);
    setConfirmActionType('delete');
  };

  const handleConfirmAction = () => {
    if (!confirmTarget) return;

    if (confirmActionType === 'deactivate') {
      onToggleStatus(confirmTarget, false);
    } else if (confirmActionType === 'delete') {
      onDeleteAdmin(confirmTarget);
    }

    setConfirmTarget(null);
    setConfirmActionType(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Filters, and Add Admin Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-md border border-border bg-white pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex items-center gap-1 rounded-md border border-border bg-white p-1">
            {['ALL', 'ACTIVE', 'DISABLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-xs transition-colors ${
                  statusFilter === st
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {canManageAdmins && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAddAdmin}
            className="gap-2 shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Administrator</span>
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-border/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-mono uppercase text-[11px] text-muted-foreground">
                <th className="py-3 px-4 font-semibold">Administrator</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Permissions</th>
                <th className="py-3 px-4 font-semibold">Last Active</th>
                <th className="py-3 px-4 font-semibold">Created</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-medium text-sm">No administrators found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {searchQuery ? 'Try clearing your search filters.' : 'Add your first administrator above.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const isCurrent = currentAdmin?.id === admin.id;
                  const perms = admin.permissions || [];
                  const hasSuper = perms.includes('MANAGE_ADMINS');

                  return (
                    <tr
                      key={admin.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent font-semibold text-xs shrink-0">
                            {admin.displayName?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground truncate">
                                {admin.displayName || 'Admin'}
                              </span>
                              {isCurrent && (
                                <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0 border-accent text-accent">
                                  YOU
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground block truncate">
                              {admin.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {admin.isActive ? (
                          <Badge variant="default" className="bg-emerald-600/10 text-emerald-700 border-emerald-300 font-mono text-[10px] uppercase">
                            ACTIVE
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 font-mono text-[10px] uppercase">
                            DISABLED
                          </Badge>
                        )}
                      </td>

                      {/* Permissions */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                          <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                            {perms.length} {perms.length === 1 ? 'perm' : 'perms'}
                          </Badge>
                          {hasSuper && (
                            <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 border-amber-300 text-amber-800 bg-amber-50">
                              MANAGE_ADMINS
                            </Badge>
                          )}
                          {perms.slice(0, hasSuper ? 1 : 2).map((p) => {
                            if (p === 'MANAGE_ADMINS') return null;
                            return (
                              <Badge key={p} variant="outline" className="font-mono text-[10px] px-1.5 py-0 text-muted-foreground">
                                {p.replace('MANAGE_', '').replace('VIEW_', '')}
                              </Badge>
                            );
                          })}
                          {perms.length > (hasSuper ? 2 : 2) && (
                            <span className="text-[10px] text-muted-foreground">
                              +{perms.length - (hasSuper ? 2 : 2)} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                        {admin.lastLoginAt ? (
                          new Date(admin.lastLoginAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                        {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canManageAdmins && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onEditAdmin(admin)}
                                className="h-7 px-2 text-[11px]"
                                title="Edit display name & permissions"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>

                              {admin.isActive ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDeactivateConfirm(admin)}
                                  disabled={loadingActionId === admin.id}
                                  className="h-7 px-2 text-[11px] text-amber-700 hover:bg-amber-50 border-amber-300"
                                  title="Deactivate account"
                                >
                                  <Power className="h-3.5 w-3.5" />
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onToggleStatus(admin, true)}
                                  disabled={loadingActionId === admin.id}
                                  className="h-7 px-2 text-[11px] text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                                  title="Reactivate account"
                                >
                                  <Power className="h-3.5 w-3.5 text-emerald-600" />
                                </Button>
                              )}

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDeleteConfirm(admin)}
                                disabled={loadingActionId === admin.id}
                                className="h-7 px-2 text-[11px] text-red-600 hover:bg-red-50 border-red-200"
                                title="Delete account"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmActionModal
        isOpen={Boolean(confirmTarget)}
        title={
          confirmActionType === 'deactivate'
            ? 'Deactivate Administrator?'
            : 'Delete Administrator?'
        }
        description={
          confirmActionType === 'deactivate'
            ? `Are you sure you want to deactivate ${confirmTarget?.displayName || confirmTarget?.email}? They will immediately lose access to all admin panel functionality until reactivated.`
            : `Are you sure you want to permanently delete ${confirmTarget?.displayName || confirmTarget?.email}? Their admin profile and permissions will be removed from Ratevia.`
        }
        confirmLabel={confirmActionType === 'deactivate' ? 'Deactivate' : 'Delete'}
        confirmVariant={confirmActionType === 'deactivate' ? 'secondary' : 'destructive'}
        icon={confirmActionType === 'deactivate' ? Power : Trash2}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setConfirmTarget(null);
          setConfirmActionType(null);
        }}
      />
    </div>
  );
};
