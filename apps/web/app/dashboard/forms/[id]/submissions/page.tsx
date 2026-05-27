"use client";

import { useMemo, type CSSProperties } from "react";
import { useParams } from "next/navigation";

import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { useGetFields, useGetSubmissionsByFormId } from "~/hooks/api/form";

type SubmissionValue = {
  formFieldId: string;
  value: string;
};

function formatCellValue(value: string | undefined) {
  if (value === undefined || value === "") return "—";
  if (value === "true") return "Yes";
  if (value === "false") return "No";
  return value;
}

export default function FormSubmissionsPage() {
  const params = useParams<{ id: string }>();
  const formId = params?.id;

  const { fields, isLoading: isFieldsLoading, error: fieldsError } = useGetFields(formId);
  const {
    submissions,
    isLoading: isSubmissionsLoading,
    error: submissionsError,
  } = useGetSubmissionsByFormId(formId);

  const fieldColumns = useMemo(
    () =>
      (fields ?? [])
        .slice()
        .sort((a, b) => Number(a.index) - Number(b.index))
        .map((field) => ({
          id: field.id,
          label: field.fieldLabel,
          required: Boolean(field.isRequired),
        })),
    [fields],
  );

  const submissionRows = useMemo(() => {
    return (submissions ?? []).map((submission, index) => {
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
    });
  }, [submissions]);

  const isLoading = isFieldsLoading || isSubmissionsLoading;
  const error = fieldsError ?? submissionsError;

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
          <Card className="w-full max-w-400">
            <CardHeader className="space-y-2">
              <CardTitle>Form submissions</CardTitle>
              <CardDescription>
                Review submissions for form <span className="font-mono">{formId}</span> in a table
                that uses the field labels as columns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  Failed to load fields or submissions.
                </div>
              ) : null}

              {isLoading ? (
                <div className="rounded-md border bg-muted/30 p-8 text-sm text-muted-foreground">
                  Loading submissions…
                </div>
              ) : fieldColumns.length === 0 ? (
                <div className="rounded-md border bg-muted/30 p-8 text-sm text-muted-foreground">
                  No fields exist for this form yet, so there is nothing to render.
                </div>
              ) : submissionRows.length === 0 ? (
                <div className="rounded-md border bg-muted/30 p-8 text-sm text-muted-foreground">
                  No submissions have been recorded yet.
                </div>
              ) : (
                <div className="rounded-lg border">
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
                            {row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—"}
                          </TableCell>
                          {fieldColumns.map((column) => (
                            <TableCell key={column.id} className="max-w-[320px] whitespace-normal">
                              {formatCellValue(row.valueMap.get(column.id))}
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
