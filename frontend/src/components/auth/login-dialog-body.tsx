"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormField,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import type { User } from "@/types"
import { LoadingIcon } from "@/components/shared/loading-icon"
import {
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogDescription,
  DrawerDialogFooter,
} from "@/components/shared/drawer-dialog"
import { useRequestSignIn, useVerifySignIn } from "@/hooks/use-auth"
import { getErrorMessage } from "@/lib/utils"
import { useCountdown } from "@/hooks/use-countdown"

type Step = "enter-email" | "enter-code"

export function LoginDialogBody({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState<User["email"]>("")
  const step: Step = email ? "enter-code" : "enter-email"

  return (
    <>
      {step === "enter-email" ? (
        <EnterEmailStep setEmail={setEmail} />
      ) : (
        <EnterCodeStep email={email} setEmail={setEmail} onLogin={onLogin} />
      )}
    </>
  )
}

function EnterEmailStep({ setEmail }: { setEmail: (email: string) => void }) {
  const { toast } = useToast()
  const { mutate: requestSignIn, isPending } = useRequestSignIn()

  const formSchema = z.object({
    email: z.string().email({
      message: "Please enter a valid email address.",
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
        <DrawerDialogTitle>Enter an email for alerts</DrawerDialogTitle>
        <DrawerDialogDescription>
          We&apos;ll check if you have an account and help you create one if you
          don’t.
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
  setEmail,
  onLogin,
}: {
  email: string
  setEmail: (email: string) => void
  onLogin: () => void
}) {
  const { toast } = useToast()
  const { mutate: verifySignIn, isPending: isVerifyPending } = useVerifySignIn()
  const { mutate: requestSignIn, isPending: isRequestPending } =
    useRequestSignIn()
  const { count, reset } = useCountdown(60)
  const pending = isVerifyPending || isRequestPending

  const formSchema = z.object({
    code: z.string().length(6, {
      message: "Please enter a 6-digit code.",
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    verifySignIn(
      { email, code: data.code },
      {
        onError: (error) => {
          toast({
            title: "Error",
            description: getErrorMessage(error),
          })
        },
        onSuccess: () => {
          onLogin()
        },
      }
    )
  }

  function handleResendCode() {
    requestSignIn(email, {
      onSuccess: () => {
        toast({
          title: "Code resent",
          description: "We've sent a new code to your email.",
        })
        reset()
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: getErrorMessage(error),
        })
      },
    })
  }

  function handleBack() {
    setEmail("")
  }

  return (
    <>
      <DrawerDialogHeader>
        <DrawerDialogTitle>You&apos;re almost signed in!</DrawerDialogTitle>
        <DrawerDialogDescription>
          Enter the code we sent to <span className="font-medium">{email}</span>{" "}
          to finish signing in.
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
                  {count === 0 ? (
                    <Button
                      className="p-0 h-auto underline text-[0.8rem]"
                      type="button"
                      variant={"link"}
                      onClick={handleResendCode}
                    >
                      resend code.
                    </Button>
                  ) : (
                    <span>resend in {count} seconds.</span>
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
