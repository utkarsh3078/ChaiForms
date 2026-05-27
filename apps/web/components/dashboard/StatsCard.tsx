"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function StatsCard({
  title,
  value,
  delta,
}: {
  title: string;
  value: string | number;
  delta?: string;
}) {
  return (
    <Card className="rounded-2xl border border-border bg-card/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <div className="flex items-baseline gap-3">
          <div className="text-2xl font-semibold">{value}</div>
          {delta ? <div className="text-sm text-muted-foreground">{delta}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatsCard;
