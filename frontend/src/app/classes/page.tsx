"use client"

import clsx from "clsx"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Container } from "@/components/shared/container"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { SearchIcon } from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
import type { Term, Course } from "@/types"
import { listTerms, listCourses } from "@/services/courses"
import { debounce } from "lodash"



function CourseSearch({
  setQuery
} : {
  setQuery: (query: string) => void
}) {
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
        onChange={e => setQuery(e.target.value)}
      />
    </div>
  )
}


function TermSelect({
  terms,
  selectedTerm,
  setSelectedTerm
}: {
  terms: Term[],
  selectedTerm: Term | undefined,
  setSelectedTerm: (term: Term | undefined) => void
}) {

  function handleValueChange(value: string) {
    setSelectedTerm(terms.find(term => term.term === value));
  }

  return (
    <div className="flex gap-8">
      {
        terms.length === 0 ? (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <RadioGroup defaultValue={selectedTerm?.term} className="flex gap-4" onValueChange={handleValueChange}>
            {
              terms.map(term => (
                <div className="flex items-center space-x-2" key={term.term}>
                  <RadioGroupItem id={term.term} value={term.term} />
                  <Label htmlFor={term.term}>
                    {term.term_desc}
                  </Label>
                </div>
              ))
            }
          </RadioGroup>
        )
      }
    </div>
  )
}


function SearchResults({
  query,
  selectedTerm
}: {
  query: string,
  selectedTerm: Term | undefined
}) {

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [lastQuery, setLastQuery] = useState<string>("")
  const [lastSelectedTerm, setLastSelectedTerm] = useState<Term>()


  function handleSearch(query: string, term: Term) {
    setLastQuery(query)
    setLastSelectedTerm(term)

    if (query.length > 0) {
      listCourses(term.term, query)
      .then(response => {
        setCourses(response.data)
      })
      .catch(error => {
        console.error(error)
      })
    } else {
      setCourses([])
    }
  }

  const debouncedSearch = useMemo(() => 
    debounce((query, term) => handleSearch(query, term), 750), 
  [handleSearch])

  useEffect(() => {
    debouncedSearch(query, selectedTerm)
    return debouncedSearch.cancel
  }, [query, selectedTerm])


  return (
    <div>
      <p className="text-sm">
        {
          lastQuery.length !== 0 && (
            <span>Found {courses.length} results for &ldquo;{lastQuery}&rdquo; in {lastSelectedTerm?.term_desc}</span>
          )
        }
      </p>

      <div className="mt-4 space-y-4">
        {
          courses.map(course =>
            <div 
              key={course.subject_course} 
              className={clsx(
                "rounded-md border px-8 py-4 cursor-pointer",
                "flex flex-col gap-y-1",
              )}
            >
              <p className="text-lg font-bold">{course.course_title}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm">{course.subject_course}</p>
                <p className="text-sm">{lastSelectedTerm?.term_desc}</p>
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
  const [selectedTerm, setSelectedTerm] = useState<Term>()
  const [query, setQuery] = useState<string>("")

  useEffect(() => {
    listTerms(true)
    .then(response => {
      const terms = response.data
      setTerms(terms)
      if (terms.length > 0) {
        setSelectedTerm(terms[0])
      }
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
          <CourseSearch setQuery={setQuery} />
          <TermSelect 
            terms={terms} 
            selectedTerm={selectedTerm}
            setSelectedTerm={setSelectedTerm}
          />
        </div>

        <div className="mt-10">
          <SearchResults 
            query={query} 
            selectedTerm={selectedTerm} 
          />
        </div>

      </main>
      <Footer />
    </Container>
  )
}