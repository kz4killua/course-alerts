import Link from "next/link";


export function Footer() {
  return (
    <footer className="pt-20 pb-10">
      Made with ❤️ by 
      <Link href={"https://www.ifeanyiobinelo.com/"} target="_blank" className="ml-1 font-medium hover:underline underline-offset-4">Ifeanyi</Link>.
    </footer>
  )
}