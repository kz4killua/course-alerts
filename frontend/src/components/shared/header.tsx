"use client"

import Link from "next/link"
import { GraduationCapIcon, LogOutIcon } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/shared/logo"
import { Container } from "@/components/shared/container"


export function Header() {

  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <Container className="flex justify-between items-center py-8 gap-3">
        <Link href={"/"}>
          <div className="flex items-center justify-center font-semibold text-lg text-primary">
            <Logo width={24} height={24} className="mr-3 fill-primary" /> Course Alerts
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
              <DropdownMenuContent side="bottom" align="end" className="w-60">
                <DropdownMenuLabel className="overflow-hidden text-ellipsis text-muted-foreground">
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
      </Container>
    </header>
  )
}