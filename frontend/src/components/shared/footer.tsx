import { FEEDBACK_URL } from "@/lib/constants";
import Link from "next/link";


export function Footer() {
  return (
    <footer className="pt-20 pb-10 text-xs text-center text-muted-foreground">
      Made with ❤️ by 
      <Link href={"https://www.ifeanyiobinelo.com/"} target="_blank" className="ml-1 font-medium underline underline-offset-4 hover:text-primary">Ifeanyi</Link>.
      Got
      <Link href={FEEDBACK_URL} target="_blank" className="ml-1 font-medium underline underline-offset-4 hover:text-primary">feedback</Link>?
    </footer>
  )
}