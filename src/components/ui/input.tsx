import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "focus-ring h-10 w-full rounded-[14px] border border-[var(--color-border)] bg-white/[0.02] px-3.5 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-2)] transition-colors focus:border-[var(--color-primary)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
