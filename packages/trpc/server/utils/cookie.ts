import type { CookieOptions, Response, Request } from "express";
import { trpcContext } from "../context";

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_MONTH = 30 * ONE_DAY;
const ONE_YEAR = 12 * ONE_MONTH;

const isProduction = ["production", "prod"].includes(process.env.NODE_ENV ?? "");

const defaultCookieOption: CookieOptions = {
  path: "/",
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: ONE_YEAR,
};

//how to enable cookie in trpc context
export function createCookieFactory(res: Response) {
  return function createCookie(
    name: string,
    value: string,
    opts: CookieOptions = defaultCookieOption,
  ) {
    res.cookie(name, value, opts);
  };
}
//what we have done that create cookie factory se jo function return ho ga na wo ham apne procedures ko de denge

export function getCookieFactory(req: Request) {
  return function getCookie(name: string) {
    return req.cookies?.[name];
  };
}
export function clearCookieFactory(res: Response) {
  return function clearCookie(name: string) {
    res.clearCookie(name, defaultCookieOption);
  };
}

//Authentication cookie
const AUTHENTICATION_COOKIE_NAME = "authentication_token";

export function setAuthenticationCookie(ctx: trpcContext, accessToken: string) {
  ctx.createCookie(AUTHENTICATION_COOKIE_NAME, accessToken);
}
export function getAuthenticationCookie(ctx: trpcContext) {
  return ctx.getCookie(AUTHENTICATION_COOKIE_NAME);
}
export function clearAuthenticationCookie(ctx: trpcContext) {
  ctx.clearCookie(AUTHENTICATION_COOKIE_NAME);
}
