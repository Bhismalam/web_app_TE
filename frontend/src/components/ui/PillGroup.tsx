export default function PillGroup<T extends string>({
  options,
  value,
  onChange,
  labelFor,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labelFor: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
            opt === value
              ? "border-primary bg-primary text-white shadow-soft"
              : "border-black/10 text-foreground/65 hover:bg-black/5"
          }`}
        >
          {labelFor(opt)}
        </button>
      ))}
    </div>
  );
}
