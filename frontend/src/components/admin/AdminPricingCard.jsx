import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { adminService } from '../../services/adminService';
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  History,
  ShieldAlert,
} from 'lucide-react';

export const AdminPricingCard = ({ token }) => {
  const [currentPrice, setCurrentPrice] = useState(1000);
  const [currency, setCurrency] = useState('INR');
  const [inputPrice, setInputPrice] = useState('1000');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchPricingData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getPricingSettings(token);
      if (res && res.pricing) {
        setCurrentPrice(res.pricing.price);
        setInputPrice(String(res.pricing.price));
        setCurrency(res.pricing.currency || 'INR');
      }
      if (res && res.history) {
        setHistory(res.history);
      }
    } catch (err) {
      console.error('[AdminPricingCard] Fetch error:', err);
      setError(err.message || 'Failed to load pricing settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingData();
  }, [token]);

  const handleSavePrice = async (e) => {
    e.preventDefault();
    const numeric = Number(inputPrice);
    if (isNaN(numeric) || numeric < 0) {
      setError('Please provide a valid non-negative price.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const res = await adminService.updatePricingSettings(token, {
        price: numeric,
        currency,
      });

      setCurrentPrice(res.pricing.price);
      setInputPrice(String(res.pricing.price));
      setSuccessMessage(res.message || `Ratevia price successfully updated to ₹${res.pricing.price}`);
      fetchPricingData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('[AdminPricingCard] Update error:', err);
      setError(err.message || 'Failed to update pricing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white border-border shadow-xs space-y-6">
        <CardHeader className="p-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2 text-slate-900">
              <DollarSign className="h-5 w-5 text-accent" />
              Dynamic Ratevia QR Pricing
            </CardTitle>
            <span className="text-[11px] font-mono text-muted-foreground uppercase bg-slate-100 px-2 py-0.5 rounded">
              Currency: {currency}
            </span>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Configure the public one-time setup fee for new business QR stands. Changes reflect immediately across the public customizer and marketing pages.
          </CardDescription>
        </CardHeader>

        {successMessage && (
          <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-800 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSavePrice} className="space-y-4">
          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-slate-900 mb-1.5 font-mono uppercase">
              Current Package Price (₹)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={inputPrice}
                  onChange={(e) => setInputPrice(e.target.value)}
                  className="pl-7 font-mono font-bold text-sm"
                  disabled={loading || saving}
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={saving || loading || Number(inputPrice) === currentPrice}
                className="rounded-md shrink-0 text-xs h-11"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Price'}
              </Button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Active price: <strong className="text-slate-900">₹{Number(currentPrice).toLocaleString('en-IN')}</strong>
            </p>
          </div>
        </form>
      </Card>

      {/* Price Audit History */}
      <Card className="p-6 bg-white border-border shadow-xs space-y-4">
        <div className="flex items-center gap-2 font-display text-base font-semibold text-slate-900">
          <History className="h-4 w-4 text-accent" />
          Price Change Audit History
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No historical price updates recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border text-[11px] font-mono text-muted-foreground uppercase">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Previous Price</th>
                  <th className="py-2.5 px-3">Updated Price</th>
                  <th className="py-2.5 px-3">Changed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-[11px]">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {new Date(h.changedAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">₹{h.oldPrice}</td>
                    <td className="py-2.5 px-3 font-bold text-accent">₹{h.newPrice}</td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {h.changedBy?.email || 'Admin'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminPricingCard;
