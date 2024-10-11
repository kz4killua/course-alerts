import Link from "next/link";
import clsx from "clsx";
import { BellIcon, GraduationCapIcon, RocketIcon, SearchIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button"


function Container({
  children,
  className
} : {
  children: React.ReactNode,
  className?: string
}) {
  return (
    <div 
      className={clsx(
        "max-w-5xl mx-auto px-8 md:px-16", 
        className
      )}
    >
      {children}
    </div>
  )
}


function Header() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-8 gap-3">
      <div className="font-semibold text-lg">🔔 Notify</div>
      <div className="font-semibold text-lg">🏫 For Ontario Tech University</div>
    </header>
  )
}


function Footer() {
  return (
    <footer className="pt-20 pb-10">
      Made with ❤️ by 
      <Link href={"https://www.ifeanyiobinelo.com/"} target="_blank" className="ml-1 font-medium hover:underline underline-offset-4">Ifeanyi</Link>.
      Want to contribute? Check out our 
      <Link href={""} target="_blank" className="ml-1 font-medium hover:underline underline-offset-4">GitHub</Link>.
    </footer>
  )
}


function Stats() {
  return (
    <div className="flex items-center justify-center gap-x-8">
      <div className="flex flex-col items-center justify-center gap-3">
        <UserIcon size={32} />
        <span>60+ users</span>
      </div>
      <div className="flex flex-col items-center justify-center gap-3">
        <GraduationCapIcon size={32} />
        <span>500+ classes</span>
      </div>
    </div>
  )
}


function Hero() {
  return (
    <div className="flex items-center space-x-28 pt-28 pb-28">
      <div className="grow space-y-8">
        <h1 className="font-extrabold text-6xl">
          Classes full?
        </h1>
        <h3 className="text-2xl">
          Sign up for email alerts. 
          Be the first to know when seats become available.
        </h3>
        <div>
          <Button size={"lg"} className="text-base h-12">
            <SearchIcon size={16} className="mr-2" /> Search for a class
          </Button>
        </div>
      </div>
      <div className="hidden md:block">
        <BellIcon strokeWidth={1.25} size={300} />
      </div>
    </div>
  )
}


export default function Home() {
  return (
    <Container>
      <Header />
      <main>
        <Hero />
        <Stats />
      </main>
      <Footer />
    </Container>
  );
}
