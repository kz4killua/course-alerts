"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import type { User } from "@/types"
import { LoadingIcon } from "@/components/shared/loading-icon"
import { DrawerDialogHeader, DrawerDialogTitle, DrawerDialogDescription, DrawerDialogContent, DrawerDialogFooter } from "@/components/shared/drawer-dialog"
import { useUser, useUpdateUser } from "@/hooks/use-user"
import { useRequestSignIn, useVerifySignIn } from "@/hooks/use-auth"
import { getErrorMessage } from "@/lib/utils"
import { LoadingDialogContent } from "@/components/shared/loading-dialog-content"
import { useQueryClient } from "@tanstack/react-query"
import { DrawerDialog } from "@/components/shared/drawer-dialog"


type Step = "enter-email" | "enter-code" | "enter-phone"


export function LoginDialog() {
  const [open, setOpen] = useState(true)

  return (
    <DrawerDialog open={open} onOpenChange={setOpen} isDismissible={false}>
      <LoginDialogContent onLogin={() => setOpen(false)} />
    </DrawerDialog>
  );
}

export function LoginDialogContent({
  onLogin,
} : {
  onLogin: () => void
}) {

  const [step, setStep] = useState<Step>()
  const [email, setEmail] = useState<User["email"]>("")
  const { data: user, isLoading } = useUser()

  useEffect(() => {
    if (user) {
      setEmail(user.email)
      if (user.phone) {
        onLogin()
      } else {
        setStep("enter-phone")
      }
    } else {
      setStep("enter-email")
    }
  }, [user, onLogin])

  if (isLoading) {
    return (
      <LoadingDialogContent />
    )
  }

  return (
    <DrawerDialogContent>
      {
        step === "enter-email" ? (
          <EnterEmailStep setStep={setStep} setEmail={setEmail} />
        ) : step === "enter-code" ? (
          <EnterCodeStep setStep={setStep} email={email} onLogin={onLogin} />
        ) : step === "enter-phone" ? (
          <EnterPhoneStep onLogin={onLogin} />
        ) : (
          null
        )
      }
    </DrawerDialogContent>
  )
}


function EnterEmailStep({
  setEmail,
  setStep
} : {
  setEmail: (email: string) => void,
  setStep: (step: Step) => void
}) {

  const { toast } = useToast()
  const { mutate: requestSignIn, isPending } = useRequestSignIn()

  const formSchema = z.object({
    email: z.string().email({
      message: "Please enter a valid email address."
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    requestSignIn(data.email, {
      onSuccess: () => {
        setEmail(data.email)
        setStep("enter-code")
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: getErrorMessage(error),
        })
      },
    })
  }

  return (
    <>
      <DrawerDialogHeader>
        <DrawerDialogTitle>
          Enter an email for alerts
        </DrawerDialogTitle>
        <DrawerDialogDescription>
          We&apos;ll check if you have an account and help you create one if you don’t.
        </DrawerDialogDescription>
      </DrawerDialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <DrawerDialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <LoadingIcon /> : "Continue"}
            </Button>
          </DrawerDialogFooter>
        </form>
      </Form>
    </>
  )
}


function EnterCodeStep({
  email,
  setStep,
  onLogin,
} : {
  email: string,
  setStep: (step: Step) => void,
  onLogin: () => void
}) {

  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { mutate: verifySignIn, isPending: isVerifyPending } = useVerifySignIn()
  const { mutate: requestSignIn, isPending: isRequestPending } = useRequestSignIn()
  const [wait, setWait] = useState(60)
  const pending = isVerifyPending || isRequestPending

  const formSchema = z.object({
    code: z.string().length(6, {
      message: "Please enter a 6-digit code."
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    verifySignIn({ email, code: data.code }, {
      onError: (error) => {
        toast({
          title: "Error",
          description: getErrorMessage(error),
        })
      },
      onSuccess: () => {
        const user = queryClient.getQueryData<User>(["user"])
        if (user?.phone) {
          onLogin()
        } else {
          setStep("enter-phone")
        }
      }
    })
  }

  function handleResendCode() {
    requestSignIn(email, {
      onSuccess: () => {
        toast({
          title: "Code resent",
          description: "We've sent a new code to your email.",
        })
        setWait(60)
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: getErrorMessage(error),
        })
      }
    })
  }

  function handleBack() {
    setStep("enter-email")
  }

  useEffect(() => {
    if (wait === 0) return;
    const timer = setTimeout(() => {
      setWait(wait - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [wait, setWait])

  return (
    <>
      <DrawerDialogHeader>
        <DrawerDialogTitle>
          You&apos;re almost signed in!
        </DrawerDialogTitle>
        <DrawerDialogDescription>
          Enter the code we sent to {email} to finish signing in.
        </DrawerDialogDescription>
      </DrawerDialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  Didn&apos;t get the code? Check your Spam folder or&nbsp;
                  {wait === 0 ? (
                    <Button className="p-0 h-auto underline text-[0.8rem]" type="button" variant={"link"} onClick={handleResendCode}>
                      resend code.
                    </Button>
                  ) : (
                    <span>resend in {wait} seconds.</span>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <DrawerDialogFooter>
            <Button type="button" variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <LoadingIcon /> : "Continue"}
            </Button>
          </DrawerDialogFooter>
        </form>
      </Form>
    </>
  )
}


function EnterPhoneStep({
  onLogin,
} : {
  onLogin: () => void
}) {

  const { toast } = useToast()
  const { mutate: updateUser, isPending } = useUpdateUser()

  const formSchema = z.object({
    phone: z.string().regex(/^[0-9]{10}$/, {
      message: "Please enter a valid Canadian phone number e.g. 9055555555."
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    updateUser({ phone: `+1${data.phone}` }, {
      onError: (error) => {
        toast({
          title: "Error",
          description: getErrorMessage(error),
        })
      },
    })
  }

  function handleSkip() {
    onLogin()
  }

  const phone = form.watch("phone")

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
                  Enter a valid Canadian phone number. Only Canadian phone numbers are supported at this time.
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
