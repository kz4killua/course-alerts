"use client"

import { useUser } from "@/hooks/use-user";
import { LoginDialog } from "@/components/auth/login-dialog";


export function LoginRequired({ 
  children 
} : Readonly<{ 
  children: React.ReactNode 
}>) {
  const { data: user } = useUser(); 
  if (user) {
    return <>{children}</>;
  }
  // Note: Loading states are handled within the LoginDialog
  return <LoginDialog />;
}
