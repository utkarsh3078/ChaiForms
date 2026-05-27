import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";
import { getAuthenticationCookie } from "./utils/cookie";
import { userService } from "./services";
export const tRPCContext = initTRPC.meta<OpenApiMeta>().context<typeof createContext>().create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

//Used by only authenticated users. It checks if the user is authenticated by verifying the authentication cookie. If the user is authenticated, it adds the user information to the context and allows the procedure to execute. If the user is not authenticated, it throws an error.
export const authenticatedProcedure = tRPCContext.procedure.use(async (options) => {
  const { ctx } = options;

  const userToken = getAuthenticationCookie(ctx);
  if (!userToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User is not authenticated",
    });
  }

  const { id } = await userService.verifyAndDecodeUserToken(userToken);

  return options.next({
    ctx: {
      ...ctx,
      user: { id },
    },
  });
});
