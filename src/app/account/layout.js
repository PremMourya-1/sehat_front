"use client";

import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { openAuthModal } from "@/Store/Slices/uiSlice";
import AccountSidebar from "@/Components/Account/AccountSidebar";
import Button from "@/Components/Button/Button";
import Loader from "@/Components/Common/Loader/Loader";

export default function AccountLayout({ children }) {
  const dispatch = useDispatch();
  const { status } = useSession();

  if (status === "loading") return <Loader fullScreen />;

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-2xl text-(--primary)">
          Login to View Your Account
        </h1>
        <p className="text-(--secondary-text)">
          Track orders, manage your profile, and more once you&apos;re signed in.
        </p>
        <Button onClick={() => dispatch(openAuthModal({ view: "login" }))}>
          Login / Register
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        <AccountSidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}
