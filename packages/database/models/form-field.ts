import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  PgArray,
  numeric,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";
import { number } from "zod/v4/mini";

export const fieldTypesEnum = pgEnum("field_type_enum", [
  "TEXT",
  "EMAIL",
  "NUMBER",
  "DATE",
  "YES_NO",
  "PASSWORD",
]);

export const formsFieldsTable = pgTable(
  "forms_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id),

    fieldLabel: varchar("field_display_text", { length: 255 }).notNull(),
    fieldKey: varchar("field_key", { length: 255 }).notNull(),
    placeholder: varchar("placeholder", { length: 255 }),
    isRequired: boolean("is_required").default(false).notNull(),

    type: fieldTypesEnum("type").notNull(),

    index: numeric("index", { scale: 2 }).notNull(),
    description: text("description"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueFormIdAndIndex: unique().on(table.formId, table.index),
  }),
);

// In end i mean to say is that we are creating a unique constraint on the combination of formId and index to ensure that there are no duplicate field indexes for the same form. This helps maintain the integrity of the form fields and their order within a form.

//Basically formId and index ko mila ke unique nahi honi chahiye, taki ek form ke andar same index repeat na ho.
