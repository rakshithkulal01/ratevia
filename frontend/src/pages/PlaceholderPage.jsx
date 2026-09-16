import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const PlaceholderPage = ({ title, description, phase, route }) => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Design System Showcase
        </Link>
      </div>

      <div className="mb-8 space-y-4">
        <Badge dot pulse>
          Phase {phase} Placeholder
        </Badge>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route Information</CardTitle>
          <CardDescription>Target path: <code className="font-mono text-accent">{route}</code></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This route is established for the React Router configuration in Phase 2. Full business logic, forms, and interactive views will be implemented in its designated development phase.
          </p>
          <div className="flex gap-3">
            <Link to="/">
              <Button variant="primary">Return Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
