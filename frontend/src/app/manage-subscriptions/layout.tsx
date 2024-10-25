import { LoginRequired } from "@/components/auth/login-required"


export default function Layout({
  children
} : Readonly<{
  children: React.ReactNode
}>) {
  return (
    <LoginRequired>
      {children}
    </LoginRequired>
  )
}