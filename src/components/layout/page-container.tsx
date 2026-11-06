import { cn } from "@/lib/utils"

interface PageContainerProps extends React.ComponentProps<"div"> {
  maxWidth?: "default" | "full" | "narrow"
}

export function PageContainer({
  children,
  className,
  maxWidth = "default",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6",
        maxWidth === "default" && "max-w-7xl mx-auto",
        maxWidth === "narrow" && "max-w-4xl mx-auto",
        maxWidth === "full" && "max-w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

