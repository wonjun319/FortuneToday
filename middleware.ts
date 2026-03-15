import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME, readAccessToken } from "@/lib/access";
import { getTeamFromRouteSlug } from "@/lib/team-route";

export async function middleware(request: NextRequest) {
  const routeSlug = request.nextUrl.pathname.split("/")[2]?.toLowerCase();
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const team = routeSlug ? getTeamFromRouteSlug(routeSlug) : null;

  if (!team || !token) {
    return redirectToHome(request);
  }

  const payload = await readAccessToken(token);

  if (!payload || payload.team !== team) {
    return redirectToHome(request);
  }

  return NextResponse.next();
}

function redirectToHome(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("e", "unauthorized");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/team/:path*"]
};
