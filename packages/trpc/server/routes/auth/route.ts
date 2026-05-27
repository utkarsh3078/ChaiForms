//Write Procedures for authentication related operations like sign up, sign in, sign out etc. in this file. These procedures will be used in the trpc router for authentication.

import { userService } from "../../services";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import {
  clearAuthenticationCookie,
  getAuthenticationCookie,
  setAuthenticationCookie,
} from "../../utils/cookie";
import { generatePath } from "../../utils/path-generator";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  signInUserWithEmailAndPasswordInputModel,
  signInUserWithEmailAndPasswordOutputModel,
  signOutUserInputModel,
  signOutUserOutputModel,
  getLoggedInUserInfoInput,
  getLoggedInUserInfoOutput,
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  //We are making procedures

  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { fullName, email, password } = input;
      const { id, token } = await userService.createUserWithEmailAndPassword({
        fullName,
        email,
        password,
      });

      setAuthenticationCookie(ctx, token);

      return {
        id,
      };
    }),

  signInUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signInWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(signInUserWithEmailAndPasswordInputModel)
    .output(signInUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const { id, token } = await userService.signInWithEmailAndPassword({ email, password });
      setAuthenticationCookie(ctx, token);
      return {
        id,
      };
    }),

  signOutUser: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signOutUser"),
        tags: TAGS,
      },
    })
    .input(signOutUserInputModel)
    .output(signOutUserOutputModel)
    .mutation(async ({ ctx }) => {
      await clearAuthenticationCookie(ctx);

      return {
        success: true,
      };
    }),

  getLoggedInUserInfo: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/getLoggedInUserInfo"),
        tags: TAGS,
      },
    })
    .input(getLoggedInUserInfoInput)
    .output(getLoggedInUserInfoOutput)
    .query(async ({ ctx }) => {
      const { id, email, fullName, profileImageUrl } = await userService.getUserInfoById(
        ctx.user.id,
      );
      return {
        id,
        email,
        fullName,
        profileImageUrl,
      };
    }),
});
