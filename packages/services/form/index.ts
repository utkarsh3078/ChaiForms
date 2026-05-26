import { db, desc, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";

import {
  createFormInput,
  listFormsByUserIdInput,
  type CreateFormInputType,
  type ListFormsByUserIdInputType,
} from "./model";

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
