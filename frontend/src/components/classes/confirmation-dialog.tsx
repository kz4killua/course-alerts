"use client"

import { Button } from "@/components/ui/button"
import { DrawerDialog, DrawerDialogContent, DrawerDialogDescription, DrawerDialogHeader, DrawerDialogTitle } from "@/components/shared/drawer-dialog"
import { useToast } from "@/hooks/use-toast"
import { createSubscriptions } from "@/services/alerts"
import { useEffect, useState } from "react"
import type { Term, Section } from "@/types"
import { useAuth } from "@/providers/auth-provider"
import { LoginDialogContent } from "@/components/auth/login-dialog-content"
import { LoadingIcon } from "@/components/shared/loading-icon"
import { LoginRequired } from "@/components/auth/login-required"
import { LoadingDialogContent } from "@/components/shared/loading-dialog-content"


type Step = "authenticate" | "confirm-alerts"


export function ConfirmationDialog({ 
  open, 
  setOpen,
  term,
  sections,
  setSelectedSections
} : {
  open: boolean,
  setOpen: (open: boolean) => void,
  term: Term,
  sections: Section[],
  setSelectedSections: (sections: Set<Section["id"]>) => void
}) {

  const [step, setStep] = useState<Step>()
  const { user } = useAuth()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return

    setLoaded(true)
    if (user) {
      setStep("confirm-alerts")
    } else {
      setStep("authenticate")
    }
  }, [user, loaded])

  function handleOpenChange(open: boolean) {
    setOpen(open)
  }

  return (
    <DrawerDialog open={open} onOpenChange={handleOpenChange}>
      {
        step === "authenticate" ? (
          <LoginDialogContent onLogin={() => setStep("confirm-alerts")} />
        ) : step === "confirm-alerts" ? (
          <ConfirmationDialogContent 
            setStep={setStep}
            setOpen={setOpen}
            term={term}
            sections={sections}
            setSelectedSections={setSelectedSections}
          />
        ) : (
          <LoadingDialogContent />
        )
      }
    </DrawerDialog>
  )
}


function ConfirmationDialogContent({
  term,
  sections,
  setStep,
  setOpen,
  setSelectedSections
} : {
  term: Term,
  sections: Section[],
  setStep: (step: Step) => void,
  setOpen: (open: boolean) => void,
  setSelectedSections: (sections: Set<Section["id"]>) => void
}) {

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { user, logout } = useAuth()


  function handleSubmit() {
    setLoading(true)
    createSubscriptions(sections.map(section => section.id))
    .then(() => {
      toast({
        title: "Success",
        description: "You've successfully signed up for alerts!",
      })
      setOpen(false)
      setSelectedSections(new Set())
    })
    .catch(error => {
      toast({
        title: "Error",
        description: error.response.data?.detail || "An error occurred. Please try again.",
      })
    })
    .finally(() => {
      setLoading(false)
    })
  }

  function handleChangeEmail() {
    logout()
    setStep("authenticate")
  }

  return (
    <LoginRequired>
      <DrawerDialogContent>
        <DrawerDialogHeader>
          <DrawerDialogTitle>Confirm alerts</DrawerDialogTitle>
          <DrawerDialogDescription>
            You are about to sign up for alerts to {sections.length} {sections.length === 1 ? "section" : "sections"} in {term.term_desc}.
          </DrawerDialogDescription>
        </DrawerDialogHeader>
        <div className="mt-4 gap-2 flex flex-col overflow-x-hidden">
          {
            user ? (
              <Button className="w-full" onClick={handleSubmit}>
                <span className="truncate">
                  { loading ? <LoadingIcon /> : `Continue as ${user.email}` }
                </span>
              </Button>
            ) : (
              <Button className="w-full" disabled>
                <LoadingIcon />
              </Button>
            )
          }
          <Button className="w-full" variant="secondary" onClick={handleChangeEmail}>
            Use a different email
          </Button>
        </div>
      </DrawerDialogContent>
    </LoginRequired>
  )
}