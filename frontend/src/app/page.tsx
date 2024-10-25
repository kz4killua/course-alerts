import Link from "next/link";
import clsx from "clsx";
import { BellIcon, GraduationCapIcon, MessageSquareShareIcon, RocketIcon, SearchIcon, UserIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button"
import { Container } from "@/components/shared/container";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";


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
          <Link className={`${buttonVariants({ variant: "default", size: "lg" })} text-base h-12 px-8`} href={"/classes"}>
            <SearchIcon size={16} className="mr-2" /> Search for a class
          </Link>
        </div>
      </div>
      <div className="hidden md:block">
        <BellIcon strokeWidth={1.25} size={300} />
      </div>
    </div>
  )
}


function Feedback() {
  return (
    <div className="w-full rounded-md bg-primary text-white mt-28 px-10 py-10 flex items-center space-x-28">
      <div className="space-y-5">
        <h1 className="font-semibold text-3xl">We want to hear from you!</h1>
        <p>
          Whether you found a bug, have a question, or just want to share your thoughts, 
          we&apos;d love to hear from you. 
        </p>
        <Link className={`${buttonVariants({ variant: "secondary", size: "lg" })}`} href={"/"} target="_blank">
          <RocketIcon size={16} className="mr-2" /> Give feedback
        </Link>
      </div>
      <div className="hidden md:block">
        <MessageSquareShareIcon strokeWidth={1.25} size={100} />
      </div>
    </div>
  )
}


export default function Page() {
  return (
    <Container>
      <Header />
      <main>
        <Hero />
        <Stats />
        <Feedback />
      </main>
      <Footer />
    </Container>
  );
}
