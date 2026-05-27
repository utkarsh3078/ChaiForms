import { NextResponse } from "next/server";

const AUTHENTICATION_COOKIE_NAME = "authentication_token";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: AUTHENTICATION_COOKIE_NAME,
    value: "",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
