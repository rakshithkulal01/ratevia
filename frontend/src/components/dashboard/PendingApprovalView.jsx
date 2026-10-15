import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Clock,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Building2,
  QrCode,
  ShieldCheck,
  PackageCheck,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const PendingApprovalView = ({ pendingRequest, onRefresh, refreshing }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRef = () => {
    if (pendingRequest?.referenceId) {
      navigator.clipboard.writeText(pendingRequest.referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const steps = [
    {
      title: 'QR Request Received',
      desc: 'Custom design and business info submitted successfully.',
      status: 'completed',
    },
    {
      title: 'Admin Review & Verification',
      desc: 'Our operations team is currently reviewing your profile.',
      status: 'current',
    },
    {
      title: 'Standee Production & Setup',
      desc: 'Generating your production QR standee and analytics route.',
      status: 'upcoming',
    },
    {
      title: 'Dashboard Live Activation',
      desc: 'Full access to live customer analytics, reviews, and QR tools.',
      status: 'upcoming',
    },
  ];

  const formattedDate = pendingRequest?.createdAt
    ? new Date(pendingRequest.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-fade-in">
      {/* Top Status Alert */}
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <Clock className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-100 font-medium">
                  Under Admin Review
                </Badge>
                {pendingRequest?.referenceId && (
                  <span className="text-xs font-mono text-muted-foreground">
                    Ref: #{pendingRequest.referenceId}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                Your QR Request is Awaiting Approval
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Thank you for submitting your customized QR design for <strong className="text-foreground">{pendingRequest?.businessName || 'your business'}</strong>. Our admin team will verify your setup shortly.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Button
              onClick={onRefresh}
              disabled={refreshing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 font-medium"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Checking...' : 'Refresh Status'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Request Details + Sticker Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-accent" />
                Submitted Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground font-mono uppercase block mb-1">
                    Business Name
                  </span>
                  <span className="font-semibold text-foreground text-base">
                    {pendingRequest?.businessName || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground font-mono uppercase block mb-1">
                    Business Type
                  </span>
                  <Badge variant="outline" className="font-mono uppercase text-xs">
                    {pendingRequest?.businessType || 'General'}
                  </Badge>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground font-mono uppercase block mb-1">
                    Submitted Date
                  </span>
                  <span className="text-muted-foreground">{formattedDate}</span>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground font-mono uppercase block mb-1">
                    Order Reference ID
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-foreground bg-muted px-2 py-1 rounded">
                      {pendingRequest?.referenceId || 'N/A'}
                    </span>
                    {pendingRequest?.referenceId && (
                      <button
                        onClick={handleCopyRef}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy Reference ID"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {pendingRequest?.destinationUrl && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-muted-foreground font-mono uppercase block mb-1">
                      Destination Google Review Link
                    </span>
                    <a
                      href={pendingRequest.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline break-all"
                    >
                      <span>{pendingRequest.destinationUrl}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Timeline */}
          <Card className="border-border">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Activation Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {steps.map((step, idx) => {
                  const isDone = step.status === 'completed';
                  const isCurrent = step.status === 'current';
                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div
                        className={`absolute -left-6 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-accent text-white ring-4 ring-accent/20 animate-pulse'
                            : 'bg-muted border border-border text-muted-foreground'
                        }`}
                      >
                        {isDone ? <Check className="h-3 w-3 stroke-[3]" /> : idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-semibold ${
                              isDone ? 'text-foreground' : isCurrent ? 'text-accent' : 'text-muted-foreground'
                            }`}
                          >
                            {step.title}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-mono font-bold bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                              Current Step
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Sticker / QR Preview & Support Card */}
        <div className="space-y-6">
          {pendingRequest?.stickerImageUrl ? (
            <Card className="border-border overflow-hidden">
              <CardHeader className="pb-2 bg-muted/30">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-accent" />
                  Your Custom Standee Mockup
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="relative rounded-xl border border-border overflow-hidden shadow-sm max-w-full bg-white">
                  <img
                    src={pendingRequest.stickerImageUrl}
                    alt="Customized QR Design"
                    className="w-full h-auto max-h-72 object-contain"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 text-center">
                  This design was captured and attached to your order for precision acrylic printing.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">Custom QR Provisioning</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Our team is generating your unique review routing shortlink and high-density SVG vectors.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Need Help card */}
          <Card className="border-border bg-muted/20">
            <CardContent className="p-5 text-xs text-muted-foreground space-y-2.5">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <HelpCircle className="h-4 w-4 text-accent" />
                <span>Need expedited approval?</span>
              </div>
              <p>
                Have questions or need to update your Google Review URL before production? Reach out directly with your Reference ID.
              </p>
              <div className="pt-1">
                <a
                  href={`mailto:support@ratevia.com?subject=Expedite%20QR%20Request%20${pendingRequest?.referenceId || ''}`}
                  className="inline-flex items-center text-xs font-semibold text-accent hover:underline"
                >
                  Contact Support Team &rarr;
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalView;
