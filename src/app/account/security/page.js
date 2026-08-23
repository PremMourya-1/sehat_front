"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiLock, FiShield } from "react-icons/fi";
import { securityApi } from "@/Service/api";
import Card from "@/Components/Card/Card";
import Button from "@/Components/Button/Button";
import Loader from "@/Components/Common/Loader/Loader";
import FloatingLabelInput from "@/Components/Form/FloatingLabelInput";

const MIN_PASSWORD_LENGTH = 6;

const initialForm = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function AccountSecurityPage() {
  const [hasPassword, setHasPassword] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    securityApi
      .getPasswordStatus()
      .then((res) => {
        if (!cancelled && res.data.action) setHasPassword(res.data.data.hasPassword);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load account security settings");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirm password don't match");
      return;
    }

    setSubmitting(true);
    try {
      const res = await securityApi.updatePassword({
        currentPassword: hasPassword ? form.currentPassword : undefined,
        newPassword: form.newPassword,
      });
      if (res.data.action) {
        toast.success(res.data.message || "Password saved successfully");
        setHasPassword(res.data.data.hasPassword);
        setForm(initialForm);
      } else {
        toast.error(res.data.message || "Could not save password");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save password");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-heading text-2xl text-(--primary)">Account Security</h1>
      <p className="mt-1 text-sm text-(--secondary-text)">
        {hasPassword
          ? "Change the password you use to log in with your email."
          : "You signed up with Google — add a password to also log in with your email, without Google."}
      </p>

      <Card className="mt-6 max-w-md">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
            {hasPassword ? <FiLock size={18} /> : <FiShield size={18} />}
          </span>
          <h2 className="font-heading text-lg text-(--primary)">
            {hasPassword ? "Change Password" : "Add Password"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {hasPassword && (
            <FloatingLabelInput
              id="security-current-password"
              type="password"
              required
              label="Current password"
              value={form.currentPassword}
              onChange={handleChange("currentPassword")}
            />
          )}
          <FloatingLabelInput
            id="security-new-password"
            type="password"
            required
            label="New password"
            value={form.newPassword}
            onChange={handleChange("newPassword")}
          />
          <FloatingLabelInput
            id="security-confirm-password"
            type="password"
            required
            label="Confirm new password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
          />
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Saving..." : hasPassword ? "Update Password" : "Add Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
