"use client";

import React, { useState } from "react";
import DashboardShell from "~/components/dashboard/DashboardShell";
import TopNavbar from "~/components/dashboard/TopNavbar";
import { Button } from "~/components/ui/button";
import PageHeader from "~/components/dashboard/PageHeader";
import StatsCard from "~/components/dashboard/StatsCard";
import SearchFilters from "~/components/dashboard/SearchFilters";
import DashboardGrid from "~/components/dashboard/DashboardGrid";
import FormCard from "~/components/dashboard/FormCard";
import EmptyState from "~/components/dashboard/EmptyState";
import { useListForms } from "~/hooks/api/form";
import { Skeleton } from "~/components/ui/skeleton";
import CreateFormDialog from "~/components/dashboard/CreateFormDialog";

export default function Page() {
  const { forms, isLoading: isFormsLoading, error: formsError } = useListForms();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = (forms ?? [])
    .filter((f: any) => {
      if (filter === "all") return true;
      if (filter === "published") return !!f.published;
      if (filter === "draft") return !f.published;
      if (filter === "public") return f.visibility === "Public";
      if (filter === "unlisted") return f.visibility === "Unlisted";
      return true;
    })
    .filter((f: any) =>
      search ? (f.title ?? "").toLowerCase().includes(search.toLowerCase()) : true,
    );

  return (
    <DashboardShell>
      <TopNavbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PageHeader
          title="Forms"
          subtitle="Create, organize and publish forms."
          right={<SearchFilters active={filter} onChange={setFilter} />}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <StatsCard title="Total Forms" value={(forms ?? []).length} />
          <StatsCard
            title="Published"
            value={(forms ?? []).filter((f: any) => f.published).length}
          />
          <StatsCard
            title="Responses"
            value={(forms ?? []).reduce((s: any, f: any) => s + (f.responseCount || 0), 0)}
          />
        </div>

        {isFormsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : formsError ? (
          <div className="text-destructive">{formsError.message}</div>
        ) : filtered.length > 0 ? (
          <DashboardGrid>
            {filtered.map((form: any) => (
              <FormCard key={form.id} form={form} />
            ))}
          </DashboardGrid>
        ) : (
          <div className="max-w-3xl">
            <EmptyState
              title="No forms found"
              description="You don't have any forms matching this filter. Create a new form to get started."
              action={<CreateFormDialog trigger={<Button>Create form</Button>} />}
            />
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
