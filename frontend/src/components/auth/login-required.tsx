"use client"

import { useAuth } from "@/providers/auth-provider";
import { Login } from "@/components/auth/login";
import { LoadingIcon } from "@/components/shared/loading-icon";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react";



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

  function handleOpenChange(open: boolean) {
    setOpen(open)
  }

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>

        <div className="hidden">
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>
              You must be logged in to view this page.
            </DialogDescription>
          </DialogHeader>
        </div>

        {
          loaded ? (
            <Login onLogin={() => {}} />
          ) : (
            <div className="flex items-center justify-center">
              <LoadingIcon />
            </div>
          )
        }

      </DialogContent>
    </Dialog>
  );
}