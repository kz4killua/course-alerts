"use client"

import clsx from "clsx"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Container } from "@/components/shared/container"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { SectionsDialog } from "@/components/classes/sections-dialog"
import { Loader, SearchIcon } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import type { Term, Course, Section } from "@/types"
import { listTerms, listCourses, listSections } from "@/services/courses"
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
  selectedTerm,
  setSelectedCourse
}: {
  query: string,
  selectedTerm: Term | undefined,
  setSelectedCourse: (course: Course) => void
}) {

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState<string>("")
  const [debouncedTerm, setDebouncedTerm] = useState<Term | undefined>()


  function handleSearch(query: string, term: Term | undefined) {
    setDebouncedQuery(query)
    setDebouncedTerm(term)

    if ((query.length > 0) && term) {

      setLoading(true)

      listCourses(term.term, query)
      .then(response => {
        setCourses(response.data)
      })
      .catch(error => {
        console.error(error)
      })
      .finally(() => {
        setLoading(false)
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
      <p className="text-sm h-8 flex items-center">
        {
          loading ? (
            <Loader size={14} className="animate-spin" />
          ) :
          debouncedQuery.length !== 0 && (
            <span>Found {courses.length} results for &ldquo;{debouncedQuery}&rdquo; in {debouncedTerm?.term_desc}</span>
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
              onClick={() => setSelectedCourse(course)}
            >
              <p className="text-lg font-bold">{course.course_title}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm">{course.subject_course}</p>
                <p className="text-sm">{debouncedTerm?.term_desc}</p>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}


export default function Classes() {

  const [terms, setTerms] = useState<Term[]>([])
  const [selectedTerm, setSelectedTerm] = useState<Term>()
  const [query, setQuery] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState<Course>()
  const [selectedCourseSections, setSelectedCourseSections] = useState<Section[]>([])
  const [selectedSections, setSelectedSections] = useState<Set<Section["id"]>>(new Set())

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

  useEffect(() => {
    if (selectedCourse && selectedTerm) {
      listSections(selectedCourse.subject_course, selectedTerm.term)
      .then(response => {
        setSelectedCourseSections(response.data)
      })
      .catch(error => {
        console.error(error)
      })
    } else {
      setSelectedCourseSections([])
    }

    setSelectedSections(new Set())
  }, [selectedCourse, selectedTerm])

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
            setSelectedCourse={setSelectedCourse}
          />
        </div>

        <SectionsDialog 
          selectedTerm={selectedTerm}
          selectedCourse={selectedCourse} 
          setSelectedCourse={setSelectedCourse}
          selectedCourseSections={selectedCourseSections}
          setSelectedCourseSections={setSelectedCourseSections}
          selectedSections={selectedSections}
          setSelectedSections={setSelectedSections}
        />

      </main>
      <Footer />
    </Container>
  )
}