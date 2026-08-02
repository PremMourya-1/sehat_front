"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { setCurrentSession } from "@/Service/sessionBridge";

function SessionBridgeSync() {
  const { data: session } = useSession();

  useEffect(() => {
    setCurrentSession(session);
  }, [session]);

  return null;
}

export default function AuthSessionProvider({ children }) {
  return (
    <SessionProvider>
      <SessionBridgeSync />
      {children}
    </SessionProvider>
  );
}
