"use client"

import { SearchBar } from "@/components/shared/search-bar"
import { ItemDisplay, ItemDisplaySkeleton } from "@/components/shared/item-display"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { Subscription } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { DrawerDialog, DrawerDialogContent, DrawerDialogDescription, DrawerDialogHeader, DrawerDialogTitle, DrawerDialogTrigger, DrawerDialogFooter } from "@/components/shared/drawer-dialog"
import { LoadingIcon } from "@/components/shared/loading-icon"
import { PageLayout } from "@/components/shared/page-layout"
import { useDeleteSubscriptions, useSubscriptions } from "@/hooks/use-subscriptions"
import { getErrorMessage } from "@/lib/utils"


export default function Page() {
  const [query, setQuery] = useState("")

  return (
    <PageLayout>
      <main className="pt-10">
        <h1 className="text-3xl font-semibold mb-6">
          Your Subscriptions
        </h1>
        <SearchBar
          placeholder="Search your alerts..."
          onChange={e => setQuery(e.target.value)}
        />
        <SubscriptionsList query={query} />
      </main>
    </PageLayout>
  )
}


function SubscriptionsList({
  query,
}: {
  query: string,
}) {
  const { data: subscriptions, isPending, isError } = useSubscriptions()
  const filteredSubscriptions = subscriptions ? filterSubscriptions(subscriptions, query) : []

  return (
    <div className="mt-10">
      <div className="text-sm h-8 flex items-center">
        {
          isPending ? (
            <Skeleton className="h-4 w-full" />
          ) : isError ? (
            <p className="text-muted-foreground">
              An error occurred while fetching your subscriptions. Please try again later.
            </p>
          ) : query.length > 0 ? (
            <p className="text-muted-foreground">
              Found {filteredSubscriptions.length} subscriptions matching &ldquo;{query}&rdquo;
            </p>
          ) : (
            <p className="text-muted-foreground">
              You are currently receiving alerts for {subscriptions.length} {subscriptions.length === 1 ? "class" : "classes"}.
            </p>
          )
        }
      </div>
      <div className="mt-4 space-y-4">
        {
          isPending ? (
            <>
              <ItemDisplaySkeleton />
              <ItemDisplaySkeleton />
              <ItemDisplaySkeleton />
              <ItemDisplaySkeleton />
            </>
          ) : (
            filteredSubscriptions.map(subscription => (
              <div key={subscription.section.id} className="flex items-center justify-center gap-3">
                <ItemDisplay
                  topLeft={subscription.section.course}
                  bottomLeft={subscription.section.schedule_type_description}
                  topRight={`CRN ${subscription.section.course_reference_number}`}
                  bottomRight={`${subscription.section.term}`}
                  className="cursor-auto"
                />
                <DeletionDialog subscription={subscription} />
              </div>
            ))
          )
        }
      </div>
    </div>
  )
}


function DeletionDialog({
  subscription,
}: {
  subscription: Subscription,
}) {

  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { mutate: deleteSubscriptions, isPending } = useDeleteSubscriptions()

  function handleDelete() {
    deleteSubscriptions([subscription.id], {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "You will no longer receive alerts for this class.",
        })
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: getErrorMessage(error),
        })
      }
    })
  }

  function handleClose() {
    setOpen(false)
  }

  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
      <DrawerDialogTrigger asChild>
        <Button variant={"ghost"} className="p-1">
          <Trash2Icon size={18} />
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader>
          <DrawerDialogTitle>Delete subscription?</DrawerDialogTitle>
          <DrawerDialogDescription>
            Are you sure? You will no longer receive alerts for this class.
          </DrawerDialogDescription>
        </DrawerDialogHeader>
        <DrawerDialogFooter>
          <Button variant="ghost" disabled={isPending} onClick={handleClose}>
            Cancel
          </Button>
          <Button variant={"destructive"} onClick={handleDelete} disabled={isPending}>
            {isPending ? <LoadingIcon /> : "Delete"}
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  )
}

function filterSubscriptions(subscriptions: Subscription[], query: string) {
  return subscriptions.filter(subscription => {
    const tag = subscription.section.course + subscription.section.course_reference_number
    return tag.toLowerCase().includes(query.toLowerCase())
  })
}