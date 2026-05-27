import { db, desc, eq, asc } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formSubmissionTable } from "@repo/database/models/form-submissions";
import { formsFieldsTable } from "@repo/database/models/form-field";

import {
  createFormInput,
  getFormByIdInput,
  listFormsByUserIdInput,
  type CreateFormInputType,
  type GetFormByIdInputType,
  type ListFormsByUserIdInputType,
  createFieldInput,
  updateFieldInput,
  deleteFieldInput,
  getFieldsInput,
  type CreateFieldInputType,
  type UpdateFieldInputType,
  type DeleteFieldInputType,
  type GetFieldsInputType,
  createSubmissionInput,
  type CreateSubmissionInputType,
  getSubmissionsByFormIdInput,
  type GetSubmissionsByFormIdInputType,
} from "./model";
import type { InferModel } from "@repo/database";

class FormService {
  public async createForm(payload: CreateFormInputType) {
    const { title, description, expiryTime, expiryDate, createdBy } =
      await createFormInput.parseAsync(payload);

    const result = await db
      .insert(formsTable)
      .values({ title, description, expiryTime, expiryDate, createdBy })
      .returning({
        id: formsTable.id,
      });

    if (!result || result.length === 0 || !result[0]?.id) throw new Error("Failed to create form");

    return {
      id: result[0].id,
    };
  }

  public async createField(payload: CreateFieldInputType) {
    const parsed = await createFieldInput.parseAsync(payload);

    type FieldInsert = InferModel<typeof formsFieldsTable, "insert">;

    const insertObj: FieldInsert = {
      formId: parsed.formId,
      fieldLabel: parsed.fieldDisplayText,
      fieldKey: parsed.fieldKey,
      isRequired: parsed.isRequired ?? false,
      type: parsed.type,
      index: String(parsed.index) as FieldInsert["index"],
      description: parsed.description ?? null,
    };

    const result = await db
      .insert(formsFieldsTable)
      .values(insertObj)
      .returning({ id: formsFieldsTable.id });

    if (!result || result.length === 0 || !result[0]?.id) throw new Error("Failed to create field");

    return { id: result[0].id };
  }

  public async getFields(payload: GetFieldsInputType) {
    const { formId } = await getFieldsInput.parseAsync(payload);

    const fields = await db
      .select({
        id: formsFieldsTable.id,
        formId: formsFieldsTable.formId,
        fieldLabel: formsFieldsTable.fieldLabel,
        fieldKey: formsFieldsTable.fieldKey,
        isRequired: formsFieldsTable.isRequired,
        type: formsFieldsTable.type,
        index: formsFieldsTable.index,
        description: formsFieldsTable.description,
        createdAt: formsFieldsTable.createdAt,
        updatedAt: formsFieldsTable.updatedAt,
      })
      .from(formsFieldsTable)
      .where(eq(formsFieldsTable.formId, formId))
      .orderBy(asc(formsFieldsTable.index));

    return fields;
  }

  public async updateField(payload: UpdateFieldInputType) {
    const parsedUpdate = await updateFieldInput.parseAsync(payload);
    const { id, fieldDisplayText, fieldKey, isRequired, type, index, description } = parsedUpdate;

    type FieldUpdate = Partial<InferModel<typeof formsFieldsTable, "insert">>;
    const updates: FieldUpdate = {};

    if (fieldDisplayText !== undefined) updates.fieldLabel = fieldDisplayText;
    if (fieldKey !== undefined) updates.fieldKey = fieldKey;
    if (isRequired !== undefined) updates.isRequired = isRequired;
    if (type !== undefined) updates.type = type;
    if (index !== undefined) updates.index = String(index) as FieldUpdate["index"];
    if (description !== undefined) updates.description = description;

    if (Object.keys(updates).length === 0) throw new Error("No fields provided to update");

    const result = await db
      .update(formsFieldsTable)
      .set(updates)
      .where(eq(formsFieldsTable.id, id))
      .returning({ id: formsFieldsTable.id });

    if (!result || result.length === 0 || !result[0]?.id) throw new Error("Failed to update field");

    return { id: result[0].id };
  }

  public async deleteField(payload: DeleteFieldInputType) {
    const { id } = await deleteFieldInput.parseAsync(payload);

    const result = await db
      .delete(formsFieldsTable)
      .where(eq(formsFieldsTable.id, id))
      .returning({ id: formsFieldsTable.id });

    if (!result || result.length === 0 || !result[0]?.id) throw new Error("Failed to delete field");

    return { id: result[0].id };
  }

  public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
    const { userId } = await listFormsByUserIdInput.parseAsync(payload);

    const forms = await db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        expiryTime: formsTable.expiryTime,
        expiryDate: formsTable.expiryDate,
        createdBy: formsTable.createdBy,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
      })
      .from(formsTable)
      .where(eq(formsTable.createdBy, userId))
      .orderBy(desc(formsTable.createdAt));
    return forms;
  }

  public async getFormById(payload: GetFormByIdInputType) {
    const { formId } = await getFormByIdInput.parseAsync(payload);

    const rows = await db
      .select({
        formId: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        expiryTime: formsTable.expiryTime,
        expiryDate: formsTable.expiryDate,
        createdBy: formsTable.createdBy,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
        fieldId: formsFieldsTable.id,
        fieldFormId: formsFieldsTable.formId,
        fieldLabel: formsFieldsTable.fieldLabel,
        fieldKey: formsFieldsTable.fieldKey,
        isRequired: formsFieldsTable.isRequired,
        type: formsFieldsTable.type,
        index: formsFieldsTable.index,
        fieldDescription: formsFieldsTable.description,
        fieldCreatedAt: formsFieldsTable.createdAt,
        fieldUpdatedAt: formsFieldsTable.updatedAt,
      })
      .from(formsTable)
      .leftJoin(formsFieldsTable, eq(formsTable.id, formsFieldsTable.formId))
      .where(eq(formsTable.id, formId));

    const firstRow = rows[0];
    if (!firstRow) throw new Error("Form not found");

    const form = {
      id: firstRow.formId,
      title: firstRow.title,
      description: firstRow.description,
      expiryTime: firstRow.expiryTime,
      expiryDate: firstRow.expiryDate,
      createdBy: firstRow.createdBy,
      createdAt: firstRow.createdAt,
      updatedAt: firstRow.updatedAt,
    };

    const fields = rows
      .filter((row) => row.fieldId)
      .map((row) => ({
        id: row.fieldId as string,
        formId: row.fieldFormId as string,
        fieldLabel: row.fieldLabel as string,
        fieldKey: row.fieldKey as string,
        isRequired: row.isRequired,
        type: row.type as string,
        index: row.index as string,
        description: row.fieldDescription,
        createdAt: row.fieldCreatedAt,
        updatedAt: row.fieldUpdatedAt,
      }));

    return { form, fields };
  }

  public async createSubmission(payload: CreateSubmissionInputType) {
    const parsed = await createSubmissionInput.parseAsync(payload);

    const insertObj = {
      formId: parsed.formId,
      values: parsed.values,
    };

    const result = await db
      .insert(formSubmissionTable)
      .values(insertObj)
      .returning({ id: formSubmissionTable.id });

    if (!result || result.length === 0 || !result[0]?.id)
      throw new Error("Failed to create submission");

    return { id: result[0].id };
  }

  public async getSubmissionsByFormId(payload: GetSubmissionsByFormIdInputType) {
    const { formId } = await getSubmissionsByFormIdInput.parseAsync(payload);

    const submissions = await db
      .select({
        id: formSubmissionTable.id,
        formId: formSubmissionTable.formId,
        values: formSubmissionTable.values,
        createdAt: formSubmissionTable.createdAt,
        updatedAt: formSubmissionTable.updatedAt,
      })
      .from(formSubmissionTable)
      .where(eq(formSubmissionTable.formId, formId))
      .orderBy(desc(formSubmissionTable.createdAt));

    return submissions.map((submission) => ({
      id: submission.id,
      formId: submission.formId ?? formId,
      values: submission.values,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    }));
  }
}

export default FormService;
