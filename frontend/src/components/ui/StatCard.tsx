import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: "primary" | "gold" | "silver" | "bronze" | "green";
}
)  {
  const toneClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-gold/15 text-gold",
    silver: "bg-silver/15 text-slate-500",
    bronze: "bg-bronze/15 text-bronze",
    green: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
        <Icon size={20} />
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-foreground/50">{label}</p>
    </div>
  );
}
