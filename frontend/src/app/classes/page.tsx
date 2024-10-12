"use client"

import clsx from "clsx"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Container } from "@/components/shared/container"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { SearchIcon } from "lucide-react"
import { useState, useEffect } from "react"
import type { Term } from "@/types"
import { listTerms } from "@/services/courses"



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


function TermSelect({
  terms
}: {
  terms: Term[]
}) {

  return (
    <div className="flex gap-8">
      {
        terms.length === 0 ? (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          terms.map((term, index) => (
            <div className="flex items-center space-x-2" key={term.term}>
              <Checkbox id={term.term} defaultChecked={index === 0} />
              <label
                htmlFor={term.term}
                className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {term.term_desc}
              </label>
            </div>
          ))
        )
      }
    </div>
  )
}


function SearchResults() {

  const courses = [
    {
      id: 1,
      title: "Calculus I",
      term: "Fall 2024",
      code: "MATH 1010U"
    },
    {
      id: 2,
      title: "Calculus I",
      term: "Fall 2024",
      code: "MATH 1010U"
    },
    {
      id: 3,
      title: "Calculus I",
      term: "Fall 2024",
      code: "MATH 1010U"
    },
    {
      id: 4,
      title: "Calculus I",
      term: "Fall 2024",
      code: "MATH 1010U"
    },
    {
      id: 5,
      title: "Calculus I",
      term: "Fall 2024",
      code: "MATH 1010U"
    },
    {
      id: 6,
      title: "Calculus I",
      term: "Fall 2024",
      code: "MATH 1010U"
    },
    {
      id: 7,
      title: "Calculus I",
      term: "Fall 2024",
      code: "MATH 1010U"
    },
    {
      id: 8,
      title: "Calculus I",
      term: "Fall 2024",
      code: "MATH 1010U"
    },
    {
      id: 9,
      title: "Calculus I",
      term: "Fall 2024",
      code: "MATH 1010U"
    }
  ]


  return (
    <div>
      <p className="text-sm">Found {courses.length} results for "math"</p>

      <div className="mt-4 space-y-4">
        {
          courses.map(course =>
            <div 
              key={course.id} 
              className={clsx(
                "rounded-md border px-8 py-4 cursor-pointer",
                "flex flex-col gap-y-1",
              )}
            >
              <p className="text-lg font-bold">{course.title}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm">{course.code}</p>
                <p className="text-sm">{course.term}</p>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}


function SectionsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl p-10">
        <DialogHeader>
          <DialogTitle className="text-3xl">
            MATH 1010U - Calculus I
          </DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-sm">
            We found 3 lectures, 32 labs, and 16 tutorials for this class. 
          </p>

          <div className="mt-8">
            <p className="mb-4 font-bold">
              Choose the classes to get alerts for.
            </p>
            <div className="flex gap-4">
              <Button variant="secondary">
                🎓 Sign up for all lectures.
              </Button>
              <Button variant="secondary">
                📘 Sign up for all tutorials.
              </Button>
              <Button variant="secondary">
                🧪 Sign up for all labs.
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-4 font-bold">
              Or pick classes yourself...
            </p>
            <div>

              <div className="flex items-center justify-center gap-3">
                <Checkbox id="42343" />
                <div className={clsx(
                  "rounded-md border px-8 py-4 cursor-pointer",
                  "grow flex flex-col gap-y-1",
                )}>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">Lecture</p>
                    <p className="text-sm">CRN: 40234</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">MATH 1010U</p>
                    <p className="text-sm">Mon & Thur · 9:40am - 11:00am</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export default function Classes() {

  const [terms, setTerms] = useState<Term[]>([])

  useEffect(() => {
    listTerms(true)
    .then(response => {
      setTerms(response.data)
    })
    .catch(error => {
      console.error(error)
    })
  }, [])

  return (
    <Container className="flex flex-col min-h-screen">
      <Header />
      <main className="grow w-full max-w-3xl mx-auto pt-10">

        <div className="space-y-6">
          <CourseSearch />
          <TermSelect terms={terms} />
        </div>

        <div className="mt-10">
          <SearchResults />
        </div>

      </main>
      <Footer />
    </Container>
  )
}