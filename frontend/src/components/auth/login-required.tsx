"use client"

import { useAuth } from "@/providers/auth-provider";
import { LoginDialogContent } from "@/components/auth/login-dialog-content";
import { DrawerDialog } from "@/components/shared/drawer-dialog";
import { useState } from "react";
import { LoadingDialogContent } from "@/components/shared/loading-dialog-content";


export function LoginRequired({ 
  children 
} : Readonly<{ 
  children: React.ReactNode 
}>) {
  
  const { user } = useAuth();
  if (!user) {
    return <LoginDialog />;
  }
  return <>{children}</>;
}


function LoginDialog() {

  const [open, setOpen] = useState(true)
  const { loading } = useAuth()

  return (
    <DrawerDialog open={open} onOpenChange={setOpen} isDismissible={false}>
      {
        loading ? (
          <LoadingDialogContent />
        ) : (
          <LoginDialogContent onLogin={() => setOpen(false)} />
        )
      }
    </DrawerDialog>
  );
}