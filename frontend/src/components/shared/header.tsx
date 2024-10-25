"use client"

import Link from "next/link"
import { BellIcon, GraduationCapIcon, LogOutIcon, SchoolIcon } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu"


export function Header() {

  const { user, logout } = useAuth()

  return (
    <header className="flex flex-row justify-between items-center py-8 gap-3">
      <Link href={"/"}>
        <div className="flex items-center justify-center font-semibold text-lg">
          <BellIcon size={20} className="mr-2" /> Notify
        </div>
      </Link>

      {
        user && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarFallback>
                  {user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuLabel>
                {user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <Link href={"/manage-subscriptions"}>
                <DropdownMenuItem className="cursor-pointer">
                    <GraduationCapIcon /> My subscriptions
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                <LogOutIcon /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    </header>
  )
}