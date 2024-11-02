"use client"

import clsx from "clsx"
import { Skeleton } from "@/components/ui/skeleton"


export function CourseDisplay({
  onClick,
  className,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
} : {
  onClick?: () => void,
  className?: string,
  topLeft?: string,
  topRight?: string,
  bottomLeft?: string,
  bottomRight?: string,
}) {
  return (
    <div 
      className={clsx(
        "rounded-md border px-8 py-4 cursor-pointer",
        "grow flex flex-col gap-y-1",
        "hover:bg-accent hover:border-primary transition-colors",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-x-1 gap-y-1 flex-wrap">
        <p className="text-lg font-bold">{topLeft}</p>
        <p className="text-sm">{topRight}</p>
      </div>
      <div className="flex items-center justify-between gap-x-1 gap-y-1 flex-wrap">
        <p className="text-sm">{bottomLeft}</p>
        <p className="text-sm">{bottomRight}</p>
      </div>
    </div>
  )
}


export function CourseDisplaySkeleton() {
  return (
    <Skeleton className="h-16 w-full" />
  )
}