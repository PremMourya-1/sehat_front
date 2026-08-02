"use client";

import { useSession } from "next-auth/react";
import Loader from "@/Components/Common/Loader/Loader";

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Loader />;

  const profile = session?.user;

  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--surface) p-6">
      <h1 className="font-heading text-2xl text-(--primary)">My Account</h1>
      <p className="mt-1 text-sm text-(--secondary-text)">
        Your personal details, on file with Sehat Potli.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-(--secondary-text)">Name</p>
          <p className="mt-1 font-medium text-(--foreground)">
            {profile?.name || "--"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-(--secondary-text)">Email</p>
          <p className="mt-1 font-medium text-(--foreground)">
            {profile?.email || "--"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-(--secondary-text)">Mobile</p>
          <p className="mt-1 font-medium text-(--foreground)">
            {profile?.mobileVerified ? profile?.mobileNumber : "Not verified yet"}
          </p>
        </div>
      </div>
    </div>
  );
}
