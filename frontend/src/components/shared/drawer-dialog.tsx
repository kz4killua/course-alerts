"use client"

import React, { JSX } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { DialogProps, DialogTriggerProps, DialogContentProps, DialogDescriptionProps, DialogTitleProps, DialogCloseProps } from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"


export function DrawerDialog(props: JSX.IntrinsicAttributes & DialogProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <Drawer {...props} />
  } else {
    return <Dialog {...props} />
  }
}


export function DrawerDialogTrigger({className, ...props}: JSX.IntrinsicAttributes & DialogTriggerProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerTrigger className={className} {...props} />
  } else {
    return <DialogTrigger className={className} {...props} />
  }
}


export function DrawerDialogContent({className, ...props}: JSX.IntrinsicAttributes & DialogContentProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerContent className={cn("p-4 pt-0", className)} {...props} />
  } else {
    return <DialogContent className={className} {...props} />
  }
}


export function DrawerDialogHeader({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerHeader className={cn("px-0", className)} {...props} />
  } else {
    return <DialogHeader className={className} {...props} />
  }
}


export function DrawerDialogTitle({className, ...props}: JSX.IntrinsicAttributes & DialogTitleProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerTitle className={className} {...props} />
  } else {
    return <DialogTitle className={className} {...props} />
  }
}


export function DrawerDialogDescription({className, ...props}: JSX.IntrinsicAttributes & DialogDescriptionProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerDescription className={className} {...props} />
  } else {
    return <DialogDescription className={className} {...props} />
  }
}


export function DrawerDialogFooter({className, ...props} : React.HTMLAttributes<HTMLDivElement>) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerFooter className={cn("flex-col-reverse px-0", className)} {...props} />
  } else {
    return <DialogFooter className={className} {...props} />
  }
}


export function DrawerDialogClose({className, ...props}: JSX.IntrinsicAttributes & DialogCloseProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerClose className={className} {...props} />
  } else {
    return <DialogClose className={className} {...props} />
  }
}