import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(({ className, variant = "primary", size = "md", ...props }, ref) => {
  const variants: Record<Variant, string> = {
    primary: "btn-primary",
    secondary: "bg-white/[0.06] text-[var(--color-foreground)] hover:bg-white/[0.1] rounded-[14px]",
    ghost: "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-white/[0.04] rounded-[14px]",
    outline:
      "border border-[var(--color-border)] hover:border-[var(--color-border-hover)] text-[var(--color-foreground)] rounded-[14px]",
  };
  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };
  return (
    <button
      ref={ref}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
