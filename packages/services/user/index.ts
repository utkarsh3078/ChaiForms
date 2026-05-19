import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { randomBytes, createHmac } from "node:crypto";
import {
  type CreateUserWithEmailAndPasswordInputType,
  createUserWithEmailAndPasswordInput,
} from "./model";
import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import { GetAuthenticationMethodOutputSchema } from "./model";

class UserService {
  private async getUsersByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) return null;
    return result[0];
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    const { fullName, email, password } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    //Check if user with the same email already exists
    const existingUserwithEmail = await this.getUsersByEmail(email);
    if (existingUserwithEmail)
      throw new Error(`user with email: ${email} already exists pls sign in`);

    //Generate salt and hash the password
    const salt = randomBytes(16).toString("hex");
    const hash = createHmac("sha256", salt).update(password).digest("hex");

    //Insert the user in the database and return the user id
    const userInserResult = await db
      .insert(usersTable)
      .values({ email, fullName, salt, password: hash })
      .returning({
        id: usersTable.id,
      });

    if (!userInserResult || userInserResult.length === 0)
      throw new Error("Something went wrong while creating the user");

    //Return the user id and in {} so that we can add more fields in the future if needed without breaking the existing code
    return {
      id: userInserResult[0]?.id,
    };
  }

  //

  public async getAuthenticationMethods(): Promise<
    ReadonlyArray<GetAuthenticationMethodOutputSchema>
  > {
    const supportedAuthenticationProviders: GetAuthenticationMethodOutputSchema[] = [];

    const isGoogleConfigured = !!googleOAuth2Client;

    if (isGoogleConfigured && googleOAuth2Client) {
      const url = googleOAuth2Client.generateAuthUrl();
      supportedAuthenticationProviders.push({
        provider: "GOOGLE_OAUTH",
        displayName: "Google",
        displayText: "Signin with Google",
        authUrl: url,
      });
    }

    return supportedAuthenticationProviders;
  }
}

export default UserService;
