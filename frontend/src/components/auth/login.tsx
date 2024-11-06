"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { useToast } from "@/hooks/use-toast"
import { requestSignIn, verifySignIn, updateAccount, getProfile } from "@/services/accounts"
import { setAccessToken, setRefreshToken } from "@/lib/tokens"

import { useEffect, useState } from "react"

import type { User } from "@/types"
import { useAuth } from "@/providers/auth-provider"
import { LoadingIcon } from "@/components/shared/loading-icon"


type Step = "enter-email" | "enter-code" | "enter-phone"


export function Login({
  onLogin,
} : {
  onLogin: () => void
}) {

  const [step, setStep] = useState<Step>()
  const [email, setEmail] = useState<User["email"]>("")
  const { user } = useAuth()
  const [loaded, setLoaded] = useState(false)


  useEffect(() => {
    if (loaded) return;

    if (user) {
      setEmail(user.email)
      setLoaded(true)
      if (user.phone) {
        onLogin()
      } else {
        setStep("enter-phone")
      }
    } else {
      setStep("enter-email")
    }
  }, [user, loaded, setLoaded, onLogin])


  return (
    <>
      {
        step === "enter-email" ? (
          <EnterEmailStep setStep={setStep} setEmail={setEmail} />
        ) : step === "enter-code" ? (
          <EnterCodeStep setStep={setStep} email={email} onLogin={onLogin} />
        ) : step === "enter-phone" ? (
          <EnterPhoneStep onLogin={onLogin} />
        ) : (
          <div className="flex items-center justify-center">
            <LoadingIcon />
          </div>
        )
      }
    </>
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
        description: error.response.data?.detail || "An error occurred. Please try again.",
      })
    })
    .finally(() => {
      setLoading(false)
    })
  }

  return (
    <>
      <LoginHeader>
        Enter an email for alerts
      </LoginHeader>

      <LoginDescription>
        We&apos;ll check if you have an account and help you create one if you don’t. 
      </LoginDescription>

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

          <LoginFooter>
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingIcon /> : "Continue"}
            </Button>
          </LoginFooter>
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
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const [wait, setWait] = useState(30)

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
      login(response.data)
      if (response.data.phone) {
        onLogin()
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
      setWait(60)
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
      <LoginHeader>
        You&apos;re almost signed in!
      </LoginHeader>

      <LoginDescription>
        Enter the code we sent to {email} to finish signing in. 
      </LoginDescription>

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
                  Didn&apos;t get the code? Check your Spam folder or{" "}

                  {wait === 0 ? (
                    <Button className="p-0 underline" type="button" variant={"link"} onClick={handleResendCode}>
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

          <LoginFooter>
            <Button type="button" variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingIcon /> : "Continue"}
            </Button>
          </LoginFooter>
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
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const formSchema = z.object({
    phone: z.string().regex(/^[0-9]{10}$/, {
      message: "Please enter a valid Canadian phone number (without the country code)."
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
    const phone = `+1${data.phone}`
    updateAccount(phone)
    .then((response) => {
      login(response.data)
    })
    .then(() => {
      onLogin()
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

  function handleSkip() {
    onLogin()
  }

  return (
    <>
      <LoginHeader>
        Do you want to add a phone number?
      </LoginHeader>

      <LoginDescription>
        This is optional, but could help you receive alerts quicker. 
      </LoginDescription>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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

          <LoginFooter>
            <Button variant={"secondary"} onClick={handleSkip}>
              Skip
            </Button>
            <Button type="submit" disabled={loading || form.getValues().phone.length === 0}>
              {loading ? <LoadingIcon /> : "Continue"}
            </Button>
          </LoginFooter>
        </form>
      </Form>
    </>
  )
}


function LoginDescription({
  children
} : {
  children: React.ReactNode
}) {
  return (
    <p className="text-sm text-muted-foreground">
      {children}
    </p>
  )
}


function LoginFooter({
  children
} : {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
      {children}
    </div>
  )
}


function LoginHeader({
  children
} : {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
      <h1 className="text-lg font-semibold leading-none tracking-tight">
        {children}
      </h1>
    </div>
  )
}
