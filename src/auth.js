import NextAuth from "next-auth";
import { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
// Email(Resend) magic-link provider — still commented out per request
// (password + email-OTP + Google is the active set). Re-enable by
// uncommenting this import and the "resend" entry in the providers array
// below.
// import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { authAdapter, verifyCredentials } from "@/lib/authAdapter";
import { issueApiToken } from "@/lib/issueApiToken";

const API_TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000; // re-mint 5 min before expiry

// function magicLinkEmailHtml(url) {
//   return `
//     <div style="font-family: Poppins, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #F5EDE0; border-radius: 12px;">
//       <h2 style="color: #2E4A3B; font-family: 'Playfair Display', serif; margin-bottom: 4px;">Sehat Potli</h2>
//       <p style="color: #5C4033; font-style: italic; margin-top: 0;">Pure. Natural. Wholesome.</p>
//       <p style="color: #2A2A28; font-size: 15px;">Click the button below to sign in to your Sehat Potli account:</p>
//       <div style="text-align: center; margin: 24px 0;">
//         <a href="${url}" style="display: inline-block; background: #2E4A3B; color: #FFFDF8; font-weight: 600; padding: 12px 32px; border-radius: 999px; text-decoration: none;">
//           Sign in
//         </a>
//       </div>
//       <p style="color: #2A2A28; font-size: 13px;">This link is valid for a short time and can only be used once. If you did not request this, please ignore this email.</p>
//       <p style="color: #C89B3C; font-size: 13px; margin-top: 24px;">Team Sehat Potli</p>
//     </div>
//   `;
// }

// Thrown from Credentials' authorize() when the account exists and the
// password matches, but the registration email-OTP was never completed.
// `.code` surfaces on the client as `signIn(...).code`, so AuthModal can
// show a targeted "please verify your email" message instead of a generic
// invalid-credentials error.
class EmailNotVerifiedError extends CredentialsSignin {
  code = "email-not-verified";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: authAdapter,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  events: {
    // Auth.js's own core (see @auth/core handle-login.js) always creates a
    // brand-new OAuth/magic-link user with emailVerified: null, regardless
    // of what the provider's profile actually claims — there's no way to
    // override that from the provider config itself (it spreads the
    // profile, then unconditionally sets emailVerified: null after). Google
    // requires verified email ownership to have an account at all, so
    // that's simply wrong for a Google sign-up — correct it immediately
    // after creation via our own adapter, before the customer's first
    // session is issued. Runs after any OAuth/email-provider createUser
    // (only Google today), never after the "credentials" provider — that
    // one never calls adapter.createUser(), it only reads an
    // already-existing Customer via verifyCredentials().
    async createUser({ user }) {
      await authAdapter.updateUser({ id: user.id, emailVerified: new Date() });
    },
  },
  providers: [
    // Only registered once real credentials exist — same "safe to leave
    // unconfigured" convention as the backend's third-party integrations
    // (Shiprocket/Razorpay/Resend) — so a fresh clone or an env without
    // Google Cloud OAuth set up yet still boots fine; the "Continue with
    // Google" button just won't be wired to anything until this is set.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // Safe here: Google verifies email ownership itself, so linking a
            // Google sign-in to an existing account with the same email is
            // correct, not "dangerous".
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    // Resend({
    //   id: "email",
    //   apiKey: process.env.RESEND_API_KEY,
    //   from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    //   async sendVerificationRequest({ identifier: to, url, provider }) {
    //     const res = await fetch("https://api.resend.com/emails", {
    //       method: "POST",
    //       headers: {
    //         Authorization: `Bearer ${provider.apiKey}`,
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         from: provider.from,
    //         to,
    //         subject: "Sign in to Sehat Potli",
    //         html: magicLinkEmailHtml(url),
    //       }),
    //     });
    //     if (!res.ok) {
    //       const body = await res.text().catch(() => "");
    //       throw new Error(`Resend error: ${body}`);
    //     }
    //   },
    // }),
    // Email/mobile + password login. Registration (name/email/password +
    // 6-digit email OTP) happens via plain REST calls to the backend
    // (mobileApi-style — see Service/api.js's customerAuthApi); this
    // provider only handles the actual sign-in afterward.
    Credentials({
      id: "credentials",
      name: "Password",
      credentials: {
        identifier: { label: "Email or mobile number", type: "text" },
        authCode: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const result = await verifyCredentials({
          identifier: credentials?.identifier,
          authCode: credentials?.authCode,
        });

        if (result.status === "unverified") {
          throw new EmailNotVerifiedError();
        }
        if (result.status !== "ok") {
          return null;
        }
        return result.user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.mobileNumber = user.mobileNumber;
        token.mobileVerified = user.mobileVerified;

        const { token: apiToken, expiresInSeconds } = await issueApiToken(user.id);
        token.apiToken = apiToken;
        token.apiTokenExpiresAt = Date.now() + expiresInSeconds * 1000;
        return token;
      }

      if (trigger === "update" && session) {
        if (session.mobileNumber !== undefined) token.mobileNumber = session.mobileNumber;
        if (session.mobileVerified !== undefined) token.mobileVerified = session.mobileVerified;
        return token;
      }

      const nearExpiry =
        token.apiTokenExpiresAt && Date.now() > token.apiTokenExpiresAt - API_TOKEN_REFRESH_MARGIN_MS;
      if (nearExpiry && token.id) {
        const { token: apiToken, expiresInSeconds } = await issueApiToken(token.id);
        token.apiToken = apiToken;
        token.apiTokenExpiresAt = Date.now() + expiresInSeconds * 1000;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.image = token.image;
      session.user.mobileNumber = token.mobileNumber;
      session.user.mobileVerified = token.mobileVerified;
      session.apiToken = token.apiToken;
      return session;
    },
  },
});
