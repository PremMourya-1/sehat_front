"use client";

import { useSession } from "next-auth/react";
import { FiUser } from "react-icons/fi";
import Card from "@/Components/Card/Card";
import Loader from "@/Components/Common/Loader/Loader";

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Loader />;

  const profile = session?.user;

  return (
    <Card>
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
          <FiUser size={24} />
        </span>
        <div>
          <h1 className="font-heading text-2xl text-(--primary)">My Account</h1>
          <p className="mt-0.5 text-sm text-(--secondary-text)">
            Your personal details, on file with Sehat Potli.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-(--border-color) pt-6 sm:grid-cols-2">
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
    </Card>
  );
}
