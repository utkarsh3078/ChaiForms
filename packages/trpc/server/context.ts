import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { clearCookieFactory, createCookieFactory, getCookieFactory } from "./utils/cookie";

export interface TRPCCtxUser {
  id: string;
}

export interface trpcContext {
  createCookie: ReturnType<typeof createCookieFactory>;
  getCookie: ReturnType<typeof getCookieFactory>;
  clearCookie: ReturnType<typeof clearCookieFactory>;

  user?: TRPCCtxUser;
}
export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<trpcContext> {
  const ctx: trpcContext = {
    createCookie: createCookieFactory(res),
    getCookie: getCookieFactory(req),
    clearCookie: clearCookieFactory(res),

    user: undefined,
  };

  return ctx;
}
export type Context = Awaited<ReturnType<typeof createContext>>;
