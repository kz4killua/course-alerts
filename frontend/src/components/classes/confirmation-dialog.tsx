"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormField, FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { useToast } from "@/hooks/use-toast"
import { requestSignIn, verifySignIn, updateAccount, getProfile } from "@/services/accounts"
import { setAccessToken, setRefreshToken } from "@/lib/tokens"
import { createAlertSubscription } from "@/services/alerts"

import { useEffect, useState } from "react"
import { LoaderIcon } from "lucide-react"

import type { Term, Section, User } from "@/types"


type Step = "enter-email" | "enter-code" | "enter-phone" | "confirm-alerts"


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
  const [email, setEmail] = useState<User["email"]>("")

  useEffect(() => {
    getProfile()
    .then((response) => {
      setEmail(response.data.email)
      if (response.data.phone) {
        setStep("confirm-alerts")
      } else {
        setStep("enter-phone")
      }
    })
    .catch(() => {
      setStep("enter-email")
    })
  }, [])

  function handleOpenChange(open: boolean) {
    setOpen(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {
          step === "enter-email" ? (
            <EmailConfirmation 
              setStep={setStep} 
              setEmail={setEmail}
            />
          ) : step === "enter-code" ? (
            <EmailVerificationCodeConfirmation 
              setStep={setStep}
              email={email}
            />
          ) : step === "enter-phone" ? (
            <PhoneNumberConfirmation 
              setStep={setStep}
            />
          ) : step === "confirm-alerts" ? (
            <AlertsConfirmation 
              setStep={setStep}
              setOpen={setOpen}
              email={email}
              term={term}
              sections={sections}
            />
          ) : (
            <div className="flex items-center justify-center">
              <LoaderIcon />
            </div>
          )
        }
      </DialogContent>
    </Dialog>
  )
}


function EmailConfirmation({
  setEmail,
  setStep
} : {
  setEmail: (email: string) => void,
  setStep: (step: Step) => void
}) {

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const formSchema = z.object({
    email: z.string().email({
      message: "Please enter a valid email address"
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true)
    requestSignIn(data.email)
    .then(() => {
      setEmail(data.email)
      setStep("enter-code")
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

  return (
    <>
      <DialogHeader>
        <DialogTitle>Enter an email for alerts</DialogTitle>
      </DialogHeader>

      <DialogDescription>
        We&apos;ll check if you have an account and help you create one if you don’t. 
      </DialogDescription>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  It&apos;s best to use an email you check often.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingIcon /> : "Continue"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}


function EmailVerificationCodeConfirmation({
  email,
  setStep,
} : {
  email: string,
  setStep: (step: Step) => void
}) {

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const formSchema = z.object({
    code: z.string().length(6, {
      message: "Please enter a 6-digit code"
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true)
    verifySignIn(email, data.code)
    .then((response) => {
      setAccessToken(response.data.access)
      setRefreshToken(response.data.refresh)
    })
    .then(getProfile)
    .then(response => {
      if (response.data.phone) {
        setStep("confirm-alerts")
      } else {
        setStep("enter-phone")
      }
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

  function handleResendCode() {
    setLoading(true)
    requestSignIn(email)
    .then(() => {
      toast({
        title: "Code resent",
        description: "We've sent a new code to your email.",
      })
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

  function handleBack() {
    setStep("enter-email")
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>You're almost signed in!</DialogTitle>
      </DialogHeader>

      <DialogDescription>
        Enter the code we sent to {email} to finish signing in. 
      </DialogDescription>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input placeholder="Code" {...field} />
                </FormControl>
                <FormDescription>
                  Didn&apos;t get the code? <Button className="p-0 underline" type="button" variant={"link"} onClick={handleResendCode}>Resend code.</Button>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="mt-4">
            <Button type="button" variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingIcon /> : "Continue"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}


function PhoneNumberConfirmation({
  setStep,
} : {
  setStep: (step: Step) => void
}) {

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const formSchema = z.object({
    phone: z.string().min(10, {
      message: "Please enter a valid phone number"
    }).max(15, {
      message: "Please enter a valid phone number"
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true)
    updateAccount(data.phone)
    .then(() => {
      setStep("confirm-alerts")
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

  function handleSkip() {
    setStep("confirm-alerts")
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Do you want to add a phone number?</DialogTitle>
      </DialogHeader>

      <DialogDescription>
        This is optional, but could help you receive alerts quicker. 
      </DialogDescription>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+1234567890" {...field} />
                </FormControl>
                <FormDescription>
                  Enter your phone number including the country code.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="mt-4">
            <Button variant={"secondary"} onClick={handleSkip}>
              Skip
            </Button>
            <Button type="submit" disabled={loading || form.getValues().phone.length === 0}>
              {loading ? <LoadingIcon /> : "Continue"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}


function AlertsConfirmation({
  email,
  term,
  sections,
  setStep,
  setOpen
} : {
  email: string,
  term: Term,
  sections: Section[],
  setStep: (step: Step) => void,
  setOpen: (open: boolean) => void
}) {

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

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
    setStep("enter-email")
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Confirm alerts</DialogTitle>
      </DialogHeader>

      <DialogDescription>
        You are about to sign up for alerts to {sections.length} {sections.length === 1 ? "section" : "sections"} in {term.term_desc}.
      </DialogDescription>

      <div className="mt-4 gap-2 flex flex-col">
        <Button className="w-full" onClick={handleSubmit}>
          { loading ? <LoadingIcon /> : `Continue as ${email}` }
        </Button>
        <Button className="w-full" variant="secondary" onClick={handleChangeEmail}>
          Use a different email
        </Button>
      </div>
    </>
  )
}


function LoadingIcon() {
  return (
    <LoaderIcon size={14} className="animate-spin" />
  )
}