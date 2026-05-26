// This file will contain the input and output models for the authentication related procedures. These models will be used in the trpc router for authentication.

import { z } from "zod";

// User creation
//Input
export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().describe("Name of the user"),
  email: z.string().describe("Email of the user"),
  password: z.string().describe("Password of the user"),
});
//Output
export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user"),
});
//

// Sign in user
//Input
export const signInUserWithEmailAndPasswordInputModel = z.object({
  email: z.string().describe("Email of the user"),
  password: z.string().describe("Password of the user"),
});
//Output
export const signInUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user"),
});

//Fetch user info
//Input
export const getLoggedInUserInfoInput = z.undefined();
//Output
export const getLoggedInUserInfoOutput = z.object({
  id: z.string().describe("id of the user"),
  email: z.string().describe("Email of the user"),
  fullName: z.string().describe("Name of the user"),
  profileImageUrl: z.string().describe,
});
//
