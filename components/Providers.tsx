"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { createContext, useContext } from "react";
import { ProgressProvider } from "./ProgressProvider";

const AuthEnabledContext = createContext(false);

export function useAuthEnabled() {
  return useContext(AuthEnabledContext);
}

function SessionProgress({ children }: { children: React.ReactNode }) {
  const { data, status } = useSession();
  return (
    <ProgressProvider signedIn={status === "authenticated"} userId={data?.user?.id}>
      {children}
    </ProgressProvider>
  );
}

export function Providers({ authEnabled, children }: { authEnabled: boolean; children: React.ReactNode }) {
  return (
    <AuthEnabledContext.Provider value={authEnabled}>
      {authEnabled ? (
        <SessionProvider>
          <SessionProgress>{children}</SessionProgress>
        </SessionProvider>
      ) : (
        <ProgressProvider signedIn={false}>{children}</ProgressProvider>
      )}
    </AuthEnabledContext.Provider>
  );
}
