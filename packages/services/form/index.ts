import { db } from "@repo/database";
import { formsTable } from "@repo/database/models/form";

import { createFormInput, type CreateFormInputType } from "./model";

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
}

export default FormService;
