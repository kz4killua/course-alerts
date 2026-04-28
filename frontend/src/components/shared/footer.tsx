import { FEEDBACK_URL, IFEANYI_URL } from "@/lib/constants"
import { UnderlinedLink } from "@/components/shared/underlined-link"

export function Footer() {
  return (
    <footer className="pt-24 pb-10 text-xs text-center text-muted-foreground">
      Made with ❤️ by{" "}
      <UnderlinedLink href={IFEANYI_URL}>Ifeanyi</UnderlinedLink>. Got{" "}
      <UnderlinedLink href={FEEDBACK_URL}>feedback</UnderlinedLink>?
    </footer>
  )
}
