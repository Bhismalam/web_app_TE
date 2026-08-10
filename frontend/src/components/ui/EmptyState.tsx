import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5 text-foreground/40">
        <Icon size={22} />
      </div>
      <p className="mt-3 text-sm font-medium text-foreground/70">{title}</p>
      {description && <p className="mt-1 text-xs text-foreground/50">{description}</p>}
    </div>
  );
}
