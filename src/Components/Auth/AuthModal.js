"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiX, FiMail, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { authApi } from "@/Service/api";
import {
  closeAuthModal,
  selectAuthModalOpen,
  selectAuthModalView,
  selectRedirectAfterAuth,
  setAuthModalView,
} from "@/Store/Slices/uiSlice";
import { AUTH_VIEWS } from "@/Constant/Constant";
import Button from "@/Components/Button/Button";
import FloatingLabelInput from "@/Components/Form/FloatingLabelInput";

const RESEND_COOLDOWN = 60;

const initialLoginForm = { identifier: "", authCode: "" };
const initialRegisterForm = { name: "", email: "", password: "" };
const initialForgotPasswordResetForm = { otp: "", newPassword: "", confirmPassword: "" };

// Registration and the login-time "please verify your email first" case
// both land here — same OTP-entry UI, same auto-login-on-success behavior.
export default function AuthModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectAuthModalOpen);
  const view = useSelector(selectAuthModalView);
  const redirectTo = useSelector(selectRedirectAfterAuth);

  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [loading, setLoading] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [registerEmailError, setRegisterEmailError] = useState("");

  // Forgot Password — a logged-out flow (link on the Login form), distinct
  // from account-security's Change/Add Password (which requires being
  // logged in already). "email" step collects the address; "reset" step
  // collects the OTP + new password. Reuses the same `cooldown` timer as
  // registration's OTP resend above — the two flows are never on screen at
  // the same time, so one counter is enough.
  const [forgotPasswordStep, setForgotPasswordStep] = useState(null); // null | "email" | "reset"
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordResetForm, setForgotPasswordResetForm] = useState(initialForgotPasswordResetForm);
  const [forgotPasswordResetLoading, setForgotPasswordResetLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLoginForm(initialLoginForm);
      setRegisterForm(initialRegisterForm);
      setVerifying(false);
      setVerifyEmail("");
      setVerifyPassword("");
      setOtp("");
      setRegisterEmailError("");
      setForgotPasswordStep(null);
      setForgotPasswordEmail("");
      setForgotPasswordResetForm(initialForgotPasswordResetForm);
    }
  }, [isOpen]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleClose = () => dispatch(closeAuthModal());

  const callbackUrl =
    typeof window !== "undefined" ? redirectTo || window.location.pathname : redirectTo || "/";

  const startVerification = (email, password) => {
    setVerifyEmail(email);
    setVerifyPassword(password);
    setOtp("");
    setVerifying(true);
    setCooldown(RESEND_COOLDOWN);
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        identifier: loginForm.identifier,
        authCode: loginForm.authCode,
        redirect: false,
        callbackUrl,
      });

      if (res?.code === "email-not-verified") {
        // An unverified account can only ever have been matched by email
        // (mobile numbers are only ever set on already-verified accounts —
        // mobile verification happens at checkout, which requires login).
        toast("Please verify your email first — we've sent a new code.");
        startVerification(loginForm.identifier, loginForm.authCode);
        try {
          await authApi.resendOtp({ email: loginForm.identifier });
        } catch {
          // ignore — user can hit "Resend" manually below
        }
      } else if (res?.error) {
        toast.error("Invalid email/mobile number or password");
      } else {
        toast.success("Welcome back!");
        handleClose();
      }
    } catch {
      toast.error("Could not log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setRegisterEmailError("");
    setLoading(true);
    try {
      const res = await authApi.register(registerForm);
      if (res.data.action) {
        toast.success(res.data.message || "OTP sent to your email");
        startVerification(registerForm.email, registerForm.password);
      } else {
        // The domain-deliverability check (see authController.js) is the
        // one failure specific enough to the email field to also show
        // inline, right where the customer is looking — every other
        // registration error still only needs the toast.
        if (res.data.message === "This email address doesn't appear to be valid") {
          setRegisterEmailError(res.data.message);
        }
        toast.error(res.data.message || "Registration failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setOtpLoading(true);
    try {
      const res = await authApi.verifyOtp({ email: verifyEmail, otp });
      if (!res.data.action) {
        toast.error(res.data.message || "Invalid OTP");
        return;
      }

      const signInRes = await signIn("credentials", {
        identifier: verifyEmail,
        authCode: verifyPassword,
        redirect: false,
        callbackUrl,
      });

      if (signInRes?.error) {
        toast.success("Email verified! Please log in.");
        setVerifying(false);
        dispatch(setAuthModalView(AUTH_VIEWS.LOGIN));
      } else {
        toast.success("You're all set!");
        handleClose();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // Full-page redirect flow (Google's own consent screen, then back to
  // callbackUrl) — no inline toast/error handling like the credentials form
  // above, since control leaves the app entirely until the redirect back.
  // Works identically whether this is the customer's first-ever sign-in
  // (auto-creates a Customer, see the "createUser" event in src/auth.js) or
  // a returning one (including one that originally registered via the
  // email+OTP form — NextAuth links by matching email, doesn't duplicate).
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    try {
      await authApi.resendOtp({ email: verifyEmail });
      toast.success("OTP resent");
      setCooldown(RESEND_COOLDOWN);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not resend OTP");
    }
  };

  const handleForgotPasswordEmailSubmit = async (event) => {
    event.preventDefault();
    setForgotPasswordLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: forgotPasswordEmail });
      if (res.data.action) {
        toast.success(res.data.message || "A reset code has been sent to your email");
        setForgotPasswordResetForm(initialForgotPasswordResetForm);
        setForgotPasswordStep("reset");
        setCooldown(RESEND_COOLDOWN);
      } else {
        toast.error(res.data.message || "Could not send reset code");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not send reset code");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Same endpoint as the initial send (see authController.js forgotPassword)
  // — it doubles as its own resend, cooldown-gated server-side too.
  const handleForgotPasswordResend = async () => {
    if (cooldown > 0) return;
    try {
      await authApi.forgotPassword({ email: forgotPasswordEmail });
      toast.success("Reset code resent");
      setCooldown(RESEND_COOLDOWN);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not resend reset code");
    }
  };

  const handleForgotPasswordResetSubmit = async (event) => {
    event.preventDefault();
    if (forgotPasswordResetForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (forgotPasswordResetForm.newPassword !== forgotPasswordResetForm.confirmPassword) {
      toast.error("New password and confirm password don't match");
      return;
    }

    setForgotPasswordResetLoading(true);
    try {
      const res = await authApi.resetPassword({
        email: forgotPasswordEmail,
        otp: forgotPasswordResetForm.otp,
        newPassword: forgotPasswordResetForm.newPassword,
      });
      if (res.data.action) {
        toast.success(res.data.message || "Password reset successfully. Please log in.");
        setForgotPasswordStep(null);
        setLoginForm({ identifier: forgotPasswordEmail, authCode: "" });
        dispatch(setAuthModalView(AUTH_VIEWS.LOGIN));
      } else {
        toast.error(res.data.message || "Could not reset password");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not reset password");
    } finally {
      setForgotPasswordResetLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-(--surface) p-6 shadow-xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 text-(--secondary-text) hover:text-(--foreground)"
          aria-label="Close"
        >
          <FiX size={20} />
        </button>

        {verifying ? (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 pb-2 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--background) text-(--primary)">
                <FiMail size={26} />
              </span>
              <h2 className="font-heading text-2xl text-(--primary)">Verify Your Email</h2>
              <p className="text-sm text-(--secondary-text)">
                We&apos;ve sent a 6-digit code to <strong>{verifyEmail}</strong>.
              </p>
            </div>
            <FloatingLabelInput
              id="auth-otp"
              type="text"
              required
              inputMode="numeric"
              maxLength={6}
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              center
            />
            <Button type="submit" disabled={otpLoading} className="w-full">
              {otpLoading ? "Verifying..." : "Verify & Continue"}
            </Button>
            <p className="text-center text-sm text-(--secondary-text)">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0}
                className="font-medium text-(--primary) underline disabled:cursor-not-allowed disabled:text-(--muted) disabled:no-underline"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </p>
          </form>
        ) : forgotPasswordStep === "email" ? (
          <form onSubmit={handleForgotPasswordEmailSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 pb-2 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--background) text-(--primary)">
                <FiLock size={26} />
              </span>
              <h2 className="font-heading text-2xl text-(--primary)">Reset Your Password</h2>
              <p className="text-sm text-(--secondary-text)">
                Enter your account email and we&apos;ll send you a code to reset your password.
              </p>
            </div>
            <FloatingLabelInput
              id="forgot-password-email"
              type="email"
              required
              label="Email address"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
            />
            <Button type="submit" disabled={forgotPasswordLoading} className="w-full">
              {forgotPasswordLoading ? "Sending..." : "Send Reset Code"}
            </Button>
            <button
              type="button"
              onClick={() => setForgotPasswordStep(null)}
              className="text-center text-sm font-medium text-(--primary) underline"
            >
              Back to Login
            </button>
          </form>
        ) : forgotPasswordStep === "reset" ? (
          <form onSubmit={handleForgotPasswordResetSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 pb-2 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--background) text-(--primary)">
                <FiMail size={26} />
              </span>
              <h2 className="font-heading text-2xl text-(--primary)">Enter Reset Code</h2>
              <p className="text-sm text-(--secondary-text)">
                We&apos;ve sent a 6-digit code to <strong>{forgotPasswordEmail}</strong>.
              </p>
            </div>
            <FloatingLabelInput
              id="forgot-password-otp"
              type="text"
              required
              inputMode="numeric"
              maxLength={6}
              label="Enter OTP"
              value={forgotPasswordResetForm.otp}
              onChange={(e) => setForgotPasswordResetForm({ ...forgotPasswordResetForm, otp: e.target.value })}
              center
            />
            <FloatingLabelInput
              id="forgot-password-new"
              type="password"
              required
              label="New password"
              value={forgotPasswordResetForm.newPassword}
              onChange={(e) =>
                setForgotPasswordResetForm({ ...forgotPasswordResetForm, newPassword: e.target.value })
              }
            />
            <FloatingLabelInput
              id="forgot-password-confirm"
              type="password"
              required
              label="Confirm new password"
              value={forgotPasswordResetForm.confirmPassword}
              onChange={(e) =>
                setForgotPasswordResetForm({ ...forgotPasswordResetForm, confirmPassword: e.target.value })
              }
            />
            <Button type="submit" disabled={forgotPasswordResetLoading} className="w-full">
              {forgotPasswordResetLoading ? "Resetting..." : "Reset Password"}
            </Button>
            <p className="text-center text-sm text-(--secondary-text)">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleForgotPasswordResend}
                disabled={cooldown > 0}
                className="font-medium text-(--primary) underline disabled:cursor-not-allowed disabled:text-(--muted) disabled:no-underline"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
              </button>
            </p>
            <button
              type="button"
              onClick={() => setForgotPasswordStep(null)}
              className="text-center text-sm font-medium text-(--primary) underline"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <>
            <div className="mb-5 flex rounded-full bg-(--background) p-1">
              <button
                type="button"
                onClick={() => dispatch(setAuthModalView(AUTH_VIEWS.LOGIN))}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                  view === AUTH_VIEWS.LOGIN
                    ? "bg-(--btn-primary) text-(--surface)"
                    : "text-(--secondary-text)"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => dispatch(setAuthModalView(AUTH_VIEWS.REGISTER))}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                  view === AUTH_VIEWS.REGISTER
                    ? "bg-(--btn-primary) text-(--surface)"
                    : "text-(--secondary-text)"
                }`}
              >
                Register
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-full border border-(--border-color) bg-(--surface) py-2.5 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--background) disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FcGoogle size={18} />
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-(--border-color)" />
              <span className="text-xs text-(--secondary-text)">or</span>
              <div className="h-px flex-1 bg-(--border-color)" />
            </div>

            {view === AUTH_VIEWS.LOGIN ? (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                <h2 className="font-heading text-2xl text-(--primary)">Welcome Back</h2>
                <FloatingLabelInput
                  id="login-identifier"
                  type="text"
                  required
                  label="Email or mobile number"
                  value={loginForm.identifier}
                  onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                />
                <FloatingLabelInput
                  id="login-password"
                  type="password"
                  required
                  label="Password"
                  value={loginForm.authCode}
                  onChange={(e) => setLoginForm({ ...loginForm, authCode: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordEmail(loginForm.identifier);
                    setForgotPasswordStep("email");
                  }}
                  className="-mt-2 self-end text-xs font-medium text-(--primary) underline"
                >
                  Forgot Password?
                </button>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                <h2 className="font-heading text-2xl text-(--primary)">Create Account</h2>
                <FloatingLabelInput
                  id="register-name"
                  type="text"
                  required
                  label="Full name"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                />
                <div>
                  <FloatingLabelInput
                    id="register-email"
                    type="email"
                    required
                    label="Email address"
                    value={registerForm.email}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, email: e.target.value });
                      if (registerEmailError) setRegisterEmailError("");
                    }}
                  />
                  {registerEmailError && (
                    <p className="mt-1.5 px-1 text-xs text-(--danger)">{registerEmailError}</p>
                  )}
                </div>
                <FloatingLabelInput
                  id="register-password"
                  type="password"
                  required
                  label="Password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Please wait..." : "Sign Up"}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
