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
