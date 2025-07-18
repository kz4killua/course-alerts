"use client"

import { useAuth } from "@/providers/auth-provider";
import { Login } from "@/components/auth/login";
import { DrawerDialog } from "@/components/shared/drawer-dialog";
import { useState, useEffect } from "react";
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
  const { user } = useAuth()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user) {
      setTimeout(() => {
        setLoaded(true)
      }, 2500);
    } else {
      setOpen(false)
    }
  }, [user])

  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
      {
        loaded ? (
          <Login onLogin={() => {}} />
        ) : (
          <LoadingDialogContent />
        )
      }
    </DrawerDialog>
  );
}