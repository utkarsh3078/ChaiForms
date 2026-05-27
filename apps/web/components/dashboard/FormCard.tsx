"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { format } from "date-fns";

export function FormCard({ form, className }: { form: any; className?: string }) {
  return (
    <Card
      className={cn("group hover:shadow-md transition-all duration-200 rounded-2xl", className)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold truncate">{form.title}</h3>
              <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {form.visibility ?? "Private"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground truncate">
              {form.description ?? "No description"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div>
                Responses:{" "}
                <span className="font-medium text-foreground">{form.responseCount ?? 0}</span>
              </div>
              <div>
                Created:{" "}
                <span className="font-medium text-foreground">
                  {form.createdAt ? format(new Date(form.createdAt), "PP") : "—"}
                </span>
              </div>
              <div className="px-2 py-0.5 rounded-md bg-muted/20">
                {form.published ? "Published" : "Draft"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href={`/dashboard/forms/${form.id}`}>Open</a>
            </Button>
            <Button size="sm" variant="outline">
              More
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FormCard;
