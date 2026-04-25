"use client"

import clsx from "clsx"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { DrawerDialog, DrawerDialogContent, DrawerDialogDescription, DrawerDialogFooter, DrawerDialogHeader, DrawerDialogTitle, DrawerDialogTrigger } from "@/components/shared/drawer-dialog"
import type { Term, Course, Section } from "@/types"
import { formatMeetingTimes } from "@/lib/utils"
import { ConfirmationDialog } from "./confirmation-dialog"
import { ItemDisplay, ItemDisplaySkeleton } from "@/components/shared/item-display"
import { useSections } from "@/hooks/use-sections"


export function SectionsDialog({
  term,
  course, 
} : {
  term: Term,
  course: Course,
}) {
  
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const { data: sections = [], isLoading } = useSections(course.subject_course, term.term, open)
  const [selectedSections, setSelectedSections] = useState<Set<Section["id"]>>(new Set())
  
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
    <DrawerDialog open={open} onOpenChange={handleOpenChange}>

      <DrawerDialogTrigger asChild>
        <div>
          <ItemDisplay
            key={course.subject_course}
            topLeft={course.course_title}
            bottomLeft={course.subject_course}
            bottomRight={term.term_desc}
          />
        </div>
      </DrawerDialogTrigger>

      <DrawerDialogContent className="p-0 max-w-5xl min-h-[95dvh] flex flex-col overflow-y-hidden">
        
        <DrawerDialogHeader className="bg-background px-10 pt-5 sm:pt-10">
          <DrawerDialogTitle className="text-3xl">
            {course.subject_course} - {course.course_title}
          </DrawerDialogTitle>
          <DrawerDialogDescription className="hidden">
            Choose the classes to get alerts for.
          </DrawerDialogDescription>
        </DrawerDialogHeader>


        <div className="px-10 overflow-y-auto grow">

          <div className="text-sm h-4">
            {
              isLoading ? (
                <Skeleton className="h-4 w-full" />
              ) : (
              <p className="text-muted-foreground text-center sm:text-left">
                We found {numSections} {numSections === 1 ? "section" : "sections"} for this course.
              </p>
              )
            }
          </div>

          <div className="mt-8">
            <p className="mb-4 font-bold">
              Choose the classes to get alerts for.
            </p>
            <div className="flex flex-wrap gap-4">
              {
                isLoading ? (
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
                isLoading ? (
                  <>
                    <ItemDisplaySkeleton />
                    <ItemDisplaySkeleton />
                    <ItemDisplaySkeleton />
                    <ItemDisplaySkeleton />
                    <ItemDisplaySkeleton />
                  </>
                ) : (
                  sections.map(section => (
                    <div 
                      className="flex items-center justify-center gap-3" 
                      key={section.id}
                      onClick={() => toggleSectionSelection(section)}
                    >
                      <Checkbox id={section.id} checked={selectedSections.has(section.id)} />
                      <ItemDisplay 
                        topLeft={section.schedule_type_description}
                        topRight={`CRN ${section.course_reference_number}`}
                        bottomLeft={formatMeetingTimes(section.meeting_times)}
                        className={clsx(
                          selectedSections.has(section.id) && "bg-accent border-primary"
                        )}
                      />
                    </div>
                  ))
                )
              }
            </div>
          </div>
        </div>

        <DrawerDialogFooter className="bg-background px-10 pb-5 sm:pb-10">
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
        </DrawerDialogFooter>

        <ConfirmationDialog
          open={confirmationDialogOpen}
          setOpen={setConfirmationDialogOpen}
          term={term}
          sections={sections.filter(
            section => selectedSections.has(section.id)
          )}
          setSelectedSections={setSelectedSections}
        />

      </DrawerDialogContent>
    </DrawerDialog>
  )
}