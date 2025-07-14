"use client"

import { SearchBar } from "@/components/shared/search-bar"
import { ItemDisplay, CourseDisplaySkeleton } from "@/components/shared/item-display"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { deleteAlertSubscriptions, listAlertSubscriptions } from "@/services/alerts"
import { Section } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { LoadingIcon } from "@/components/shared/loading-icon"
import { PageLayout } from "@/components/shared/page-layout"


export default function Page() {

  const [query, setQuery] = useState("")
  const [subscriptions, setSubscriptions] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  
  useEffect(() => {
    setLoading(true)
    listAlertSubscriptions()
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
        <SearchBar placeholder="Search your alerts..." onChange={setQuery} />
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
  subscriptions: Section[],
  loading: boolean,
  setSubscriptions: (subscriptions: Section[]) => void
}) {

  // Filter the subscriptions (course + CRN) based on the query
  const filteredSubscriptions = subscriptions.filter(section => {
    const tag = section.course + section.course_reference_number
    return tag.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div className="mt-10">
      <div className="text-sm h-8 flex items-center">
        {
          loading ? (
            <Skeleton className="h-4 w-full" />
          ) : query.length > 0 ? (
            `Found ${filteredSubscriptions.length} subscriptions matching "${query}"`
          ) : (
            `You are currently receiving alerts for ${subscriptions.length} ${subscriptions.length === 1 ? "class" : "classes"}.`
          )
        }
      </div>
      <div className="mt-4 space-y-4">
        {
          loading ? (
            <>
              <CourseDisplaySkeleton />
              <CourseDisplaySkeleton />
              <CourseDisplaySkeleton />
              <CourseDisplaySkeleton />
            </>
          ) : (
            filteredSubscriptions.map(section => (
              <div key={section.id} className="flex items-center justify-center gap-3">
                <ItemDisplay
                  topLeft={section.course}
                  bottomLeft={section.schedule_type_description}
                  topRight={`CRN ${section.course_reference_number}`}
                  bottomRight={`${section.term}`}
                  className="cursor-auto"
                />
                <DeletionDialog 
                  section={section}
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
  section,
  subscriptions,
  setSubscriptions,
} : {
  section: Section,
  subscriptions: Section[],
  setSubscriptions: (subscriptions: Section[]) => void
}) {

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  function handleDelete() {
    setLoading(true)
    deleteAlertSubscriptions(section.term, [section.course_reference_number])
    .then(() => {
      setSubscriptions(subscriptions.filter(s => s.id !== section.id))
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="p-1">
          <Trash2Icon size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete subscription?</DialogTitle>
          <DialogDescription>
            Are you sure? You will no longer receive alerts for this class.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" disabled={loading} onClick={handleClose}>
            Cancel
          </Button>
          <Button variant={"destructive"} onClick={handleDelete} disabled={loading}>
            {loading ? <LoadingIcon /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}