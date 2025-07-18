"use client"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"


export function ItemDisplay({
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
      className={cn(
        "rounded-md border px-8 py-4 cursor-pointer",
        "bg-white grow flex flex-col gap-y-1",
        "sm:hover:bg-accent",
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


export function ItemDisplaySkeleton() {
  return (
    <Skeleton className="h-16 w-full" />
  )
}