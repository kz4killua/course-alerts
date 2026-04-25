"use client"

import { Button } from "@/components/ui/button"
import { DrawerDialog, DrawerDialogContent, DrawerDialogDescription, DrawerDialogHeader, DrawerDialogTitle } from "@/components/shared/drawer-dialog"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import type { Term, Section } from "@/types"
import { LoginDialogContent } from "@/components/auth/login-dialog"
import { LoadingIcon } from "@/components/shared/loading-icon"
import { LoadingDialogContent } from "@/components/shared/loading-dialog-content"
import { useUser } from "@/hooks/use-user"
import { useLogout } from "@/hooks/use-auth"
import { useCreateSubscriptions } from "@/hooks/use-subscriptions"
import { getErrorMessage } from "@/lib/utils"


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
  const { data: user, isLoading } = useUser()

  useEffect(() => {
    if (isLoading) {
      setStep(undefined)
      return
    }

    if (user) {
      setStep("confirm-alerts")
    } else {
      setStep("authenticate")
    }
  }, [user, isLoading])

  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
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
  const { data: user } = useUser()
  const { mutate: logout } = useLogout()
  const { mutate: createSubscriptions, isPending } = useCreateSubscriptions()

  function handleSubmit() {
    createSubscriptions(sections.map(section => section.id), {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "You've successfully signed up for alerts!",
        })
        setOpen(false)
        setSelectedSections(new Set())
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: getErrorMessage(error),
        })
      }
    })
  }

  function handleChangeEmail() {
    logout()
    setStep("authenticate")
  }

  return (
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
                { isPending ? <LoadingIcon /> : `Continue as ${user.email}` }
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
  )
}
