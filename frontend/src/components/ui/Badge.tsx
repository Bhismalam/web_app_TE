import type { ReactNode } from "react";

type Tone = "gold" | "silver" | "bronze" | "primary" | "neutral" | "green" | "red";

const TONE_CLASSES: Record<Tone, string> = {
  gold: "bg-gold/15 text-gold",
  silver: "bg-silver/15 text-slate-500",
  bronze: "bg-bronze/15 text-bronze",
  primary: "bg-primary/10 text-primary",
  neutral: "bg-black/5 text-foreground/60",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
};

export default function Badge({
  tone = "neutral",
  icon,
  children,
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
