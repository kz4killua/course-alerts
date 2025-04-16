"use client"

import React, { JSX } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { DialogProps, DialogTriggerProps, DialogContentProps, DialogDescriptionProps, DialogTitleProps, DialogCloseProps } from "@radix-ui/react-dialog"


export function DrawerDialog(props: JSX.IntrinsicAttributes & DialogProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <Drawer {...props} />
  } else {
    return <Dialog {...props} />
  }
}


export function DrawerDialogTrigger(props: JSX.IntrinsicAttributes & DialogTriggerProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerTrigger {...props} />
  } else {
    return <DialogTrigger {...props} />
  }
}


export function DrawerDialogContent(props: JSX.IntrinsicAttributes & DialogContentProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerContent {...props} />
  } else {
    return <DialogContent {...props} />
  }
}


export function DrawerDialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerHeader {...props} />
  } else {
    return <DialogHeader {...props} />
  }
}


export function DrawerDialogTitle(props: JSX.IntrinsicAttributes & DialogTitleProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerTitle {...props} />
  } else {
    return <DialogTitle {...props} />
  }
}


export function DrawerDialogDescription(props: JSX.IntrinsicAttributes & DialogDescriptionProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerDescription {...props} />
  } else {
    return <DialogDescription {...props} />
  }
}


export function DrawerDialogFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerFooter {...props} />
  } else {
    return <DialogFooter {...props} />
  }
}


export function DrawerDialogClose(props: JSX.IntrinsicAttributes & DialogCloseProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <DrawerClose {...props} />
  } else {
    return <DialogClose {...props} />
  }
}