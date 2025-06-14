"use client";

import Link from "next/link";
import Image from "next/image";
import { BellIcon, MessageSquareShareIcon, SearchIcon, SquarePenIcon, UserIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button"
import { Container } from "@/components/shared/container";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { FEEDBACK_URL } from "@/lib/constants";


function Statistics() {
  return (
    <div className="space-y-8">
      <p className="text-center font-semibold">
        Made for Ontario Tech University
      </p>
      <div className="flex items-center justify-center gap-x-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <UserIcon size={32} />
          <span>100+ users</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-3">
          <BellIcon size={32} />
          <span>1,000+ alerts sent</span>
        </div>
      </div>
    </div>
  )
}


function Hero() {
  return (
    <div className="flex items-center space-x-20 pt-20 pb-20">
      <div className="grow space-y-7">
        <h1 className="font-extrabold text-6xl">
          Classes full?
        </h1>
        <h3 className="text-xl">
          Sign up for alerts. Be the first to know when seats become available.
        </h3>
        <div>
          <Link className={`${buttonVariants({ variant: "default", size: "lg" })} text-base h-12 px-8`} href={"/classes"}>
            <SearchIcon size={16} className="mr-2" /> Search for a class
          </Link>
        </div>
      </div>
      <div className="hidden md:block">
        <Image 
          alt="notifications" 
          src={"/hero-image.svg"} 
          width={600} 
          height={600}
          priority
        />
      </div>
    </div>
  )
}


function Feedback() {
  return (
    <div className="w-full rounded-md bg-primary text-white mt-20 px-10 py-10 flex items-center space-x-20">
      <div className="space-y-5">
        <h1 className="font-semibold text-3xl">We want to hear from you!</h1>
        <p>
          Whether you found a bug, have a question, or just want to share your thoughts, 
          we&apos;d love to hear from you. 
        </p>
        <Link className={`${buttonVariants({ variant: "secondary", size: "lg" })}`} href={FEEDBACK_URL} target="_blank">
          <SquarePenIcon size={16} className="mr-2" /> Give feedback
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
        <Statistics />
        <Feedback />
      </main>
      <Footer />
    </Container>
  );
}
