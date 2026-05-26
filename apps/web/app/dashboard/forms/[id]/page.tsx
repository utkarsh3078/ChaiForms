"use client";

import type { CSSProperties } from "react";
import { useParams } from "next/navigation";

import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { useListForms } from "~/hooks/api/form";

export default function FormBuilderPage() {
  const params = useParams<{ id: string }>();
  const formId = params?.id;
  const { forms, isLoading, error } = useListForms();

  const form = forms?.find((item) => item.id === formId);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6">
          <Card className="max-w-4xl">
            <CardHeader className="space-y-2">
              <CardTitle>Form Builder</CardTitle>
              <CardDescription>
                Edit and configure form {formId} from this builder page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? <p className="text-sm text-muted-foreground">Loading form...</p> : null}
              {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

              {!isLoading && !error && !form ? (
                <p className="text-sm text-muted-foreground">Form not found.</p>
              ) : null}

              {form ? (
                <div className="grid gap-4 rounded-lg border p-4">
                  <div className="grid gap-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      Title
                    </span>
                    <p className="text-sm font-medium">{form.title}</p>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      Description
                    </span>
                    <p className="text-sm">{form.description ?? "No description provided"}</p>
                  </div>
                  <div className="grid gap-1 sm:grid-cols-2">
                    <div className="grid gap-1">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        Expiry date
                      </span>
                      <p className="text-sm">{new Date(form.expiryDate).toLocaleDateString()}</p>
                    </div>
                    <div className="grid gap-1">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        Expiry time
                      </span>
                      <p className="text-sm">{new Date(form.expiryTime).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="grid gap-1 sm:grid-cols-2">
                    <div className="grid gap-1">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        Created at
                      </span>
                      <p className="text-sm">
                        {form.createdAt ? new Date(form.createdAt).toLocaleString() : "—"}
                      </p>
                    </div>
                    <div className="grid gap-1">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        Updated at
                      </span>
                      <p className="text-sm">
                        {form.updatedAt ? new Date(form.updatedAt).toLocaleString() : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      Form ID
                    </span>
                    <p className="text-sm">{form.id}</p>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline">Save draft</Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
