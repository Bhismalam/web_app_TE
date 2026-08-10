import type { HTMLAttributes, ReactNode } from "react";

export default function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-black/5 bg-white p-6 shadow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/45">
      {children}
    </h2>
  );
}
