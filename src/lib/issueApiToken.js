// Server-only helper — mints a short-lived Express-native JWT for a
// Customer id, right after NextAuth's jwt callback resolves who signed in.
// The frontend attaches this as `Authorization: Bearer` on every call to
// sehat-potli-backend (cart/orders/mobile verification), since that API
// can no longer read a same-origin login cookie once NextAuth owns login.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

export async function issueApiToken(customerId) {
  const res = await fetch(`${API_BASE}/auth/internal/issue-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": INTERNAL_SECRET,
    },
    body: JSON.stringify({ customerId }),
  });

  if (!res.ok) {
    throw new Error(`issueApiToken failed (${res.status})`);
  }

  const json = await res.json();
  return json.data; // { token, expiresInSeconds }
}
