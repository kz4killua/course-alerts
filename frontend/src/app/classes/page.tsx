"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SectionsDialog } from "@/components/classes/sections-dialog"
import { useState, useEffect } from "react"
import type { Term } from "@/types"
import { SearchBar } from "@/components/shared/search-bar"
import { PageLayout } from "@/components/shared/page-layout"
import { useTerms } from "@/hooks/use-terms"
import { useDebounce } from "@uidotdev/usehooks"
import { useCourses } from "@/hooks/use-courses"
import { LoadingIcon } from "@/components/shared/loading-icon"


export default function Page() {
  const [query, setQuery] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<Term>()

  return (
    <PageLayout>
      <main className="pt-10">
        <div className="space-y-6">
          <SearchBar
            placeholder="Search for a course..."
            onChange={e => setQuery(e.target.value)} 
            autoFocus
          />
          <TermSelect selectedTerm={selectedTerm} setSelectedTerm={setSelectedTerm} />
        </div>
        <div className="mt-10">
          {
            selectedTerm && (
              <SearchResults query={query} term={selectedTerm} />
            )
          }
        </div>
      </main>
    </PageLayout>
  )
}


function TermSelect({
  selectedTerm,
  setSelectedTerm
}: {
  selectedTerm: Term | undefined,
  setSelectedTerm: (term: Term | undefined) => void
}) {
  const { data: terms } = useTerms(true)

  useEffect(() => {
    if (terms && terms.length > 0 && !selectedTerm) {
      setSelectedTerm(terms[0])
    }
  }, [terms, selectedTerm, setSelectedTerm])

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
            <AlertDescription>
              There are no classes available for registration at this time. Check back soon!
            </AlertDescription>
          </Alert>
        ) : (
          <RadioGroup defaultValue={terms[0].term} onValueChange={handleValueChange} className="flex gap-4">
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
  term,
}: {
  query: string,
  term: Term,
}) {
  const debouncedQuery = useDebounce(query, 250)
  const debouncedTerm = useDebounce(term, 250)
  const { data: courses = [], isFetching, isError } = useCourses(debouncedTerm?.term, debouncedQuery)

  return (
    <div>
      <p className="text-sm h-8 flex items-center text-muted-foreground">
        {
          isFetching ? (
            <LoadingIcon />
          ) : isError ? (
            <span>
              An error occurred while searching for courses. Please try again later.
            </span>
          ) : debouncedQuery.length > 0 && debouncedTerm && (
            <span>Found {courses.length} results for &ldquo;{debouncedQuery}&rdquo; in {debouncedTerm?.term_desc}</span>
          )
        }
      </p>

      <div className="mt-4 space-y-4">
        {
          courses.map(course =>
            <SectionsDialog
              key={course.subject_course}
              term={debouncedTerm}
              course={course}
            />
          )
        }
      </div>
    </div>
  )
}
