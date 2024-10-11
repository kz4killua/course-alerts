import clsx from "clsx"


export function Container({
  children,
  className
} : {
  children: React.ReactNode,
  className?: string
}) {
  return (
    <div 
      className={clsx(
        "max-w-5xl mx-auto px-8 md:px-16", 
        className
      )}
    >
      {children}
    </div>
  )
}