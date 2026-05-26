import { db, desc, eq, asc } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formsFieldsTable } from "@repo/database/models/form-field";

import {
  createFormInput,
  listFormsByUserIdInput,
  type CreateFormInputType,
  type ListFormsByUserIdInputType,
  createFieldInput,
  updateFieldInput,
  deleteFieldInput,
  getFieldsInput,
  type CreateFieldInputType,
  type UpdateFieldInputType,
  type DeleteFieldInputType,
  type GetFieldsInputType,
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
      placeholder: parsed.placeholder ?? null,
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
        placeholder: formsFieldsTable.placeholder,
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
    const {
      id,
      fieldDisplayText,
      fieldKey,
      placeholder,
      isRequired,
      type,
      index,
      description,
    } = parsedUpdate;

    type FieldUpdate = Partial<InferModel<typeof formsFieldsTable, "insert">>;
    const updates: FieldUpdate = {};

    if (fieldDisplayText !== undefined) updates.fieldLabel = fieldDisplayText;
    if (fieldKey !== undefined) updates.fieldKey = fieldKey;
    if (placeholder !== undefined) updates.placeholder = placeholder;
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
}

export default FormService;
