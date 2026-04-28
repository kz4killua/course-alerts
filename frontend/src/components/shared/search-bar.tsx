"use client"

import clsx from "clsx"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

export function SearchBar(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div
      className={clsx(
        "bg-white group flex gap-x-1 items-center justify-center",
        "rounded-md border border-input px-6 py-2",
        "shadow-sm transition-colors",
        "focus-within:ring-1 focus-within:ring-ring"
      )}
    >
      <SearchIcon size={16} />
      <Input
        className={clsx(
          "border-0 ring-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
        )}
        type="text"
        {...props}
      />
    </div>
  )
}
