import { z } from "zod";

export const createUserWithEmailAndPasswordInput = z.object({
  fullName: z.string().describe("Full name of the user"),
  email: z.string().describe("Email of the user"),
  password: z.string().describe("Password of the user"),
});

export type CreateUserWithEmailAndPasswordInputType = z.infer<
  typeof createUserWithEmailAndPasswordInput
>;

export const getAuthenticationMethodOutputSchema = z.object({
  provider: z.enum(["GOOGLE_OAUTH"]),
  displayName: z.string().optional(),
  displayText: z.string().optional(),
  authUrl: z.string(),
});
export type GetAuthenticationMethodOutputSchema = z.infer<
  typeof getAuthenticationMethodOutputSchema
>;

//token model
export const generateUserTokenPayload = z.object({
  id: z.string().describe("User id"),
});
export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>;
