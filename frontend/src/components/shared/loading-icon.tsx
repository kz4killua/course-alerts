import { LoaderIcon } from "lucide-react"


export function LoadingIcon({
  size=14
} : {
  size?: number
}) {
  return (
    <LoaderIcon size={size} className="animate-spin" />
  )
}