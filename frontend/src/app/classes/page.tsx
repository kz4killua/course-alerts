import clsx from "clsx"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Container } from "@/components/shared/container"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { SearchIcon } from "lucide-react"


function CourseSearch() {
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
        placeholder="Search for a class..." 
      />
    </div>
  )
}


function TermSelect() {

  const terms = [
    {
      id: "202409",
      name: "Fall 2024"
    },
    {
      id: "202501",
      name: "Winter 2025"
    }
  ]

  return (
    <div className="flex gap-8">
      {
        terms.map((term, index) => (
          <div className="flex items-center space-x-2">
            <Checkbox id={term.id} defaultChecked={index === 0} />
            <label
              htmlFor={term.id}
              className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {term.name}
            </label>
          </div>
        ))
      }
    </div>
  )
}


export default function Classes() {
  return (
    <Container className="flex flex-col min-h-screen">
      <Header />
      <main className="grow w-full max-w-3xl mx-auto pt-10">
        <div className="space-y-6">
          <CourseSearch />
          <TermSelect />
        </div>
      </main>
      <Footer />
    </Container>
  )
}