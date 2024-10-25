"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { useToast } from "@/hooks/use-toast"
import { createAlertSubscription } from "@/services/alerts"

import { useEffect, useState } from "react"

import type { Term, Section, User } from "@/types"
import { useAuth } from "@/providers/auth-provider"
import { Login } from "@/components/auth/login"
import { LoadingIcon } from "@/components/shared/loading-icon"
import { LoginRequired } from "@/components/auth/login-required"


type Step = "authenticate" | "confirm-alerts"


export function ConfirmationDialog({ 
  open, 
  setOpen,
  term,
  sections
} : {
  open: boolean,
  setOpen: (open: boolean) => void,
  term: Term,
  sections: Section[]
}) {

  const [step, setStep] = useState<Step>()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      setStep("confirm-alerts")
    } else {
      setStep("authenticate")
    }
  }, [user])

  function handleOpenChange(open: boolean) {
    setOpen(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>

        <div className="hidden">
          <DialogHeader>
            <DialogTitle>Sign in your account</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Sign in to your account to continue.
          </DialogDescription>
        </div>

        {
          step === "authenticate" ? (
            <Login onLogin={() => setStep("confirm-alerts")} />
          ) : step === "confirm-alerts" ? (
            <AlertsConfirmation 
              setStep={setStep}
              setOpen={setOpen}
              term={term}
              sections={sections}
            />
          ) : (
            <div className="flex items-center justify-center">
              <LoadingIcon />
            </div>
          )
        }
      </DialogContent>
    </Dialog>
  )
}


function AlertsConfirmation({
  term,
  sections,
  setStep,
  setOpen
} : {
  term: Term,
  sections: Section[],
  setStep: (step: Step) => void,
  setOpen: (open: boolean) => void
}) {

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { user, logout } = useAuth()


  function handleSubmit() {
    setLoading(true)
    createAlertSubscription(term.term, sections.map(section => section.course_reference_number))
    .then(() => {
      toast({
        title: "Success",
        description: "You've successfully signed up for alerts!",
      })
      setOpen(false)
    })
    .catch(error => {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
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
      <DialogHeader>
        <DialogTitle>Confirm alerts</DialogTitle>
      </DialogHeader>

      <DialogDescription>
        You are about to sign up for alerts to {sections.length} {sections.length === 1 ? "section" : "sections"} in {term.term_desc}.
      </DialogDescription>

      <div className="mt-4 gap-2 flex flex-col">
        {
          user ? (
            <Button className="w-full" onClick={handleSubmit}>
              { loading ? <LoadingIcon /> : `Continue as ${user.email}` }
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
    </LoginRequired>
  )
}