"use client"

import { SearchBar } from "@/components/shared/search-bar"
import { ItemDisplay, ItemDisplaySkeleton } from "@/components/shared/item-display"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { deleteSubscriptions, listSubscriptions } from "@/services/alerts"
import { Subscription } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { DrawerDialog, DrawerDialogContent, DrawerDialogDescription, DrawerDialogHeader, DrawerDialogTitle, DrawerDialogTrigger, DrawerDialogFooter } from "@/components/shared/drawer-dialog"
import { LoadingIcon } from "@/components/shared/loading-icon"
import { PageLayout } from "@/components/shared/page-layout"


export default function Page() {

  const [query, setQuery] = useState("")
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  
  useEffect(() => {
    setLoading(true)
    listSubscriptions()
    .then(response => {
      setSubscriptions(response.data)
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
  }, [toast])

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
        <SubscriptionsList 
          query={query} 
          loading={loading} 
          subscriptions={subscriptions} 
          setSubscriptions={setSubscriptions}
        />
      </main>
    </PageLayout>
  )
}


function SubscriptionsList({
  query,
  subscriptions,
  loading,
  setSubscriptions
} : {
  query: string,
  subscriptions: Subscription[],
  loading: boolean,
  setSubscriptions: (subscriptions: Subscription[]) => void
}) {

  // Filter the subscriptions (course + CRN) based on the query
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const tag = subscription.section.course + subscription.section.course_reference_number
    return tag.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div className="mt-10">
      <div className="text-sm h-8 flex items-center">
        {
          loading ? (
            <Skeleton className="h-4 w-full" />
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
          loading ? (
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
                <DeletionDialog 
                  subscription={subscription}
                  subscriptions={subscriptions}
                  setSubscriptions={setSubscriptions}
                />
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
  subscriptions,
  setSubscriptions,
} : {
  subscription: Subscription,
  subscriptions: Subscription[],
  setSubscriptions: (subscriptions: Subscription[]) => void
}) {

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  function handleDelete() {
    setLoading(true)
    deleteSubscriptions([subscription.id])
    .then(() => {
      setSubscriptions(subscriptions.filter(s => s.id !== subscription.id))
    })
    .then(() => {
      toast({
        title: "Success",
        description: "You will no longer receive alerts for this class.",
      })
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
          <Button variant="ghost" disabled={loading} onClick={handleClose}>
            Cancel
          </Button>
          <Button variant={"destructive"} onClick={handleDelete} disabled={loading}>
            {loading ? <LoadingIcon /> : "Delete"}
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  )
}