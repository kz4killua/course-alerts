"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Container } from "@/components/shared/container"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { SectionsDialog } from "@/components/classes/sections-dialog"
import { InfoIcon, Loader } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import type { Term, Course, Section } from "@/types"
import { listTerms, listCourses } from "@/services/courses"
import { debounce } from "lodash"
import { SearchBar } from "@/components/shared/search-bar"


function TermSelect({
  selectedTerm,
  setSelectedTerm
}: {
  selectedTerm: Term | undefined,
  setSelectedTerm: (term: Term | undefined) => void
}) {

  const [terms, setTerms] = useState<Term[]>()

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
  }, [setSelectedTerm])

  function handleValueChange(value: string) {
    if (terms !== undefined) {
      setSelectedTerm(terms.find(term => term.term === value))
    }
  }

  return (
    <div className="flex gap-8">
      {
        terms === undefined ? (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : terms.length === 0 ? (
          <Alert className="bg-blue-50 border-blue-500">
            <InfoIcon className="w-4 h-4" />
            <AlertTitle>No terms available</AlertTitle>
            <AlertDescription>
              There are no terms available for registration at this time. Check back soon!
            </AlertDescription>
          </Alert>
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
  selectedSections,
  setSelectedSections,
}: {
  query: string,
  selectedTerm: Term | undefined,
  selectedSections: Set<Section["id"]>,
  setSelectedSections: (sections: Set<Section["id"]>) => void
}) {

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState<string>("")
  const [debouncedTerm, setDebouncedTerm] = useState<Term | undefined>()


  const debouncedSearch = useMemo(() => {

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

    return debounce((query, term) => handleSearch(query, term), 250)
  }, [])

  useEffect(() => {
    debouncedSearch(query, selectedTerm)
    return debouncedSearch.cancel
  }, [query, selectedTerm, debouncedSearch])


  return (
    <div>
      <p className="text-sm h-8 flex items-center">
        {
          loading ? (
            <Loader size={14} className="animate-spin" />
          ) :
          debouncedQuery.length > 0 && debouncedTerm && (
            <span>Found {courses.length} results for &ldquo;{debouncedQuery}&rdquo; in {debouncedTerm?.term_desc}</span>
          )
        }
      </p>

      <div className="mt-4 space-y-4">
        {
          debouncedTerm && courses.map(course =>
            <SectionsDialog
              key={course.subject_course}
              term={debouncedTerm}
              course={course}
              selectedSections={selectedSections}
              setSelectedSections={setSelectedSections}
            />
          )
        }
      </div>
    </div>
  )
}


export default function Page() {

  const [query, setQuery] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<Term>()
  const [selectedSections, setSelectedSections] = useState<Set<Section["id"]>>(new Set())

  return (
    <Container className="flex flex-col min-h-screen">
      <Header />
      <main className="grow w-full max-w-3xl mx-auto pt-10">

        <div className="space-y-6">
          <SearchBar placeholder="Search for a class..." onChange={setQuery} />
          <TermSelect selectedTerm={selectedTerm} setSelectedTerm={setSelectedTerm} />
        </div>

        <div className="mt-10">
          {
            selectedTerm && (
              <SearchResults 
                query={query} 
                selectedTerm={selectedTerm} 
                selectedSections={selectedSections}
                setSelectedSections={setSelectedSections}
              />
            )
          }
        </div>

      </main>
      <Footer />
    </Container>
  )
}