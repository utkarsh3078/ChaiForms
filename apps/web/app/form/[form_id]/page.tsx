"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock3, ShieldCheck, Sparkles } from "lucide-react";

import { useCreateSubmission, useGetFormById } from "~/hooks/api/form";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { GlareCard } from "~/components/ui/glare-card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

export default function PublicFormPage() {
  const params = useParams() as { form_id?: string } | null;
  const formId = params?.form_id;

  const { form, fields, isLoading, error } = useGetFormById(formId);
  const { createSubmissionAsync, status: submitStatus } = useCreateSubmission();

  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const initialValues = useMemo(() => {
    const initial: Record<string, string | boolean> = {};

    (fields ?? [])
      .slice()
      .sort((a, b) => Number(a.index) - Number(b.index))
      .forEach((field) => {
        initial[field.id] = field.type === "YES_NO" ? false : "";
      });

    return initial;
  }, [fields]);

  useEffect(() => {
    setValues(initialValues);
    setSubmitted(false);
    setSubmissionError(null);
  }, [initialValues]);

  useEffect(() => {
    if (!form) return;

    const expiryTimestamp = new Date(form.expiryTime).getTime();
    const remaining = expiryTimestamp - Date.now();

    if (remaining <= 0) {
      setNow(Date.now());
      return;
    }

    const timeout = window.setTimeout(() => {
      setNow(Date.now());
    }, remaining + 1);

    return () => window.clearTimeout(timeout);
  }, [form]);

  const sortedFields = useMemo(
    () => (fields ?? []).slice().sort((a, b) => Number(a.index) - Number(b.index)),
    [fields],
  );

  const fieldCount = sortedFields.length;
  const requiredCount = sortedFields.filter((field) => Boolean(field.isRequired)).length;
  const expiryTimestamp = form ? new Date(form.expiryTime).getTime() : null;
  const isFormClosed = Boolean(expiryTimestamp && now >= expiryTimestamp);
  const expiryLabel = form ? new Date(form.expiryTime).toLocaleString() : "";

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 md:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_28%)] opacity-80 dark:opacity-40" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
          <Skeleton className="h-40 rounded-3xl border border-border/60 bg-card/70" />
          <Skeleton className="h-105 rounded-3xl border border-border/60 bg-card/70" />
          <Skeleton className="h-130 rounded-3xl border border-border/60 bg-card/70" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 md:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_28%)] opacity-80 dark:opacity-40" />
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-center py-24">
          <Card className="w-full max-w-xl rounded-3xl border-border/70 bg-card/80 shadow-xl backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
                <ShieldCheck className="size-5" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Could not load this form</h1>
              <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!form) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 md:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_28%)] opacity-80 dark:opacity-40" />
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-center py-24">
          <Card className="w-full max-w-xl rounded-3xl border-border/70 bg-card/80 shadow-xl backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                <Sparkles className="size-5" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Form not found</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                The public link is invalid or the form has not been published yet.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  function handleChange(fieldId: string, v: any) {
    setSubmissionError(null);
    setValues((s) => ({ ...s, [fieldId]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formId) return;

    if (isFormClosed) {
      setSubmissionError("Time for filling is up. The form is closed.");
      return;
    }

    const payloadValues = (fields ?? [])
      .map((f) => ({ formFieldId: f.id, value: String(values[f.id] ?? "") }))
      .filter((v) => v.formFieldId);

    createSubmissionAsync(
      { formId, values: payloadValues },
      {
        onSuccess: () => {
          setSubmitted(true);
          setValues(initialValues);
          setSubmissionError(null);
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : "Failed to submit form.";

          if (
            message.toLowerCase().includes("closed") ||
            message.toLowerCase().includes("expired")
          ) {
            setSubmissionError("Time for filling is up. The form is closed.");
            setNow(Date.now());
            return;
          }

          setSubmissionError(message);
        },
      },
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 md:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_28%)] opacity-80 dark:opacity-40" />
      <div className="absolute inset-x-0 top-0 h-64 bg-linear-to-b from-background/40 via-transparent to-transparent" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="flex flex-col gap-6">
          <GlareCard
            containerClassName="w-full [aspect-ratio:auto]"
            className="relative flex h-full flex-col justify-between gap-8 bg-card/75 p-6 md:p-8"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_35%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_24%)]" />

            <div className="relative space-y-6">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full border-border/60 bg-background/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Public form
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
                >
                  {fieldCount} fields
                </Badge>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                  {form.title}
                </h1>
                {form.description ? (
                  <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                    {form.description}
                  </p>
                ) : (
                  <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                    This form is ready to collect responses through its public link.
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <CheckCircle2 className="size-3.5" />
                    Status
                  </div>
                  <p className="mt-2 text-sm font-medium">Publicly shareable</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    Required
                  </div>
                  <p className="mt-2 text-sm font-medium">
                    {requiredCount} question{requiredCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <ShieldCheck className="size-3.5" />
                    Submission
                  </div>
                  <p className="mt-2 text-sm font-medium">Encrypted transport</p>
                </div>
              </div>
            </div>

            <div className="relative flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-3 py-1.5">
                <Sparkles className="size-3.5" />
                Built with ChaiForms
              </span>
              <span className="rounded-full border border-border/70 bg-background/50 px-3 py-1.5">
                {formId}
              </span>
            </div>
          </GlareCard>

          <GlareCard
            containerClassName="w-full [aspect-ratio:auto]"
            className={cn(
              "h-full bg-card/80 transition-all duration-200",
              submitted && "ring-2 ring-primary/30",
            )}
          >
            <div className="border-b border-border/60 px-6 pb-6 pt-6 md:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold md:text-2xl">
                    {submitted ? "Response received" : "Submit your response"}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {submitted
                      ? "Your response has been recorded. You can close this page or submit again after editing your answers."
                      : "Fill in the fields below and submit when you are ready."}
                  </p>
                </div>
                <Badge
                  variant={submitted ? "default" : "outline"}
                  className="rounded-full px-3 py-1"
                >
                  {submitted ? "Saved" : "Live"}
                </Badge>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {submitted ? (
                <div className="flex flex-col items-start gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-6">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Thanks for sharing your response.</h3>
                    <p className="text-sm text-muted-foreground">
                      The submission was sent successfully and is now available in the dashboard.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setValues(initialValues);
                      setSubmissionError(null);
                    }}
                  >
                    Submit another response
                  </Button>
                </div>
              ) : isFormClosed ? (
                <div className="flex flex-col items-start gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
                  <div className="flex size-12 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      Sorry, this form is not accepting responses.
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Time for filling is up. The form is closed.
                    </p>
                    <p className="text-sm text-muted-foreground">Closed at {expiryLabel}.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {sortedFields.map((field) => {
                    const key = field.id;
                    const value = values[key];

                    const isNameField =
                      field.fieldKey === "name" || field.fieldLabel?.toLowerCase() === "name";

                    return (
                      <div
                        key={key}
                        className="rounded-2xl border border-border/70 bg-background/40 p-4 transition-all duration-200 hover:border-primary/30"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <Label className="text-sm font-medium leading-none">
                            {field.fieldLabel}
                          </Label>
                          {field.isRequired ? (
                            <Badge
                              variant="outline"
                              className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em]"
                            >
                              Required
                            </Badge>
                          ) : null}
                        </div>

                        {field.description ? (
                          <p className="mb-3 text-sm leading-6 text-muted-foreground">
                            {field.description}
                          </p>
                        ) : null}

                        {isNameField ? (
                          <Input
                            type="text"
                            value={typeof value === "boolean" ? "" : (value ?? "")}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="h-9 rounded-lg border-border/60 bg-background/80"
                          />
                        ) : field.type === "YES_NO" ? (
                          <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
                            <Checkbox
                              checked={Boolean(value)}
                              onCheckedChange={(v) => handleChange(key, Boolean(v))}
                            />
                            <div className="text-sm text-muted-foreground">
                              {value ? "Yes" : "No"}
                            </div>
                          </div>
                        ) : field.type === "PASSWORD" ? (
                          <Input
                            type="password"
                            value={typeof value === "boolean" ? "" : (value ?? "")}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="h-11 rounded-xl border-border/70 bg-background/80"
                          />
                        ) : field.type === "DATE" ? (
                          <Input
                            type="date"
                            value={typeof value === "boolean" ? "" : (value ?? "")}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="h-11 rounded-xl border-border/70 bg-background/80"
                          />
                        ) : field.type === "EMAIL" ? (
                          <Input
                            type="email"
                            value={typeof value === "boolean" ? "" : (value ?? "")}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="h-11 rounded-xl border-border/70 bg-background/80"
                          />
                        ) : field.type === "NUMBER" ? (
                          <Input
                            type="number"
                            value={typeof value === "boolean" ? "" : (value ?? "")}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="h-11 rounded-xl border-border/70 bg-background/80"
                          />
                        ) : field.type === "TEXT" && field.description ? (
                          <Textarea
                            value={typeof value === "boolean" ? "" : (value ?? "")}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="min-h-28 rounded-xl border-border/70 bg-background/80"
                          />
                        ) : (
                          <Input
                            type="text"
                            value={typeof value === "boolean" ? "" : (value ?? "")}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="h-11 rounded-xl border-border/70 bg-background/80"
                          />
                        )}
                      </div>
                    );
                  })}

                  <div className="flex flex-col gap-3 border-t border-border/60 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Fields marked as required must be completed before submission.</p>
                      {submissionError ? (
                        <p className="text-destructive">{submissionError}</p>
                      ) : null}
                    </div>
                    <Button
                      type="submit"
                      disabled={submitStatus === "pending"}
                      className="h-11 rounded-xl px-5"
                    >
                      {submitStatus === "pending" ? "Submitting…" : "Submit response"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </GlareCard>
        </section>
      </div>
    </main>
  );
}
