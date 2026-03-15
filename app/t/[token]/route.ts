import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  createAccessToken,
  getSessionTtlMinutes,
  readAccessToken
} from "@/lib/access";
import { getTeamRouteSlug } from "@/lib/team-route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const payload = await readAccessToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL("/?e=invalid-token", request.url));
  }

  const sessionTtlMinutes = getSessionTtlMinutes();
  const sessionToken = await createAccessToken(payload.team, sessionTtlMinutes);
  const response = NextResponse.redirect(
    new URL(`/team/${getTeamRouteSlug(payload.team)}`, request.url)
  );

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionTtlMinutes * 60
  });

  return response;
}
