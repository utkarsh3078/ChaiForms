import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { randomBytes, createHmac } from "node:crypto";
import {
  type CreateUserWithEmailAndPasswordInputType,
  GenerateUserTokenPayloadType,
  createUserWithEmailAndPasswordInput,
  generateUserTokenPayload,
  SignInWithEmailAndPasswordInputType,
  signInWithEmailAndPasswordInput,
} from "./model";
import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import { GetAuthenticationMethodOutputSchema } from "./model";
import * as JWT from "jsonwebtoken";

class UserService {
  private async getUsersByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) return null;
    return result[0];
  }

  private async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SECRET);
    return { token };
  }

  private async generateHash(salt: string, password: string) {
    const hash = createHmac("sha256", salt).update(password).digest("hex");
    return hash;
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
    const hash = await this.generateHash(salt, password);

    //Insert the user in the database and return the user id
    const userInsertResult = await db
      .insert(usersTable)
      .values({ email, fullName, salt, password: hash })
      .returning({
        id: usersTable.id,
      });

    if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id)
      throw new Error("Something went wrong while creating the user");

    const userId = userInsertResult[0].id;
    const { token } = await this.generateUserToken({ id: userId });
    //Return the user id and in {} so that we can add more fields in the future if needed without breaking the existing code
    return {
      id: userId,
      token,
    };
  }
  public async signInWithEmailAndPassword(payload: SignInWithEmailAndPasswordInputType) {
    const { email, password } = await signInWithEmailAndPasswordInput.parseAsync(payload);
    const existingUser = await this.getUsersByEmail(email);

    if (!existingUser) throw new Error(`user with email: ${email} does not exist pls sign up`);

    if (!existingUser.salt || !existingUser.password)
      throw new Error("Invalid authentication method");

    const hash = await this.generateHash(existingUser.salt, password);
    if (hash !== existingUser.password) throw new Error("email or password is incorrect");
    const { token } = await this.generateUserToken({ id: existingUser.id });
    return {
      id: existingUser.id,
      token,
    };
  }

  // extra code

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
