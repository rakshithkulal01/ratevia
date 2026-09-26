import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Settings,
  Building2,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Clock,
} from 'lucide-react';

import { getCategoryOptions } from '../../config/businessCategories';
import { businessService } from '../../services/businessService';

export const BusinessSettingsPage = () => {
  const { session } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('CAFE');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadBusiness = async () => {
      if (!session?.access_token) return;
      try {
        setLoading(true);
        const json = await businessService.getBusiness(session.access_token);
        if (mounted && json.business) {
          setBusiness(json.business);
          setName(json.business.name || '');
          setBusinessType(json.business.businessType || 'CAFE');
          setGoogleReviewUrl(json.business.googleReviewUrl || '');
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Could not load business settings.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBusiness();
    return () => { mounted = false; };
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.access_token) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      const json = await businessService.updateBusiness(session.access_token, {
        name,
        businessType,
        googleReviewUrl,
      });

      setBusiness(json.business);
      setSuccessMsg('Business settings successfully updated.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const sub = business?.subscription;

  return (
    <DashboardLayout activeTab="settings">
      <div className="max-w-3xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Business Settings</h2>
          <p className="text-xs text-muted-foreground">
            Manage your public business profile, category, and Google Review target link.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Details</CardTitle>
            <CardDescription className="text-xs">
              These details are displayed on your customer QR review page.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Business Name */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Business Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Coastal Brew Café"
                  required
                />
              </div>

              {/* Business Category */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Business Category
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {getCategoryOptions().map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Google Review URL */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Google Review URL
                </label>
                <Input
                  type="url"
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/your-business/review"
                  required
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  The destination link where customers submit their final Google review.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Read-Only Account Information */}
        <Card className="p-6 bg-muted/20">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            System & Routing Metadata
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block mb-0.5">Business Slug:</span>
              <code className="font-mono bg-white px-2 py-1 rounded-md border border-border">
                {business?.slug || '—'}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Account Status:</span>
              <Badge variant="outline" className="font-mono text-[10px] uppercase text-emerald-600 border-emerald-300">
                {business?.isActive ? 'ACTIVE' : 'SUSPENDED'}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Product Plan:</span>
              <span className="font-mono text-foreground font-semibold">
                ₹1,000 One-Time
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Usage Limit:</span>
              <span className="font-mono text-emerald-600 font-semibold">
                Unlimited
              </span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
