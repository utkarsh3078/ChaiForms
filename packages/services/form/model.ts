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
