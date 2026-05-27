import { z } from "zod";

export const createFormInput = z.object({
  title: z.string().max(60).describe("Title of the form"),
  description: z.string().max(500).optional().describe("Description of the form"),
  expiryTime: z.coerce.date().describe("Expiry time of the form"),
  expiryDate: z.coerce.date().describe("Expiry date of the form"),
  createdBy: z.string().describe("ID of the user who created the form"),
});
export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormsByUserIdInput = z.object({
  userId: z.string().describe("ID of the user whose forms should be listed"),
});
export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>;

export const getFormByIdInput = z.object({
  formId: z.string().uuid().describe("ID of the form to retrieve"),
});
export type GetFormByIdInputType = z.infer<typeof getFormByIdInput>;

export const fieldTypeValues = ["TEXT", "EMAIL", "NUMBER", "DATE", "YES_NO", "PASSWORD"] as const;

export const createFieldInput = z.object({
  formId: z.string().uuid().describe("ID of the form this field belongs to"),
  fieldDisplayText: z.string().max(255).describe("Display text for the field"),
  fieldKey: z.string().max(255).describe("Unique key for the field within the form"),
  isRequired: z.boolean().optional(),
  type: z.enum(fieldTypeValues).describe("Field type"),
  index: z.coerce.number().describe("Numeric index/order for the field within the form"),
  description: z.string().nullable().optional(),
});
export type CreateFieldInputType = z.infer<typeof createFieldInput>;

export const updateFieldInput = z.object({
  id: z.string().uuid().describe("ID of the field to update"),
  fieldDisplayText: z.string().max(255).optional(),
  fieldKey: z.string().max(255).optional(),
  isRequired: z.boolean().optional(),
  type: z.enum(fieldTypeValues).optional(),
  index: z.coerce.number().optional(),
  description: z.string().nullable().optional(),
});
export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;

export const deleteFieldInput = z.object({
  id: z.string().uuid().describe("ID of the field to delete"),
});
export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;

export const getFieldsInput = z.object({
  formId: z.string().uuid().describe("ID of the form to retrieve fields for"),
});
export type GetFieldsInputType = z.infer<typeof getFieldsInput>;

export const submissionValue = z.object({
  formFieldId: z.string().uuid().describe("ID of the form field"),
  value: z.string().describe("Submitted value for the field"),
});
export const createSubmissionInput = z.object({
  formId: z.string().uuid().describe("ID of the form being submitted"),
  values: z.array(submissionValue).min(1).describe("Array of submitted field values"),
});
export type CreateSubmissionInputType = z.infer<typeof createSubmissionInput>;

export const getSubmissionsByFormIdInput = z.object({
  formId: z.string().uuid().describe("ID of the form whose submissions should be listed"),
});
export type GetSubmissionsByFormIdInputType = z.infer<typeof getSubmissionsByFormIdInput>;

export const submissionRowValue = z.object({
  formFieldId: z.string(),
  value: z.string(),
});

export const getSubmissionsByFormIdOutput = z.array(
  z.object({
    id: z.string(),
    formId: z.string(),
    values: z.array(submissionRowValue),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
  }),
);
