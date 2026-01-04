import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "badge-retro transition-colors focus:outline-none focus:ring-2 focus:ring-plum-dark focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-sakura-light text-ink",
        primary: "bg-sakura-pink text-ink",
        secondary: "bg-white text-ink",
        accent: "bg-plum-dark text-white",
        success: "bg-matcha text-ink",
        warm: "bg-sake-warm text-ink",
        mist: "bg-sake-mist text-ink",
        // Sake type specific variants
        junmai: "bg-sakura-pink text-ink",
        ginjo: "bg-sake-mist text-ink",
        daiginjo: "bg-petal-light text-ink",
        honjozo: "bg-sake-warm text-ink",
        nigori: "bg-matcha text-ink",
        sparkling: "bg-sakura-light text-ink",
        yamahai: "bg-plum-dark text-white",
        kimoto: "bg-ink text-white",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
