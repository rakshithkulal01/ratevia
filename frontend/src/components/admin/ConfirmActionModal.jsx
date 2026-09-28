import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertTriangle, Trash2, ShieldAlert, Loader2, X } from 'lucide-react';

export const ConfirmActionModal = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'destructive',
  icon: Icon = AlertTriangle,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <Card className="relative w-full max-w-md bg-white shadow-2xl border-border/80 overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                confirmVariant === 'destructive'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-base font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              size="sm"
              onClick={onConfirm}
              disabled={loading}
              className="gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{confirmLabel}</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
