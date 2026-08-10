export default function StarIcon({ filled, size = 20 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill={filled ? "#f5a623" : "none"}
      stroke={filled ? "#f5a623" : "#c4c9d4"}
      strokeWidth={1.5}
      strokeLinejoin="round"
    >
      <path d="M10 1.5l2.472 5.09 5.528.712-4 3.938.98 5.51L10 14.1l-4.98 2.65.98-5.51-4-3.938 5.528-.712z" />
    </svg>
  );
}
