"use client";

import React from "react";
import { Button } from "~/components/ui/button";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-transparent">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-4">{action ?? <Button>Create form</Button>}</div>
    </div>
  );
}

export default EmptyState;
