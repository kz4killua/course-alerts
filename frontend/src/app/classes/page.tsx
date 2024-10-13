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
import { Loader, SearchIcon } from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
import type { Term, Course, Section } from "@/types"
import { formatMeetingTimes } from "@/lib/utils"
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


function SectionsDialog({
  selectedCourse, 
  setSelectedCourse,
  selectedCourseSections,
  setSelectedCourseSections
} : {
  selectedCourse: Course | undefined,
  setSelectedCourse: (course: Course | undefined) => void,
  selectedCourseSections: Section[],
  setSelectedCourseSections: (sections: Section[]) => void
}) {
  
  const open = selectedCourse !== undefined

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSelectedCourse(undefined)
    }
  }

  const numSections = selectedCourseSections.length
  const numLectures = selectedCourseSections.filter(
    section => section.schedule_type_description === "Lecture"
  ).length
  const numLaboratories = selectedCourseSections.filter(
    section => section.schedule_type_description === "Laboratory"
  ).length
  const numTutorials = selectedCourseSections.filter(
    section => section.schedule_type_description === "Tutorial"
  ).length

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-5xl p-10 max-h-screen">
        <DialogHeader>
          <DialogTitle className="text-3xl">
            {selectedCourse?.subject_course} - {selectedCourse?.course_title}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto">

          <p className="text-sm h-4">
            {
              numSections === 0 ? (
                <Skeleton className="h-4 w-full" />
              ) : (
              <span>
                We found {numSections} {numSections === 1 ? "section" : "sections"} for this course.
              </span>
              )
            }
          </p>

          <div className="mt-8">
            <p className="mb-4 font-bold">
              Choose the classes to get alerts for.
            </p>
            <div className="flex flex-wrap gap-4">
              {
                numSections === 0 ? (
                  <>
                    <Skeleton className="h-9 w-44" />
                    <Skeleton className="h-9 w-44" />
                    <Skeleton className="h-9 w-44" />
                  </>
                ) : (
                  <>
                    {
                      numLectures > 0 && (
                        <Button variant="secondary">
                          🎓 Sign up for all lectures.
                        </Button>
                      )
                    }
                    {
                      numTutorials > 0 && (
                        <Button variant="secondary">
                          📘 Sign up for all tutorials.
                        </Button>
                      )
                    }
                    {
                      numLaboratories > 0 && (
                        <Button variant="secondary">
                          🧪 Sign up for all labs.
                        </Button>
                      )
                    }
                    <Button variant="secondary">
                      📚 Sign up for all sections.
                    </Button>
                  </>
                )
              }
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-4 font-bold">
              Or pick classes yourself...
            </p>
            <div className="flex flex-col gap-4 pb-8">
              {
                numSections === 0 ? (
                  <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </>
                ) : (
                  selectedCourseSections.map(section => (
                    <div className="flex items-center justify-center gap-3" key={section.id}>
                      <Checkbox id={section.id} />
                      <div className={clsx(
                        "rounded-md border px-8 py-4 cursor-pointer",
                        "grow flex flex-col gap-y-1",
                      )}>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold">{section.schedule_type_description}</p>
                          <p className="text-sm">CRN: {section.course_reference_number}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm">{selectedCourse?.subject_course}</p>
                          <p className="text-sm">{formatMeetingTimes(section.meeting_times)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )
              }
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
  const [selectedCourse, setSelectedCourse] = useState<Course>()
  const [selectedCourseSections, setSelectedCourseSections] = useState<Section[]>([])

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
          selectedCourse={selectedCourse} 
          setSelectedCourse={setSelectedCourse}
          selectedCourseSections={selectedCourseSections}
          setSelectedCourseSections={setSelectedCourseSections}
        />

      </main>
      <Footer />
    </Container>
  )
}