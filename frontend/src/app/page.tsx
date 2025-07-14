import Link from "next/link";
import Image from "next/image";
import { SearchIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button"
import { PageLayout } from "@/components/shared/page-layout";
import { UnderlinedLink } from "@/components/shared/underlined-link";
import { FEEDBACK_URL, GITHUB_URL } from "@/lib/constants";


export default function Page() {
  return (
    <PageLayout>
      <main className="mt-24 space-y-24">
        <Hero />
        <FrequentlyAskedQuestions />
      </main>
    </PageLayout>
  );
}


function Hero() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 place-items-center gap-y-20">
      <div className="space-y-7">
        <h1 className="font-semibold text-4xl md:text-5xl md:leading-tight">
          Get into your full classes
        </h1>
        <h2 className="text-xl md:leading-relaxed text-muted-foreground">
          Get notified as soon as a spot opens up in any full class at Ontario Tech University.
        </h2>
        <div>
          <Link className={`${buttonVariants({ variant: "default", size: "lg" })} text-base h-14 px-8`} href={"/classes"}>
            <SearchIcon size={16} className="mr-2" /> Search for a class
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <Image
          alt="A student looking notifications on their phone"
          src={"/hero-image.svg"}
          width={600}
          height={600}
          priority
        />
      </div>
    </section>
  )
}


function FrequentlyAskedQuestions() {
  return (
    <section>
      <h2 className="text-3xl md:text-4xl font-semibold mb-10">
        Frequently Asked Questions
      </h2>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Is it free?
          </h3>
          <p className="text-lg text-muted-foreground">
            Yes! Course Alerts is completely free to use, no strings attached.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Can I trust you with my personal information?
          </h3>
          <p className="text-lg text-muted-foreground">
            We only store what we need to send you course notifications.
            This information is never used for anything else.
            Plus, Course Alerts is completely open source.
            You can review the entire codebase <UnderlinedLink href={GITHUB_URL}>here</UnderlinedLink>.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">
            I have a different question, comment, or complaint.
          </h3>
          <p className="text-lg text-muted-foreground">
            Please fill out our feedback form <UnderlinedLink href={FEEDBACK_URL}>here</UnderlinedLink>.
          </p>
        </div>
      </div>
    </section>
  )
}
