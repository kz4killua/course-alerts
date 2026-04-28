"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
} from "@/components/shared/drawer-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Term, Section } from "@/types"
import { z } from "zod"
import { LoginDialogBody } from "@/components/auth/login-dialog-body"
import { LoadingIcon } from "@/components/shared/loading-icon"
import { LoadingDialogBody } from "@/components/shared/loading-dialog-body"
import { useUpdateUser, useUser } from "@/hooks/use-user"
import { useLogout } from "@/hooks/use-auth"
import { useCreateSubscriptions } from "@/hooks/use-subscriptions"
import { getErrorMessage } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState } from "react"

type Step = "authenticate" | "enter-phone" | "confirm-alerts"

export function ConfirmationDialog({
  open,
  setOpen,
  term,
  sections,
  setSelectedSections,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  term: Term
  sections: Section[]
  setSelectedSections: (sections: Set<Section["id"]>) => void
}) {
  const { data: user, isLoading } = useUser()
  const [completedPhoneStep, setCompletedPhoneStep] = useState(false)

  let step: Step | undefined
  if (isLoading) {
    step = undefined
  } else if (!user) {
    step = "authenticate"
  } else if (!completedPhoneStep && !user?.phone) {
    step = "enter-phone"
  } else {
    step = "confirm-alerts"
  }

  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
      <DrawerDialogContent>
        {step === "authenticate" ? (
          <LoginDialogBody onLogin={() => {}} />
        ) : step === "enter-phone" ? (
          <EnterPhoneDialogBody onExit={() => setCompletedPhoneStep(true)} />
        ) : step === "confirm-alerts" ? (
          <ConfirmationDialogBody
            setOpen={setOpen}
            term={term}
            sections={sections}
            setSelectedSections={setSelectedSections}
          />
        ) : (
          <LoadingDialogBody />
        )}
      </DrawerDialogContent>
    </DrawerDialog>
  )
}

function ConfirmationDialogBody({
  term,
  sections,
  setOpen,
  setSelectedSections,
}: {
  term: Term
  sections: Section[]
  setOpen: (open: boolean) => void
  setSelectedSections: (sections: Set<Section["id"]>) => void
}) {
  const { toast } = useToast()
  const { data: user } = useUser()
  const { mutate: logout } = useLogout()
  const { mutate: createSubscriptions, isPending } = useCreateSubscriptions()

  function handleSubmit() {
    createSubscriptions(
      sections.map((section) => section.id),
      {
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
        },
      }
    )
  }

  function handleChangeEmail() {
    logout()
  }

  return (
    <>
      <DrawerDialogHeader>
        <DrawerDialogTitle>Confirm alerts</DrawerDialogTitle>
        <DrawerDialogDescription>
          You are about to sign up for alerts to {sections.length}{" "}
          {sections.length === 1 ? "section" : "sections"} in {term.term_desc}.
        </DrawerDialogDescription>
      </DrawerDialogHeader>
      <div className="mt-4 gap-2 flex flex-col overflow-x-hidden">
        {user ? (
          <Button className="w-full" onClick={handleSubmit}>
            <span className="truncate">
              {isPending ? <LoadingIcon /> : `Continue as ${user.email}`}
            </span>
          </Button>
        ) : (
          <Button className="w-full" disabled>
            <LoadingIcon />
          </Button>
        )}
        <Button
          className="w-full"
          variant="secondary"
          onClick={handleChangeEmail}
        >
          Use a different email
        </Button>
      </div>
    </>
  )
}

function EnterPhoneDialogBody({ onExit }: { onExit: () => void }) {
  const { toast } = useToast()
  const { mutate: updateUser, isPending } = useUpdateUser()

  const formSchema = z.object({
    phone: z.string().regex(/^[0-9]{10}$/, {
      message: "Please enter a valid Canadian phone number e.g. 9055555555.",
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    updateUser(
      { phone: `+1${data.phone}` },
      {
        onError: (error) => {
          toast({
            title: "Error",
            description: getErrorMessage(error),
          })
        },
        onSuccess: () => {
          onExit()
        },
      }
    )
  }

  function handleSkip() {
    onExit()
  }

  const phone = useWatch({ control: form.control, name: "phone" })

  return (
    <>
      <DrawerDialogHeader>
        <DrawerDialogTitle>
          Do you want to add a phone number?
        </DrawerDialogTitle>
        <DrawerDialogDescription>
          This is optional, but could help you receive alerts quicker.
        </DrawerDialogDescription>
      </DrawerDialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-x-3">
                    <span className="text-sm text-muted-foreground">+1</span>
                    <Input type="tel" placeholder="9055555555" {...field} />
                  </div>
                </FormControl>
                <FormDescription>
                  Enter a valid Canadian phone number. Only Canadian phone
                  numbers are supported at this time.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <DrawerDialogFooter>
            <Button type="button" variant={"secondary"} onClick={handleSkip}>
              Skip
            </Button>
            <Button type="submit" disabled={isPending || phone.length === 0}>
              {isPending ? <LoadingIcon /> : "Continue"}
            </Button>
          </DrawerDialogFooter>
        </form>
      </Form>
    </>
  )
}
