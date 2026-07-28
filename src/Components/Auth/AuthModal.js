"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { authApi } from "@/Service/api";
import { loginAction } from "@/Store/Slices/authSlice";
import {
  closeAuthModal,
  selectAuthModalOpen,
  selectAuthModalView,
  selectPendingEmailForOtp,
  selectRedirectAfterAuth,
  setAuthModalView,
} from "@/Store/Slices/uiSlice";
import { AUTH_VIEWS, USER_DETAILS } from "@/Constant/Constant";
import { setLocalStorageItem } from "@/Utils/localStorage";
import Button from "@/Components/Button/Button";

const RESEND_COOLDOWN = 60;

const initialLoginForm = { email: "", password: "" };
const initialRegisterForm = { name: "", email: "", mobile: "", password: "" };

export default function AuthModal() {
  const dispatch = useDispatch();
  const router = useRouter();
  const isOpen = useSelector(selectAuthModalOpen);
  const view = useSelector(selectAuthModalView);
  const redirectTo = useSelector(selectRedirectAfterAuth);
  const pendingEmail = useSelector(selectPendingEmailForOtp);

  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setLoginForm(initialLoginForm);
      setRegisterForm(initialRegisterForm);
      setOtp("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (pendingEmail) setOtpEmail(pendingEmail);
  }, [pendingEmail]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (view === AUTH_VIEWS.OTP) setCooldown(RESEND_COOLDOWN);
  }, [view]);

  if (!isOpen) return null;

  const completeAuth = (user) => {
    setLocalStorageItem(USER_DETAILS, user);
    dispatch(loginAction(user));
    dispatch(closeAuthModal());
    toast.success("Welcome back!");
    router.push(redirectTo || "/account");
  };

  const handleClose = () => dispatch(closeAuthModal());

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(loginForm);
      if (res.data.action) {
        completeAuth(res.data.data);
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 403) {
        // Account exists but is not OTP-verified yet — trigger a fresh OTP
        // and drop the user into the verify view.
        setOtpEmail(loginForm.email);
        try {
          await authApi.resendOtp({ email: loginForm.email });
          toast("Please verify your account. We've sent a new OTP.");
        } catch {
          toast.error("Could not send OTP. Please try again.");
        }
        dispatch(setAuthModalView(AUTH_VIEWS.OTP));
      } else {
        toast.error(error?.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register(registerForm);
      if (res.data.action) {
        setOtpEmail(registerForm.email);
        toast.success(res.data.message || "OTP sent to your email");
        dispatch(setAuthModalView(AUTH_VIEWS.OTP));
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ email: otpEmail, otp });
      if (res.data.action) {
        completeAuth(res.data.data);
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    try {
      await authApi.resendOtp({ email: otpEmail });
      toast.success("OTP resent");
      setCooldown(RESEND_COOLDOWN);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not resend OTP");
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

        {view === AUTH_VIEWS.LOGIN && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <h2 className="font-heading text-2xl text-(--primary)">Welcome Back</h2>
            <p className="text-sm text-(--secondary-text)">
              Login to continue to your Sehat Potli account.
            </p>
            <input
              type="email"
              required
              placeholder="Email address"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Please wait..." : "Login"}
            </Button>
            <p className="text-center text-sm text-(--secondary-text)">
              New to Sehat Potli?{" "}
              <button
                type="button"
                onClick={() => dispatch(setAuthModalView(AUTH_VIEWS.REGISTER))}
                className="font-medium text-(--primary) underline"
              >
                Create an account
              </button>
            </p>
          </form>
        )}

        {view === AUTH_VIEWS.REGISTER && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <h2 className="font-heading text-2xl text-(--primary)">Create Account</h2>
            <p className="text-sm text-(--secondary-text)">
              Join Sehat Potli for a healthier, tastier everyday.
            </p>
            <input
              type="text"
              required
              placeholder="Full name"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
            />
            <input
              type="email"
              required
              placeholder="Email address"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
            />
            <input
              type="tel"
              required
              placeholder="Mobile number"
              pattern="[0-9]{10}"
              title="Enter a 10-digit mobile number"
              value={registerForm.mobile}
              onChange={(e) => setRegisterForm({ ...registerForm, mobile: e.target.value })}
              className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Please wait..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-(--secondary-text)">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => dispatch(setAuthModalView(AUTH_VIEWS.LOGIN))}
                className="font-medium text-(--primary) underline"
              >
                Login
              </button>
            </p>
          </form>
        )}

        {view === AUTH_VIEWS.OTP && (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <h2 className="font-heading text-2xl text-(--primary)">Verify OTP</h2>
            <p className="text-sm text-(--secondary-text)">
              We&apos;ve sent a 6-digit code to <strong>{otpEmail}</strong>.
            </p>
            <input
              type="text"
              required
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="tracking-[0.5em] rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-center text-lg outline-none focus:border-(--primary)"
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Verifying..." : "Verify & Continue"}
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
        )}
      </div>
    </div>
  );
}
