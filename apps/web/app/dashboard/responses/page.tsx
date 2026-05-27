"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";

import DashboardShell from "~/components/dashboard/DashboardShell";
import TopNavbar from "~/components/dashboard/TopNavbar";
import PageHeader from "~/components/dashboard/PageHeader";
import EmptyState from "~/components/dashboard/EmptyState";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  useGetFields,
  useGetFormById,
  useGetSubmissionsByFormId,
  useListForms,
} from "~/hooks/api/form";

type SubmissionValue = {
  formFieldId: string;
  value: string;
};

function formatSubmissionValue(value: string | undefined) {
  if (!value) return "—";
  if (value === "true") return "Yes";
  if (value === "false") return "No";
  return value;
}

export default function ResponsesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { forms, isLoading: isFormsLoading } = useListForms();
  const [search, setSearch] = useState("");

  const selectedFormIdParam = searchParams.get("formId");
  const selectedFormId = selectedFormIdParam ?? forms?.[0]?.id;

  useEffect(() => {
    if (!selectedFormIdParam && forms?.[0]?.id) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("formId", forms[0].id);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [forms, pathname, router, searchParams, selectedFormIdParam]);

  const { form, isLoading: isFormLoading, error: formError } = useGetFormById(selectedFormId);
  const {
    fields: formFields,
    isLoading: isFieldsLoading,
    error: fieldsError,
  } = useGetFields(selectedFormId);
  const {
    submissions,
    isLoading: isSubmissionsLoading,
    error: submissionsError,
  } = useGetSubmissionsByFormId(selectedFormId);

  const fieldColumns = useMemo(
    () =>
      (formFields ?? [])
        .slice()
        .sort((a, b) => Number(a.index) - Number(b.index))
        .map((field) => ({
          id: field.id,
          label: field.fieldLabel,
          required: Boolean(field.isRequired),
        })),
    [formFields],
  );

  const submissionRows = useMemo(() => {
    return (submissions ?? [])
      .map((submission, index) => {
        const valueMap = new Map<string, string>();

        submission.values.forEach((item: SubmissionValue) => {
          valueMap.set(item.formFieldId, item.value);
        });

        return {
          id: submission.id,
          submittedAt: submission.createdAt ?? null,
          index: index + 1,
          valueMap,
        };
      })
      .filter((row) => {
        if (!search) return true;

        const haystack = [
          row.index,
          row.submittedAt,
          ...fieldColumns.map((column) => row.valueMap.get(column.id) ?? ""),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(search.toLowerCase());
      });
  }, [fieldColumns, search, submissions]);

  const totalResponses = submissions?.length ?? 0;
  const totalFields = fieldColumns.length;
  const isLoading = isFormsLoading || isFormLoading || isFieldsLoading || isSubmissionsLoading;
  const error = formError ?? fieldsError ?? submissionsError;

  return (
    <DashboardShell>
      <TopNavbar />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
        <PageHeader
          title="Responses"
          subtitle="Review submissions for the selected form and switch between forms without leaving the page."
          right={
            <div className="flex items-center gap-2">
              <Select
                value={selectedFormId}
                onValueChange={(value) => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("formId", value);
                  router.replace(`${pathname}?${params.toString()}`);
                }}
                disabled={isFormsLoading || !forms?.length}
              >
                <SelectTrigger className="min-w-[16rem]">
                  <SelectValue placeholder="Select a form" />
                </SelectTrigger>
                <SelectContent>
                  {forms?.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" asChild>
                <a
                  href={selectedFormId ? `/dashboard/forms/${selectedFormId}` : "/dashboard/forms"}
                >
                  Open builder
                </a>
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl border-border/70 bg-card/70 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardDescription>Total Forms</CardDescription>
              <CardTitle className="text-3xl">{forms?.length ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-2xl border-border/70 bg-card/70 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardDescription>Selected Form</CardDescription>
              <CardTitle className="truncate text-3xl">{form?.title ?? "None"}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-2xl border-border/70 bg-card/70 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardDescription>Responses</CardDescription>
              <CardTitle className="text-3xl">{totalResponses}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-2xl border-border/70 bg-card/70 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardDescription>Fields</CardDescription>
              <CardTitle className="text-3xl">{totalFields}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-105 rounded-2xl" />
          </div>
        ) : error ? (
          <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
            <CardContent className="p-6 text-sm text-destructive">
              Failed to load responses for the selected form.
            </CardContent>
          </Card>
        ) : !selectedFormId ? (
          <EmptyState title="No form selected" description="Choose a form to load its responses." />
        ) : (
          <Card className="rounded-2xl border-border/70 bg-card/70 shadow-sm backdrop-blur-sm">
            <CardHeader className="gap-3 border-b border-border/60">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <CardTitle className="text-xl">{form?.title ?? "Selected form"}</CardTitle>
                  <CardDescription>
                    {form?.description ??
                      "Submissions are shown for the form currently selected above."}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {form?.createdAt ? (
                    <Badge variant="outline">
                      Created {format(new Date(form.createdAt), "PP")}
                    </Badge>
                  ) : null}
                  <Badge variant="secondary">{selectedFormId}</Badge>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search responses by value, date, or row number"
                  className="max-w-xl"
                />
                <div className="text-sm text-muted-foreground">
                  {submissionRows.length} matching{" "}
                  {submissionRows.length === 1 ? "response" : "responses"}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {submissionRows.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title={totalResponses === 0 ? "No responses yet" : "No matching responses"}
                    description={
                      totalResponses === 0
                        ? "This form does not have any submissions yet."
                        : "Try a different search term or clear the current query."
                    }
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">#</TableHead>
                        <TableHead className="w-44">Submitted at</TableHead>
                        {fieldColumns.map((column) => (
                          <TableHead key={column.id}>
                            <span>{column.label}</span>
                            {column.required ? (
                              <span className="ml-1 text-destructive">*</span>
                            ) : null}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissionRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium text-muted-foreground">
                            <Badge variant="outline">{row.index}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {row.submittedAt ? format(new Date(row.submittedAt), "PPp") : "—"}
                          </TableCell>
                          {fieldColumns.map((column) => (
                            <TableCell key={column.id} className="max-w-[320px] whitespace-normal">
                              {formatSubmissionValue(row.valueMap.get(column.id))}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
