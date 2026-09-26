import React from 'react';
import { Card } from '../ui/Card';

export const AdminStatsGrid = ({ stats, newRequestsCount, contactedRequestsCount, totalRequestsCount }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="p-4 border-l-4 border-l-amber-500">
        <span className="text-[11px] font-mono uppercase text-muted-foreground block">
          New Requests
        </span>
        <span className="text-2xl font-bold font-display text-amber-600 mt-1 block">
          {stats.newRequests ?? newRequestsCount}
        </span>
      </Card>
      <Card className="p-4 border-l-4 border-l-blue-500">
        <span className="text-[11px] font-mono uppercase text-muted-foreground block">
          Contacted Leads
        </span>
        <span className="text-2xl font-bold font-display text-blue-600 mt-1 block">
          {stats.contactedRequests ?? contactedRequestsCount}
        </span>
      </Card>
      <Card className="p-4">
        <span className="text-[11px] font-mono uppercase text-muted-foreground block">
          Total Inquiries
        </span>
        <span className="text-2xl font-bold font-display text-foreground mt-1 block">
          {stats.totalRequests ?? totalRequestsCount}
        </span>
      </Card>
      <Card className="p-4">
        <span className="text-[11px] font-mono uppercase text-muted-foreground block">
          Active Venues
        </span>
        <span className="text-2xl font-bold font-display text-emerald-600 mt-1 block">
          {stats.activeBusinesses}
        </span>
      </Card>
      <Card className="p-4">
        <span className="text-[11px] font-mono uppercase text-muted-foreground block">
          Total Feedbacks
        </span>
        <span className="text-2xl font-bold font-display text-foreground mt-1 block">
          {stats.totalFeedbacks}
        </span>
      </Card>
    </div>
  );
};

export default AdminStatsGrid;
