// Hand-written Auth.js Adapter — backs NextAuth's Google + Email providers
// without a Prisma/Mongo adapter, since the real database (Postgres via
// Sequelize) lives behind the separate sehat-potli-backend Express API.
// Every method here is a server-only fetch to internal-only endpoints
// under /api/auth/adapter/*, guarded by a shared secret header. Never
// import this file from a "use client" component.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

async function internalFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": INTERNAL_SECRET,
      ...options.headers,
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`authAdapter: ${path} failed (${res.status}): ${body}`);
  }
  return res.json();
}

// Every user/account/token payload coming back over JSON has Date fields
// as ISO strings — Auth.js expects real Date instances.
function reviveUser(user) {
  if (!user) return null;
  return {
    ...user,
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
  };
}

function reviveVerificationToken(vt) {
  if (!vt) return null;
  return { ...vt, expires: new Date(vt.expires) };
}

export const authAdapter = {
  async createUser(user) {
    const created = await internalFetch("/auth/adapter/users", {
      method: "POST",
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
      }),
    });
    return reviveUser(created);
  },

  async getUser(id) {
    const user = await internalFetch(`/auth/adapter/users/${id}`);
    return reviveUser(user);
  },

  async getUserByEmail(email) {
    const user = await internalFetch(`/auth/adapter/users/by-email/${encodeURIComponent(email)}`);
    return reviveUser(user);
  },

  async getUserByAccount({ provider, providerAccountId }) {
    const user = await internalFetch(
      `/auth/adapter/users/by-account?provider=${encodeURIComponent(provider)}&providerAccountId=${encodeURIComponent(providerAccountId)}`,
    );
    return reviveUser(user);
  },

  async updateUser(user) {
    const updated = await internalFetch(`/auth/adapter/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify(user),
    });
    return reviveUser(updated);
  },

  async getAccount(providerAccountId, provider) {
    return internalFetch(`/auth/adapter/accounts/${encodeURIComponent(provider)}/${encodeURIComponent(providerAccountId)}`);
  },

  async linkAccount(account) {
    await internalFetch("/auth/adapter/accounts", {
      method: "POST",
      body: JSON.stringify(account),
    });
    return account;
  },

  // Not used under session.strategy: "jwt" — no-ops kept for interface completeness.
  async unlinkAccount() {},
  async deleteUser() {},

  async createVerificationToken(verificationToken) {
    const created = await internalFetch("/auth/adapter/verification-tokens", {
      method: "POST",
      body: JSON.stringify(verificationToken),
    });
    return reviveVerificationToken(created);
  },

  async useVerificationToken({ identifier, token }) {
    const used = await internalFetch("/auth/adapter/verification-tokens/use", {
      method: "POST",
      body: JSON.stringify({ identifier, token }),
    });
    return reviveVerificationToken(used);
  },
};

// Email/mobile + password check — backs the "credentials" provider in
// src/auth.js. Returns { status: "ok", user } | { status: "invalid" } |
// { status: "unverified", email }.
export async function verifyCredentials({ identifier, authCode }) {
  const result = await internalFetch("/auth/adapter/verify-credentials", {
    method: "POST",
    body: JSON.stringify({ identifier, authCode }),
  });
  if (result?.status === "ok") {
    return { status: "ok", user: reviveUser(result.user) };
  }
  return result || { status: "invalid" };
}
