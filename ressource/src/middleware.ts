import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isStaffRole } from "@/lib/auth/roles";

type AuthSession = {
  user?: {
    role_id?: string | null;
  };
} | null;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionResponse = await fetch(
    new URL("/api/auth/get-session", request.url),
    {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    },
  );

  const session = sessionResponse.ok
    ? ((await sessionResponse.json()) as AuthSession)
    : null;

  if (
    pathname.startsWith("/tableau-de-bord") ||
    pathname.startsWith("/mes-ressources/creer") ||
    pathname.startsWith("/sessions")
  ) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/connexion", request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/connexion", request.url));
    }

    if (!isStaffRole(session.user.role_id)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
