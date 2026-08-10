import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-white shadow-soft hover:opacity-90 disabled:opacity-50",
  secondary:
    "bg-primary/10 text-primary hover:bg-primary/15 disabled:opacity-50",
  outline:
    "border border-black/10 bg-white text-foreground hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50",
  ghost:
    "text-foreground/60 hover:bg-black/5 hover:text-foreground disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:opacity-90 disabled:opacity-50",
};

export default function Button({
  variant = "primary",
  icon,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  icon?: ReactNode;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
