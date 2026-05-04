"use client"

import type {
  DialogCloseProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogProps,
  DialogTitleProps,
  DialogTriggerProps,
} from "@radix-ui/react-dialog"
import type React from "react"
import { createContext, type JSX, useContext } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const DrawerDialogContext = createContext({
  isMobile: false,
  isDismissible: true,
})

export function useDrawerDialogContext() {
  return useContext(DrawerDialogContext)
}

export function DrawerDialog({
  isDismissible = true,
  ...props
}: DialogProps & { isDismissible?: boolean }) {
  const isMobile = useIsMobile()
  const contextValue = { isMobile, isDismissible }

  if (isMobile) {
    return (
      <Drawer {...props} dismissible={isDismissible}>
        <DrawerDialogContext.Provider value={contextValue}>
          {props.children}
        </DrawerDialogContext.Provider>
      </Drawer>
    )
  }
  if (isDismissible) {
    return (
      <Dialog {...props}>
        <DrawerDialogContext.Provider value={contextValue}>
          {props.children}
        </DrawerDialogContext.Provider>
      </Dialog>
    )
  }
  return (
    <AlertDialog {...props}>
      <DrawerDialogContext.Provider value={contextValue}>
        {props.children}
      </DrawerDialogContext.Provider>
    </AlertDialog>
  )
}

export function DrawerDialogTrigger({
  className,
  ...props
}: JSX.IntrinsicAttributes & DialogTriggerProps) {
  const { isMobile, isDismissible } = useDrawerDialogContext()

  if (isMobile) {
    return <DrawerTrigger className={className} {...props} />
  }
  if (isDismissible) {
    return <DialogTrigger className={className} {...props} />
  }
  return <AlertDialogTrigger className={className} {...props} />
}

export function DrawerDialogContent({
  className,
  ...props
}: JSX.IntrinsicAttributes & DialogContentProps) {
  const { isMobile, isDismissible } = useDrawerDialogContext()

  if (isMobile) {
    return (
      <DrawerContent
        className={cn("max-h-[95%] p-4 pt-0", className)}
        {...props}
      />
    )
  }
  if (isDismissible) {
    return <DialogContent className={cn("max-h-[95%]", className)} {...props} />
  }
  return (
    <AlertDialogContent
      className={cn("max-h-[95%]", className)}
      // Prevent escape key from closing the dialog
      onEscapeKeyDown={(e) => {
        e.preventDefault()
      }}
      {...props}
    />
  )
}

export function DrawerDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isMobile, isDismissible } = useDrawerDialogContext()

  if (isMobile) {
    return <DrawerHeader className={cn("px-0", className)} {...props} />
  }
  if (isDismissible) {
    return <DialogHeader className={className} {...props} />
  }
  return <AlertDialogHeader className={className} {...props} />
}

export function DrawerDialogTitle({
  className,
  ...props
}: JSX.IntrinsicAttributes & DialogTitleProps) {
  const { isMobile, isDismissible } = useDrawerDialogContext()

  if (isMobile) {
    return <DrawerTitle className={className} {...props} />
  }
  if (isDismissible) {
    return <DialogTitle className={className} {...props} />
  }
  return <AlertDialogTitle className={className} {...props} />
}

export function DrawerDialogDescription({
  className,
  ...props
}: JSX.IntrinsicAttributes & DialogDescriptionProps) {
  const { isMobile, isDismissible } = useDrawerDialogContext()

  if (isMobile) {
    return <DrawerDescription className={className} {...props} />
  }
  if (isDismissible) {
    return <DialogDescription className={className} {...props} />
  }
  return <AlertDialogDescription className={className} {...props} />
}

export function DrawerDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isMobile, isDismissible } = useDrawerDialogContext()

  if (isMobile) {
    return (
      <DrawerFooter
        className={cn("flex-col-reverse px-0", className)}
        {...props}
      />
    )
  }
  if (isDismissible) {
    return <DialogFooter className={className} {...props} />
  }
  return <AlertDialogFooter className={className} {...props} />
}

export function DrawerDialogClose({
  className,
  ...props
}: JSX.IntrinsicAttributes & DialogCloseProps) {
  const { isMobile, isDismissible } = useDrawerDialogContext()

  if (isMobile) {
    return <DrawerClose className={className} {...props} />
  }
  if (isDismissible) {
    return <DialogClose className={className} {...props} />
  }
  return <AlertDialogCancel className={className} {...props} />
}
