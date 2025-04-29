"use client"

import clsx from "clsx"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"


export function SearchBar({
  placeholder,
  onChange,
} : {
  placeholder: string,
  onChange: (value: string) => void,
}) {
  return (
    <div className={clsx(
      "group flex items-center justify-center",
      "rounded-md border border-input px-3 py-1",
      "shadow-sm transition-colors",
      "focus-within:ring-1 focus-within:ring-ring"
    )}>
      <SearchIcon size={16} />
      <Input 
        className={clsx(
          "border-0 ring-0 shadow-none focus-visible:border-0 focus-visible:ring-0 placeholder:font-medium",
        )}
        type="text" 
        placeholder={placeholder} 
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}