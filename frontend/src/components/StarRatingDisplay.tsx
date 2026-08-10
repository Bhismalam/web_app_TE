import StarIcon from "./StarIcon";

export default function StarRatingDisplay({ value }: { value: number | null }) {
  if (value === null) return <span className="text-foreground/40">-</span>;
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} filled={star <= value} size={14} />
      ))}
    </span>
  );
}
