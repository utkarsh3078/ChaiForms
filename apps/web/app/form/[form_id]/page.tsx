"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGetFormById, useCreateSubmission } from "~/hooks/api/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";

export default function PublicFormPage() {
  const params = useParams() as { form_id?: string } | null;
  const formId = params?.form_id;

  const { form, fields, isLoading, error } = useGetFormById(formId);
  const { createSubmissionAsync, status: submitStatus } = useCreateSubmission();

  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!fields) return;
    const initial: Record<string, any> = {};
    fields
      .slice()
      .sort((a, b) => Number(a.index) - Number(b.index))
      .forEach((f) => {
        initial[f.id] = f.type === "YES_NO" ? Boolean(f.isRequired) : "";
      });
    setValues(initial);
  }, [fields]);

  if (isLoading) return <div className="p-6">Loading form…</div>;
  if (error) return <div className="p-6 text-destructive">Error loading form.</div>;
  if (!form) return <div className="p-6">Form not found.</div>;

  function handleChange(fieldId: string, v: any) {
    setValues((s) => ({ ...s, [fieldId]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formId) return;

    const payloadValues = (fields ?? [])
      .map((f) => ({ formFieldId: f.id, value: String(values[f.id] ?? "") }))
      .filter((v) => v.formFieldId);

    createSubmissionAsync(
      { formId, values: payloadValues },
      {
        onSuccess: () => {
          // eslint-disable-next-line no-console
          console.log("submission created");
          alert("Thanks — your response has been recorded.");
        },
        onError: () => {
          alert("Failed to submit form.");
        },
      },
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
          {form.description ? <CardDescription>{form.description}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(fields ?? [])
              .slice()
              .sort((a, b) => Number(a.index) - Number(b.index))
              .map((field) => {
                const key = field.id;
                const value = values[key];

                return (
                  <div key={key} className="grid gap-1">
                    <Label className="mb-1">{field.fieldLabel}</Label>
                    {field.type === "YES_NO" ? (
                      <Checkbox
                        checked={Boolean(value)}
                        onCheckedChange={(v) => handleChange(key, Boolean(v))}
                      />
                    ) : field.type === "PASSWORD" ? (
                      <Input
                        type="password"
                        placeholder={field.placeholder ?? undefined}
                        value={value ?? ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    ) : field.type === "DATE" ? (
                      <Input
                        type="date"
                        value={value ?? ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    ) : field.type === "EMAIL" ? (
                      <Input
                        type="email"
                        placeholder={field.placeholder ?? undefined}
                        value={value ?? ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    ) : field.type === "NUMBER" ? (
                      <Input
                        type="number"
                        placeholder={field.placeholder ?? undefined}
                        value={value ?? ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    ) : field.type === "TEXT" && field.description ? (
                      <Textarea
                        placeholder={field.placeholder ?? undefined}
                        value={value ?? ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    ) : (
                      <Input
                        type="text"
                        placeholder={field.placeholder ?? undefined}
                        value={value ?? ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}

            <div className="pt-4">
              <Button type="submit" disabled={submitStatus === "pending"}>
                {submitStatus === "pending" ? "Submitting…" : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
