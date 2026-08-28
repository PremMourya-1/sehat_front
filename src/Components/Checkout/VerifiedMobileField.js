"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FiEdit2 } from "react-icons/fi";
import { mobileApi } from "@/Service/api";
import Button from "@/Components/Button/Button";
import FloatingLabelInput from "@/Components/Form/FloatingLabelInput";

const DISABLED_FIELD_CLASS = "disabled:cursor-not-allowed disabled:opacity-50";

// Checkout's own "Phone number" field (Step 2 of checkout/page.js's
// shipping form) — distinct from Components/Checkout/MobileVerification.js,
// the full-page gate shown BEFORE checkout is reachable at all while
// mobileVerificationRequired is on and the account isn't verified yet (see
// that component for the once-per-account OTP flow).
//
// This one only changes behavior once an account IS already verified
// (session.user.mobileVerified): instead of a blank field the customer has
// to retype every order, it auto-fills the trusted number and locks it —
// no OTP needed, matching mobileVerificationController.js's contract that
// Customer.mobileNumber only ever holds an OTP-verified number. "Change
// number" unlocks it for a genuinely different number, which re-runs the
// same send-otp/verify-otp flow (POST /api/customer/mobile/*) scoped to
// that new number only; the parent's `value` (and the trusted account
// number) never changes until that OTP actually succeeds — closing this
// without finishing leaves everything exactly as it was.
//
// If the account isn't verified (verification off site-wide, or — can't
// actually happen mid-checkout since the page-level gate above would have
// caught it first, but kept safe regardless) this renders as a perfectly
// ordinary, always-editable phone field — zero behavior change from before
// this component existed.
export default function VerifiedMobileField({ value, onChange, disabled }) {
  const { data: session, update } = useSession();
  const authUser = session?.user;
  const hasVerifiedAccount = Boolean(authUser?.mobileVerified && authUser?.mobileNumber);

  const [changing, setChanging] = useState(false);
  const [draftNumber, setDraftNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Pre-fill the trusted number once, the first time it's known and the
  // field is still empty — never overwrites anything already typed there.
  useEffect(() => {
    if (hasVerifiedAccount && !value) {
      onChange(authUser.mobileNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVerifiedAccount, authUser?.mobileNumber]);

  if (!hasVerifiedAccount) {
    return (
      <FloatingLabelInput
        id="shipping-phone"
        required
        type="tel"
        label="Phone number"
        pattern="[0-9]{10}"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={DISABLED_FIELD_CLASS}
      />
    );
  }

  const startChanging = () => {
    setChanging(true);
    setDraftNumber("");
    setOtp("");
    setOtpSent(false);
  };

  const cancelChanging = () => setChanging(false);

  if (!changing) {
    return (
      <div className="flex flex-col gap-1">
        <FloatingLabelInput
          id="shipping-phone"
          required
          type="tel"
          label="Phone number"
          value={value}
          disabled
          className="disabled:cursor-not-allowed disabled:opacity-70"
        />
        <button
          type="button"
          onClick={startChanging}
          disabled={disabled}
          className={`flex w-fit items-center gap-1 text-xs font-medium text-(--primary) underline ${DISABLED_FIELD_CLASS}`}
        >
          <FiEdit2 size={11} /> Change number
        </button>
      </div>
    );
  }

  // Plain onClick handlers, not <form onSubmit> — this component is itself
  // rendered inside checkout/page.js's own outer <form onSubmit=
  // {handlePlaceOrder}>, and HTML doesn't allow a <form> nested inside
  // another <form> (React/Next.js hydration errors on it, and browsers'
  // actual submit-bubbling behavior for a nested form is undefined anyway).
  // Enter-key submission is preserved via onKeyDown on each input instead.
  const handleSendOtp = async () => {
    if (!/^[0-9]{10}$/.test(draftNumber)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setSending(true);
    try {
      const res = await mobileApi.sendOtp(draftNumber);
      if (res.data.action) {
        setOtpSent(true);
        toast.success("OTP sent to your new number");
      } else {
        toast.error(res.data.message || "Could not send OTP");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not send OTP");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    try {
      const res = await mobileApi.verifyOtp(draftNumber, otp);
      if (res.data.action) {
        toast.success("New mobile number verified");
        // Same session-update contract MobileVerification.js already uses —
        // refreshes token.mobileNumber/mobileVerified via the "update"
        // trigger in src/auth.js's jwt callback.
        await update({ mobileNumber: res.data.data.mobileNumber, mobileVerified: true });
        onChange(res.data.data.mobileNumber);
        setChanging(false);
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-(--border-color) bg-(--surface-alt) p-3">
      <p className="text-xs text-(--secondary-text)">Verify your new mobile number to use it for this order.</p>
      {!otpSent ? (
        <div className="flex gap-2">
          <FloatingLabelInput
            id="shipping-phone-change"
            type="tel"
            required
            label="New 10-digit mobile number"
            pattern="[0-9]{10}"
            value={draftNumber}
            onChange={(e) => setDraftNumber(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSendOtp())}
            wrapperClassName="flex-1"
          />
          <Button type="button" size="sm" disabled={sending} onClick={handleSendOtp}>
            {sending ? "Sending..." : "Send OTP"}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <FloatingLabelInput
            id="shipping-phone-change-otp"
            type="text"
            required
            inputMode="numeric"
            maxLength={6}
            label="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleVerifyOtp())}
            center
            wrapperClassName="flex-1"
          />
          <Button type="button" size="sm" disabled={verifying} onClick={handleVerifyOtp}>
            {verifying ? "Verifying..." : "Verify"}
          </Button>
        </div>
      )}
      <button type="button" onClick={cancelChanging} className="w-fit text-xs font-medium text-(--secondary-text) underline">
        Cancel
      </button>
    </div>
  );
}
