"use client"

import { useUser } from "@/hooks/use-user"
import { LoginDialogBody } from "@/components/auth/login-dialog-body"
import {
  DrawerDialog,
  DrawerDialogContent,
} from "@/components/shared/drawer-dialog"
import { LoadingDialogBody } from "@/components/shared/loading-dialog-body"

export function LoginRequired({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { data: user, isLoading } = useUser()
  const open = isLoading || !user

  return (
    <>
      <DrawerDialog open={open} isDismissible={false}>
        <DrawerDialogContent>
          {isLoading ? (
            <LoadingDialogBody />
          ) : !user ? (
            <LoginDialogBody onLogin={() => {}} />
          ) : null}
        </DrawerDialogContent>
      </DrawerDialog>
      {!open && children}
    </>
  )
}
