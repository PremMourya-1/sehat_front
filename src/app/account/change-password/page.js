"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "@/Service/api";
import Button from "@/Components/Button/Button";

const initialForm = { oldPassword: "", newPassword: "", confirmPassword: "" };

export default function ChangePasswordPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      if (res.data.action) {
        toast.success(res.data.message || "Password changed successfully");
        setForm(initialForm);
      } else {
        toast.error(res.data.message || "Could not change password");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--surface) p-6">
      <h1 className="font-heading text-2xl text-(--primary)">Change Password</h1>
      <p className="mt-1 text-sm text-(--secondary-text)">
        Keep your account secure with a strong password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-sm flex-col gap-4">
        <input
          type="password"
          required
          placeholder="Current password"
          value={form.oldPassword}
          onChange={handleChange("oldPassword")}
          className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
        />
        <input
          type="password"
          required
          placeholder="New password"
          value={form.newPassword}
          onChange={handleChange("newPassword")}
          className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
        />
        <input
          type="password"
          required
          placeholder="Confirm new password"
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
          className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
        />
        <Button type="submit" disabled={loading} className="w-fit">
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
