import { NextResponse } from "next/server";
import { signIn } from "@/auth";

// GET /api/impersonate?token=... — the landing page a new tab opened from
// the admin panel's "Login as Customer" button points at. `token` is the
// short-lived ticket sehat-potli-backend's POST
// /api/admin/customers/:id/impersonate already generated and audit-logged;
// this route's only job is to hand it to the "impersonation" NextAuth
// provider (see src/auth.js) so the SAME jwt/session callbacks a real login
// goes through mint a genuine customer session here too — never a
// separate "admin preview" mode.
//
// signIn() with its default redirect:true throws a Next.js redirect
// (a thrown NEXT_REDIRECT, not a real error) on success, setting the
// session cookie via next/headers along the way — that's caught and
// rethrown below so Next.js's own router still handles it. Any OTHER
// throw (an expired/already-used/tampered ticket) means the sign-in
// itself failed, so it's a real error worth handling: send the admin to
// the storefront home instead of a bare stack trace.
export async function GET(request) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/", request.url));

  try {
    await signIn("impersonation", { token, redirectTo: "/account" });
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unreachable in practice — signIn() above always either redirects
  // (thrown, caught above) or throws on failure (also caught above) — but
  // every code path through a route handler needs a return.
  return NextResponse.redirect(new URL("/", request.url));
}
