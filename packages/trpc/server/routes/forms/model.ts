// This file will contain the input and output models for the form related procedures.
// These models will be used in the trpc router for forms.

import { z } from "zod";

export const createFormInputModel = z.object({
  title: z.string().max(60).describe("title of the form"),
  description: z.string().max(500).optional().describe("description of the form"),
  expiryTime: z.coerce.date().describe("expiry time of the form"),
  expiryDate: z.coerce.date().describe("expiry date of the form"),
});

export const createFormOutputModel = z.object({
  id: z.string().describe("id of the form"),
});

export const listFormsInputModel = z.undefined();

export const listFormsOutputModel = z.array(
  z.object({
    id: z.string().describe("id of the form"),
    title: z.string().describe("title of the form"),
    description: z.string().nullable().optional().describe("description of the form"),
    expiryTime: z.string().describe("expiry time (ISO string)"),
    expiryDate: z.string().describe("expiry date (ISO string)"),
    createdBy: z.string().describe("id of the user who created the form"),
    createdAt: z.string().nullable().describe("created at (ISO string)"),
    updatedAt: z.string().nullable().describe("updated at (ISO string)"),
  }),
);

export const fieldOutputModel = z.object({
  id: z.string(),
  formId: z.string(),
  fieldLabel: z.string(),
  fieldKey: z.string(),
  placeholder: z.string().nullable(),
  isRequired: z.boolean().nullable().default(false),
  type: z.string(),
  index: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const getFormByIdInputModel = z.object({
  formId: z.string().uuid(),
});

export const getFormByIdOutputModel = z.object({
  form: z.object({
    id: z.string().describe("id of the form"),
    title: z.string().describe("title of the form"),
    description: z.string().nullable().optional().describe("description of the form"),
    expiryTime: z.string().describe("expiry time (ISO string)"),
    expiryDate: z.string().describe("expiry date (ISO string)"),
    createdBy: z.string().nullable().describe("id of the user who created the form"),
    createdAt: z.string().nullable().describe("created at (ISO string)"),
    updatedAt: z.string().nullable().describe("updated at (ISO string)"),
  }),
  fields: z.array(fieldOutputModel),
});

export const fieldTypeValues = ["TEXT", "EMAIL", "NUMBER", "DATE", "YES_NO", "PASSWORD"] as const;

// Field procedures models
export const createFieldInputModel = z.object({
  formId: z.string().uuid(),
  fieldDisplayText: z.string().max(255),
  fieldKey: z.string().max(255),
  placeholder: z.string().max(255).nullable().optional(),
  isRequired: z.boolean().optional().default(false),
  type: z.enum(fieldTypeValues),
  index: z.coerce.number(),
  description: z.string().nullable().optional(),
});
export const createFieldOutputModel = z.object({ id: z.string() });

export const updateFieldInputModel = z.object({
  id: z.string().uuid(),
  fieldDisplayText: z.string().max(255).optional(),
  fieldKey: z.string().max(255).optional(),
  placeholder: z.string().max(255).nullable().optional(),
  isRequired: z.boolean().optional(),
  type: z.enum(fieldTypeValues).optional(),
  index: z.coerce.number().optional(),
  description: z.string().nullable().optional(),
});
export const updateFieldOutputModel = z.object({ id: z.string() });

export const deleteFieldInputModel = z.object({ id: z.string().uuid() });
export const deleteFieldOutputModel = z.object({ id: z.string() });

export const getFieldsInputModel = z.object({ formId: z.string().uuid() });
export const getFieldsOutputModel = z.array(fieldOutputModel);

export const submissionValueModel = z.object({
  formFieldId: z.string().uuid(),
  value: z.string(),
});

export const createSubmissionInputModel = z.object({
  formId: z.string().uuid(),
  values: z.array(submissionValueModel).min(1),
});

export const createSubmissionOutputModel = z.object({ id: z.string() });

export const getSubmissionsByFormIdInputModel = z.object({
  formId: z.string().uuid(),
});

export const getSubmissionsByFormIdOutputModel = z.array(
  z.object({
    id: z.string(),
    formId: z.string(),
    values: z.array(
      z.object({
        formFieldId: z.string(),
        value: z.string(),
      }),
    ),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
  }),
);
