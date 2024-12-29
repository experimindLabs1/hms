import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const ToggleSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    label: string
    leftLabel: string
    rightLabel: string
  }
>(({ className, label, leftLabel, rightLabel, ...props }, ref) => (
  <div className="flex flex-col space-y-2">
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-10 w-[200px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-9 w-[98px] rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[98px] data-[state=unchecked]:translate-x-0"
        )}
      />
      <span className="absolute left-3 text-sm font-medium transition-opacity data-[state=checked]:opacity-50 data-[state=unchecked]:opacity-100">
        {leftLabel}
      </span>
      <span className="absolute right-3 text-sm font-medium transition-opacity data-[state=checked]:opacity-100 data-[state=unchecked]:opacity-50">
        {rightLabel}
      </span>
    </SwitchPrimitives.Root>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
))
ToggleSwitch.displayName = SwitchPrimitives.Root.displayName

export { ToggleSwitch }
