"use client"

import clsx from "clsx"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Term, Course, Section } from "@/types"
import { formatMeetingTimes } from "@/lib/utils"
import { ConfirmationDialog } from "./confirmation-dialog"
import { useState } from "react"
import { CourseDisplay, CourseDisplaySkeleton } from "@/components/shared/course-display"


export function SectionsDialog({
  selectedTerm,
  selectedCourse, 
  setSelectedCourse,
  selectedCourseSections,
  setSelectedCourseSections,
  selectedSections,
  setSelectedSections
} : {
  selectedTerm: Term | undefined,
  selectedCourse: Course | undefined,
  setSelectedCourse: (course: Course | undefined) => void,
  selectedCourseSections: Section[],
  setSelectedCourseSections: (sections: Section[]) => void,
  selectedSections: Set<Section["id"]>,
  setSelectedSections: (sections: Set<Section["id"]>) => void
}) {

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  
  const open = selectedCourse !== undefined

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSelectedCourse(undefined)
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

  function selectAllSections() {
    setSelectedSections(
      new Set(selectedCourseSections.map(section => section.id))
    )
  }

  function clearSelectedSections() {
    setSelectedSections(new Set())
  }

  function selectAllSectionsOfType(type: Section["schedule_type_description"]) {
    setSelectedSections(new Set(
      selectedCourseSections.filter(
        section => section.schedule_type_description === type
      ).map(section => section.id)
    ))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-full max-w-full sm:max-w-5xl sm:max-h-[calc(100%-1rem)] p-0 flex flex-col overflow-y-hidden">
        
        <DialogHeader className="bg-background px-10 pt-10">
          <DialogTitle className="text-3xl">
            {selectedCourse?.subject_course} - {selectedCourse?.course_title}
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
                  selectedCourseSections.map(section => (
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
            onClick={() => setConfirmationDialogOpen(true)}
          >
            Create alerts
          </Button>
        </DialogFooter>

        {
          selectedTerm && (
            <ConfirmationDialog
              open={confirmationDialogOpen}
              setOpen={setConfirmationDialogOpen}
              term={selectedTerm}
              sections={selectedCourseSections.filter(
                section => selectedSections.has(section.id)
              )}
            />
          )
        }

      </DialogContent>
    </Dialog>
  )
}