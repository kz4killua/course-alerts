"use client"

import clsx from "clsx"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Term, Course, Section } from "@/types"
import { formatMeetingTimes } from "@/lib/utils"
import { ConfirmationDialog } from "./confirmation-dialog"
import { useEffect, useState } from "react"
import { CourseDisplay, CourseDisplaySkeleton } from "@/components/shared/course-display"
import { listSections } from "@/services/courses"


export function SectionsDialog({
  term,
  course, 
  selectedSections,
  setSelectedSections
} : {
  term: Term,
  course: Course,
  selectedSections: Set<Section["id"]>,
  setSelectedSections: (sections: Set<Section["id"]>) => void
}) {

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [sections, setSections] = useState<Section[]>([])

  useEffect(() => {
    if (open && sections.length === 0) {
      listSections(course.subject_course, term.term)
      .then(response => {
        setSections(response.data)
      })
      .catch(error => {
        console.error(error)
      })
    }
  }, [open, course, term])
  
  function handleOpenChange(open: boolean) {
    setOpen(open)
    if (!open) {
      setSelectedSections(new Set())
    }
  }

  function toggleSectionSelection(section: Section) {
    const newSelectedSections = new Set(selectedSections)
    if (newSelectedSections.has(section.id)) {
      newSelectedSections.delete(section.id)
    } else {
      newSelectedSections.add(section.id)
    }
    setSelectedSections(newSelectedSections)
  }

  const numSections = sections.length
  const numLectures = sections.filter(
    section => section.schedule_type_description === "Lecture"
  ).length
  const numLaboratories = sections.filter(
    section => section.schedule_type_description === "Laboratory"
  ).length
  const numTutorials = sections.filter(
    section => section.schedule_type_description === "Tutorial"
  ).length

  function clearSelectedSections() {
    setSelectedSections(new Set())
  }

  function selectAllSections() {
    setSelectedSections(
      new Set(sections.map(section => section.id))
    )
    handleCreateAlerts()
  }

  function selectAllSectionsOfType(type: Section["schedule_type_description"]) {
    setSelectedSections(new Set(
      sections.filter(
        section => section.schedule_type_description === type
      ).map(section => section.id)
    ))
    handleCreateAlerts()
  }

  function handleCreateAlerts() {
    setConfirmationDialogOpen(true)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>

      <DialogTrigger asChild>
        <div>
          <CourseDisplay
            key={course.subject_course}
            topLeft={course.course_title}
            bottomLeft={course.subject_course}
            bottomRight={term.term_desc}
          />
        </div>
      </DialogTrigger>

      <DialogContent className="max-h-full max-w-full sm:max-w-5xl sm:max-h-[calc(100%-1rem)] p-0 flex flex-col overflow-y-hidden">
        
        <DialogHeader className="bg-background px-10 pt-10">
          <DialogTitle className="text-3xl">
            {course.subject_course} - {course.course_title}
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="hidden">
          Choose the classes to get alerts for.
        </DialogDescription>

        <div className="px-10 overflow-y-auto grow">

          <div className="text-sm h-4">
            {
              numSections === 0 ? (
                <Skeleton className="h-4 w-full" />
              ) : (
              <span>
                We found {numSections} {numSections === 1 ? "section" : "sections"} for this course.
              </span>
              )
            }
          </div>

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
                        <Button variant="secondary" onClick={() => selectAllSectionsOfType("Lecture")}>
                          🎓 Sign up for all lectures.
                        </Button>
                      )
                    }
                    {
                      numTutorials > 0 && (
                        <Button variant="secondary" onClick={() => selectAllSectionsOfType("Tutorial")}>
                          📘 Sign up for all tutorials.
                        </Button>
                      )
                    }
                    {
                      numLaboratories > 0 && (
                        <Button variant="secondary" onClick={() => selectAllSectionsOfType("Laboratory")}>
                          🧪 Sign up for all labs.
                        </Button>
                      )
                    }
                    <Button variant="secondary" onClick={selectAllSections}>
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
                    <CourseDisplaySkeleton />
                    <CourseDisplaySkeleton />
                    <CourseDisplaySkeleton />
                    <CourseDisplaySkeleton />
                    <CourseDisplaySkeleton />
                  </>
                ) : (
                  sections.map(section => (
                    <div 
                      className="flex items-center justify-center gap-3" 
                      key={section.id}
                      onClick={() => toggleSectionSelection(section)}
                    >
                      <Checkbox id={section.id} checked={selectedSections.has(section.id)} />
                      <CourseDisplay 
                        topLeft={section.schedule_type_description}
                        topRight={`CRN: ${section.course_reference_number}`}
                        bottomLeft={formatMeetingTimes(section.meeting_times)}
                      />
                    </div>
                  ))
                )
              }
            </div>
          </div>
        </div>

        <DialogFooter className="bg-background px-10 pb-10">
          <Button 
            variant="ghost" 
            onClick={clearSelectedSections} 
            disabled={selectedSections.size === 0}
          >
            Clear selection
          </Button>
          <Button 
            disabled={selectedSections.size === 0}
            onClick={handleCreateAlerts}
          >
            Create alerts
          </Button>
        </DialogFooter>

        <ConfirmationDialog
          open={confirmationDialogOpen}
          setOpen={setConfirmationDialogOpen}
          term={term}
          sections={sections.filter(
            section => selectedSections.has(section.id)
          )}
          setSelectedSections={setSelectedSections}
        />

      </DialogContent>
    </Dialog>
  )
}