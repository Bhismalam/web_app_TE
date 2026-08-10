"use client";

import StarIcon from "./StarIcon";

export default function StarRatingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5"
            aria-label={`${label} ${star} bintang`}
          >
            <StarIcon filled={star <= value} size={22} />
          </button>
        ))}
      </div>
    </div>
  );
}
