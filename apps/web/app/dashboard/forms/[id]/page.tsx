"use client";

import { useState, type CSSProperties } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import {
  useCreateField,
  useDeleteField,
  useGetFields,
  useListForms,
  useUpdateField,
} from "~/hooks/api/form";

const FIELD_TYPES = ["TEXT", "EMAIL", "NUMBER", "DATE", "YES_NO", "PASSWORD"] as const;

type FieldType = (typeof FIELD_TYPES)[number];

type CreateFieldValues = {
  fieldDisplayText: string;
  fieldKey: string;
  placeholder: string;
  type: FieldType;
  isRequired: boolean;
  description: string;
};

type ExistingField = {
  id: string;
  fieldKey: string;
  index: string;
};

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  TEXT: "Text",
  EMAIL: "Email",
  NUMBER: "Number",
  DATE: "Date",
  YES_NO: "Yes / No",
  PASSWORD: "Password",
};

const createFieldDefaultValues: CreateFieldValues = {
  fieldDisplayText: "",
  fieldKey: "",
  placeholder: "",
  type: "TEXT",
  isRequired: false,
  description: "",
};

function toFieldKey(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "field"
  );
}

function getAvailableFieldKey(label: string, requestedKey: string, fields?: ExistingField[]) {
  const baseKey = toFieldKey(requestedKey || label);
  const existingKeys = new Set(fields?.map((field) => field.fieldKey) ?? []);

  if (!existingKeys.has(baseKey)) return baseKey;

  let suffix = 2;
  while (existingKeys.has(`${baseKey}_${suffix}`)) {
    suffix += 1;
  }

  return `${baseKey}_${suffix}`;
}

function getNextFieldIndex(fields?: ExistingField[]) {
  if (!fields?.length) return 1;

  const highestIndex = Math.max(
    ...fields.map((field) => Number(field.index)).filter((index) => Number.isFinite(index)),
  );

  return Number.isFinite(highestIndex) ? highestIndex + 1 : fields.length + 1;
}

function getFieldType(value: string): FieldType {
  return FIELD_TYPES.includes(value as FieldType) ? (value as FieldType) : "TEXT";
}

export default function FormBuilderPage() {
  const params = useParams<{ id: string }>();
  const formId = params?.id;
  const { forms, isLoading, error } = useListForms();
  const { fields, isLoading: isFieldsLoading, error: fieldsError } = useGetFields(formId);
  const { createFieldAsync, error: createFieldError, status: createFieldStatus } = useCreateField();
  const { updateFieldAsync, error: updateFieldError, status: updateFieldStatus } = useUpdateField();
  const { deleteFieldAsync, status: deleteFieldStatus } = useDeleteField();
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFieldValues>({
    defaultValues: createFieldDefaultValues,
  });

  const form = forms?.find((item) => item.id === formId);
  const isCreatingField = createFieldStatus === "pending";
  const isUpdatingField = updateFieldStatus === "pending";
  const isDeletingField = deleteFieldStatus === "pending";
  const isSavingField = isCreatingField || isUpdatingField;

  const openCreateFieldDialog = () => {
    setEditingFieldId(null);
    reset(createFieldDefaultValues);
    setIsFieldDialogOpen(true);
  };

  const openEditFieldDialog = (field: {
    id: string;
    fieldLabel: string;
    fieldKey: string;
    placeholder: string | null;
    type: string;
    isRequired: boolean | null;
    description: string | null;
  }) => {
    setEditingFieldId(field.id);
    reset({
      fieldDisplayText: field.fieldLabel,
      fieldKey: field.fieldKey,
      placeholder: field.placeholder ?? "",
      type: getFieldType(field.type),
      isRequired: Boolean(field.isRequired),
      description: field.description ?? "",
    });
    setIsFieldDialogOpen(true);
  };

  const onFieldDialogOpenChange = (open: boolean) => {
    setIsFieldDialogOpen(open);

    if (!open) {
      setEditingFieldId(null);
      reset(createFieldDefaultValues);
    }
  };

  const onSaveField = async (values: CreateFieldValues) => {
    if (!formId) return;

    try {
      const existingFields = fields?.filter((field) => field.id !== editingFieldId);
      const fieldPayload = {
        fieldDisplayText: values.fieldDisplayText,
        fieldKey: getAvailableFieldKey(values.fieldDisplayText, values.fieldKey, existingFields),
        placeholder: values.placeholder.trim() || null,
        isRequired: values.isRequired,
        type: values.type,
        description: values.description.trim() || null,
      };

      if (editingFieldId) {
        await updateFieldAsync({
          id: editingFieldId,
          ...fieldPayload,
        });
      } else {
        await createFieldAsync({
          formId,
          ...fieldPayload,
          index: getNextFieldIndex(fields),
        });
      }

      reset(createFieldDefaultValues);
      setEditingFieldId(null);
      setIsFieldDialogOpen(false);
    } catch {
      // The mutation hook exposes the error in the dialog.
    }
  };

  const onDeleteField = async (id: string) => {
    setDeletingFieldId(id);
    try {
      await deleteFieldAsync({ id });
    } finally {
      setDeletingFieldId(null);
    }
  };

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
          <Card className="w-full max-w-6xl">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <CardTitle>Form Builder</CardTitle>
                <CardDescription>
                  Edit and configure form {formId} from this builder page.
                </CardDescription>
                {formId ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>Public form link:</span>
                    <Button asChild variant="link" className="h-auto p-0 text-sm">
                      <Link href={`/form/${formId}`} target="_blank" rel="noreferrer">
                        /form/{formId}
                      </Link>
                    </Button>
                    <span className="hidden sm:inline">
                      Share this publicly to collect responses.
                    </span>
                  </div>
                ) : null}
              </div>
              <Dialog open={isFieldDialogOpen} onOpenChange={onFieldDialogOpenChange}>
                <div className="flex flex-wrap items-center gap-2">
                  {formId ? (
                    <Button asChild variant="outline">
                      <Link href={`/form/${formId}`} target="_blank" rel="noreferrer">
                        Open public form
                      </Link>
                    </Button>
                  ) : null}
                  <Button disabled={!form} onClick={openCreateFieldDialog}>
                    <Plus />
                    Add field
                  </Button>
                </div>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingFieldId ? "Edit form field" : "Add form field"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingFieldId
                        ? "Update this question for this form."
                        : "Create a new question for this form."}
                    </DialogDescription>
                  </DialogHeader>

                  <form className="grid gap-4" onSubmit={handleSubmit(onSaveField)}>
                    <div className="grid gap-2">
                      <Label htmlFor="fieldDisplayText">Field label</Label>
                      <Input
                        id="fieldDisplayText"
                        placeholder="Customer name"
                        {...register("fieldDisplayText", {
                          required: "Field label is required",
                          maxLength: {
                            value: 255,
                            message: "Field label must be 255 characters or less",
                          },
                        })}
                      />
                      {errors.fieldDisplayText ? (
                        <p className="text-sm text-destructive">
                          {errors.fieldDisplayText.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="fieldKey">Field key</Label>
                        <Input
                          id="fieldKey"
                          placeholder="customer_name"
                          {...register("fieldKey", {
                            maxLength: {
                              value: 255,
                              message: "Field key must be 255 characters or less",
                            },
                          })}
                        />
                        {errors.fieldKey ? (
                          <p className="text-sm text-destructive">{errors.fieldKey.message}</p>
                        ) : null}
                      </div>

                      <div className="grid gap-2">
                        <Label>Field type</Label>
                        <Controller
                          control={control}
                          name="type"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {FIELD_TYPE_LABELS[type]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div className="grid gap-2">
                        <Label htmlFor="placeholder">Placeholder</Label>
                        <Input
                          id="placeholder"
                          placeholder="Enter your answer"
                          {...register("placeholder", {
                            maxLength: {
                              value: 255,
                              message: "Placeholder must be 255 characters or less",
                            },
                          })}
                        />
                        {errors.placeholder ? (
                          <p className="text-sm text-destructive">{errors.placeholder.message}</p>
                        ) : null}
                      </div>

                      <Controller
                        control={control}
                        name="isRequired"
                        render={({ field }) => (
                          <div className="flex h-9 items-center justify-between gap-4 rounded-md border px-3">
                            <Label htmlFor="isRequired">Required</Label>
                            <Switch
                              id="isRequired"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Help text shown with this field"
                        {...register("description")}
                      />
                    </div>

                    {createFieldError || updateFieldError ? (
                      <p className="text-sm text-destructive">
                        {createFieldError?.message ?? updateFieldError?.message}
                      </p>
                    ) : null}

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onFieldDialogOpenChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSavingField}>
                        {isSavingField
                          ? editingFieldId
                            ? "Saving..."
                            : "Adding..."
                          : editingFieldId
                            ? "Save field"
                            : "Add field"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? <p className="text-sm text-muted-foreground">Loading form...</p> : null}
              {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

              {!isLoading && !error && !form ? (
                <p className="text-sm text-muted-foreground">Form not found.</p>
              ) : null}

              {form ? (
                <div className="grid gap-6">
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
                          {form.createdAt ? new Date(form.createdAt).toLocaleString() : "Not set"}
                        </p>
                      </div>
                      <div className="grid gap-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                          Updated at
                        </span>
                        <p className="text-sm">
                          {form.updatedAt ? new Date(form.updatedAt).toLocaleString() : "Not set"}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-1">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        Form ID
                      </span>
                      <p className="break-all text-sm">{form.id}</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold">Fields</h3>
                        <p className="text-sm text-muted-foreground">
                          {fields?.length ? `${fields.length} fields configured` : "No fields yet"}
                        </p>
                      </div>
                    </div>

                    {fieldsError ? (
                      <p className="text-sm text-destructive">{fieldsError.message}</p>
                    ) : null}

                    {isFieldsLoading ? (
                      <p className="text-sm text-muted-foreground">Loading fields...</p>
                    ) : fields && fields.length > 0 ? (
                      <div className="grid gap-3">
                        {fields.map((field) => (
                          <div
                            key={field.id}
                            className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
                          >
                            <div className="grid min-w-0 gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">#{Number(field.index)}</Badge>
                                <h4 className="min-w-0 truncate text-sm font-medium">
                                  {field.fieldLabel}
                                </h4>
                                <Badge variant="secondary">
                                  {FIELD_TYPE_LABELS[field.type as FieldType] ?? field.type}
                                </Badge>
                                {field.isRequired ? (
                                  <Badge variant="default">Required</Badge>
                                ) : null}
                              </div>

                              <div className="grid gap-1 text-sm text-muted-foreground">
                                {field.description ? <p>{field.description}</p> : null}
                                {field.placeholder ? <p>Placeholder: {field.placeholder}</p> : null}
                                <p className="break-all text-xs">Key: {field.fieldKey}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 sm:justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEditFieldDialog(field)}
                              >
                                <Pencil />
                                <span className="sr-only">Edit field</span>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                disabled={isDeletingField && deletingFieldId === field.id}
                                onClick={() => onDeleteField(field.id)}
                              >
                                <Trash2 />
                                <span className="sr-only">Delete field</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                        Add your first field to start building this form.
                      </div>
                    )}
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
