import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import {
  Sparkles,
  ArrowRight,
  Star,
  QrCode,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const DesignSystemShowcase = () => {
  const [testInput, setTestInput] = useState('');

  const routes = [
    { path: '/login', label: 'Login', phase: '3' },
    { path: '/signup', label: 'Signup', phase: '3' },
    { path: '/onboarding', label: 'Business Onboarding', phase: '4' },
    { path: '/dashboard', label: 'Business Dashboard', phase: '7' },
    { path: '/dashboard/analytics', label: 'Analytics', phase: '7' },
    { path: '/dashboard/feedback', label: 'Feedback History', phase: '7' },
    { path: '/dashboard/qr', label: 'QR Management', phase: '5' },
    { path: '/dashboard/business', label: 'Business Settings', phase: '7' },
    { path: '/admin', label: 'Admin Panel', phase: '8' },
    { path: '/r/demo-cafe', label: 'Customer QR Flow (/r/:slug)', phase: '6' },
  ];

  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* 1. Hero / Typography Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start space-y-6">
          <Badge dot pulse>
            Phase 2 Design System Foundation
          </Badge>

          <div className="relative">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl tracking-tight text-foreground max-w-3xl leading-[1.08]">
              Turn customer experiences into{' '}
              <span className="relative inline-block">
                <span className="gradient-text">better reviews</span>
                <span className="gradient-underline" />
              </span>
              .
            </h1>
          </div>

          <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Ratevia pairs warm serif headlines (<span className="font-display text-foreground">Calistoga</span>) with crystal-clear UI typography (<span className="font-sans font-medium text-foreground">Inter</span>) and an electric blue signature gradient.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/onboarding">
              <Button variant="primary" size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary" size="lg">
                View Dashboard Preview
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Component Primitives Showcase: Buttons & Badges */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <Badge>Interactive Primitives</Badge>
          <h2 className="font-display text-3xl sm:text-4xl text-foreground">
            Button & Badge Variants
          </h2>
          <p className="text-muted-foreground">
            Designed for tactile responsiveness with subtle lift, accent shadows, and active states.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Button Hierarchy</CardTitle>
              <CardDescription>Electric blue gradient primary, clean secondary, outline, and ghost variants.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4 pt-2">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost Button</Button>
            </CardContent>
          </Card>

          {/* Badges & Section Labels */}
          <Card>
            <CardHeader>
              <CardTitle>Section Labels & Badges</CardTitle>
              <CardDescription>Monospaced typography (JetBrains Mono) with optional pulsing status indicators.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4 pt-2">
              <Badge dot pulse>Active Trial</Badge>
              <Badge dot>Verified Business</Badge>
              <Badge variant="muted" dot={false}>Demo Mode</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Cards Showcase: Standard vs Featured */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <Badge>Surface System</Badge>
          <h2 className="font-display text-3xl sm:text-4xl text-foreground">
            Elevated & Featured Cards
          </h2>
          <p className="text-muted-foreground">
            Pure white surfaces with subtle structural borders and high-impact gradient borders.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <Card>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <QrCode className="h-6 w-6" />
            </div>
            <CardTitle className="mb-2">Smart QR Routing</CardTitle>
            <CardDescription className="text-sm">
              Point customers to our guided flow instead of bare URLs. Capture real feedback first.
            </CardDescription>
          </Card>

          {/* Card 2: Featured Gradient Border */}
          <Card featured>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-accent to-accent-secondary text-white shadow-sm shadow-accent">
              <Star className="h-6 w-6" />
            </div>
            <CardTitle className="mb-2">Review Assistance</CardTitle>
            <CardDescription className="text-sm">
              Featured 2px stroke effect. Customers get AI/guided assistance to turn thoughts into words.
            </CardDescription>
          </Card>

          {/* Card 3 */}
          <Card>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <BarChart3 className="h-6 w-6" />
            </div>
            <CardTitle className="mb-2">Business Insights</CardTitle>
            <CardDescription className="text-sm">
              Identify what customers love and where improvement is needed before it affects reputation.
            </CardDescription>
          </Card>
        </div>
      </section>

      {/* 4. Input Elements */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Card className="max-w-xl">
          <CardHeader>
            <Badge dot>Form Controls</Badge>
            <CardTitle className="mt-2">Accessible Inputs</CardTitle>
            <CardDescription>
              48px height touch-optimized inputs with electric blue focus rings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Google Review URL
              </label>
              <Input
                placeholder="https://g.page/r/your-business/review"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="primary" size="sm">
              Save Configuration
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* 5. Inverted Contrast Section (DNA from fdesign.md) */}
      <section className="bg-foreground text-white py-20 relative overflow-hidden">
        {/* Subtle dot pattern texture */}
        <div className="absolute inset-0 dot-pattern pointer-events-none opacity-40" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-accent/40 bg-accent/15 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent font-medium">
                  Inverted Contrast DNA
                </span>
              </div>

              <h2 className="font-display text-4xl sm:text-5xl tracking-tight leading-tight">
                Designed for high visual rhythm and trust.
              </h2>

              <p className="text-slate-300 text-lg leading-relaxed">
                Strategic inverted sections provide natural visual breaks, spotlighting key metrics and establishing high-trust credibility for local business owners.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="border-l-2 border-accent pl-4">
                  <div className="font-display text-3xl font-normal text-white">100%</div>
                  <div className="text-sm text-slate-400">Authentic Customer Feedback</div>
                </div>
                <div className="border-l-2 border-accent pl-4">
                  <div className="font-display text-3xl font-normal text-white">&lt; 30s</div>
                  <div className="text-sm text-slate-400">Average Review Completion</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 backdrop-blur shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent" />
                Phase 2 Architecture Verified
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  Prisma schema configured with 6 PostgreSQL models
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  Express backend with modular routes & health endpoint
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  Supabase client prepared for both frontend and backend
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  React Router configuration with 10 established endpoints
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Established Router Navigation Placeholders */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <Badge>Phase 2 Route Registry</Badge>
          <h2 className="font-display text-3xl sm:text-4xl text-foreground">
            Established Application Routes
          </h2>
          <p className="text-muted-foreground">
            Click to verify that each route is configured and accessible through React Router.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((r) => (
            <Link key={r.path} to={r.path} className="group">
              <Card className="h-full transition-all group-hover:-translate-y-1 group-hover:border-accent/40 group-hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-accent">Phase {r.phase}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">{r.label}</h4>
                <p className="font-mono text-xs text-muted-foreground">{r.path}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
