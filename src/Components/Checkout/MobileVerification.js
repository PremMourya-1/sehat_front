"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { mobileApi } from "@/Service/api";
import Button from "@/Components/Button/Button";
import FloatingLabelInput from "@/Components/Form/FloatingLabelInput";

// Checkout-time mobile OTP verification — required once per account.
// Sits in front of the checkout form (see checkout/page.js) until
// session.user.mobileVerified is true, then never asked again.
export default function MobileVerification() {
  const { update } = useSession();
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      const res = await mobileApi.sendOtp(mobileNumber);
      if (res.data.action) {
        setOtpSent(true);
        toast.success("OTP sent to your mobile number");
      } else {
        toast.error(res.data.message || "Could not send OTP");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not send OTP");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setVerifying(true);
    try {
      const res = await mobileApi.verifyOtp(mobileNumber, otp);
      if (res.data.action) {
        toast.success("Mobile number verified");
        await update({ mobileNumber: res.data.data.mobileNumber, mobileVerified: true });
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
    <div className="rounded-2xl border border-(--border-color) bg-(--surface) p-6">
      <h2 className="font-heading text-xl text-(--primary)">Verify Your Mobile Number</h2>
      <p className="mt-1 text-sm text-(--secondary-text)">
        We need a verified mobile number before you can place an order — this
        is only asked once.
      </p>

      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="mt-4 flex flex-col gap-4 sm:flex-row">
          <FloatingLabelInput
            id="mobile-number"
            type="tel"
            required
            label="10-digit mobile number"
            pattern="[0-9]{10}"
            title="Enter a 10-digit mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            wrapperClassName="flex-1"
          />
          <Button type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="mt-4 flex flex-col gap-4 sm:flex-row">
          <FloatingLabelInput
            id="mobile-otp"
            type="text"
            required
            inputMode="numeric"
            maxLength={6}
            label="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            center
            wrapperClassName="flex-1"
          />
          <Button type="submit" disabled={verifying}>
            {verifying ? "Verifying..." : "Verify"}
          </Button>
        </form>
      )}
      {otpSent && (
        <button
          type="button"
          onClick={() => setOtpSent(false)}
          className="mt-3 text-sm font-medium text-(--primary) underline"
        >
          Change mobile number
        </button>
      )}
    </div>
  );
}
