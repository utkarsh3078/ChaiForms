import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 60 }).notNull(),
  description: varchar("description", { length: 500 }),

  createdBy: uuid("created_by").references(() => usersTable.id),
  expiryTime: timestamp("expiry_time").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
