import Link from "next/link"

export function UnderlinedLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="font-medium underline underline-offset-4 hover:text-primary"
      target={getTarget(href)}
    >
      {children}
    </Link>
  )
}

function getTarget(href: string) {
  if (href.startsWith("#") || href.startsWith("/")) {
    return "_self"
  }
  return "_blank"
}
